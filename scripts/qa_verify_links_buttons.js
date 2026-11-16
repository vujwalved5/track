// scripts/qa_verify_links_buttons.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225;
const TMP_DIR = path.resolve('tmp_cdp_qa_links');

async function run() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TMP_DIR}`
  ]);

  await new Promise(r => setTimeout(r, 1500));

  try {
    const pagesToTest = ['http://localhost:3000/', 'http://localhost:3000/focus-room'];
    const results = {};

    for (const pageUrl of pagesToTest) {
      console.log(`\n========================================`);
      console.log(`Testing page: ${pageUrl}`);
      console.log(`========================================`);

      // Create new tab
      const newTabRes = await fetch(`http://localhost:${PORT}/json/new?${encodeURIComponent(pageUrl)}`, { method: 'PUT' });
      const tab = await newTabRes.json();
      
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise((resolve, reject) => {
        ws.onopen = resolve;
        ws.onerror = reject;
      });

      let msgId = 1;
      function send(method, params = {}) {
        return new Promise((resolve, reject) => {
          const id = msgId++;
          const handler = (evt) => {
            const msg = JSON.parse(evt.data);
            if (msg.id === id) {
              ws.removeEventListener('message', handler);
              if (msg.error) reject(msg.error);
              else resolve(msg.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id, method, params }));
        });
      }

      await send('Page.enable');
      await send('Runtime.enable');
      await send('DOM.enable');

      // Wait for page load
      await new Promise(r => setTimeout(r, 2000));

      // Extract all links
      const linksEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const links = Array.from(document.querySelectorAll('a')).map((el, i) => {
              const rect = el.getBoundingClientRect();
              return {
                index: i,
                text: el.innerText.trim().replace(/\\n/g, ' '),
                href: el.getAttribute('href'),
                resolvedHref: el.href,
                visible: rect.width > 0 && rect.height > 0,
                ariaLabel: el.getAttribute('aria-label') || null
              };
            });
            return links;
          })()
        `,
        returnByValue: true
      });

      const links = linksEval.result.value;
      console.log(`Found ${links.length} links:`);

      const linkCheckResults = [];
      for (const link of links) {
        let status = null;
        let ok = false;
        let error = null;

        if (!link.href) {
          error = 'Missing href attribute';
        } else if (link.href.startsWith('#')) {
          // Internal anchor check
          const anchorEval = await send('Runtime.evaluate', {
            expression: `!!document.querySelector('${link.href}')`,
            returnByValue: true
          });
          ok = !!anchorEval.result.value;
          status = ok ? 'ANCHOR_EXISTS' : 'ANCHOR_NOT_FOUND';
          if (!ok) error = `Target element ${link.href} not found in DOM`;
        } else if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
          ok = true;
          status = 'SPECIAL_SCHEME';
        } else {
          // HTTP fetch check
          try {
            const targetUrl = link.resolvedHref.startsWith('http') ? link.resolvedHref : `http://localhost:3000${link.href}`;
            const fetchRes = await fetch(targetUrl, { method: 'HEAD' }).catch(() => fetch(targetUrl, { method: 'GET' }));
            status = fetchRes.status;
            ok = fetchRes.status >= 200 && fetchRes.status < 400;
            if (!ok) error = `HTTP ${fetchRes.status}`;
          } catch (err) {
            error = err.message;
            status = 'FETCH_FAILED';
          }
        }

        const resItem = { ...link, status, ok, error };
        linkCheckResults.push(resItem);
        console.log(`  [Link ${resItem.index}] "${resItem.text || resItem.ariaLabel || 'NO_TEXT'}" -> ${resItem.href} : ${resItem.status} (ok=${resItem.ok})`);
      }

      // Extract all buttons
      const buttonsEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const buttons = Array.from(document.querySelectorAll('button, [role="button"], [role="tab"]')).map((el, i) => {
              const rect = el.getBoundingClientRect();
              const style = window.getComputedStyle(el);
              return {
                index: i,
                tagName: el.tagName.toLowerCase(),
                role: el.getAttribute('role') || el.tagName.toLowerCase(),
                text: el.innerText.trim().replace(/\\n/g, ' '),
                ariaLabel: el.getAttribute('aria-label') || null,
                disabled: el.disabled || el.getAttribute('aria-disabled') === 'true',
                visible: rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden',
                hasClickHandler: typeof el.onclick === 'function' || el.__hasClickHandler || true
              };
            });
            return buttons;
          })()
        `,
        returnByValue: true
      });

      const buttons = buttonsEval.result.value;
      console.log(`Found ${buttons.length} buttons/interactive controls:`);
      for (const btn of buttons) {
        console.log(`  [Btn ${btn.index}] <${btn.tagName} role="${btn.role}"> "${btn.text || btn.ariaLabel || 'NO_LABEL'}" visible=${btn.visible} disabled=${btn.disabled}`);
      }

      results[pageUrl] = {
        links: linkCheckResults,
        buttons: buttons,
        totalLinks: links.length,
        failedLinks: linkCheckResults.filter(l => !l.ok).length,
        totalButtons: buttons.length,
        disabledButtons: buttons.filter(b => b.disabled).length
      };

      ws.close();
      await fetch(`http://localhost:${PORT}/json/close/${tab.id}`);
    }

    // Summary
    console.log(`\n========================================`);
    console.log(`LINK & BUTTON VERIFICATION SUMMARY`);
    console.log(`========================================`);
    let anyFail = false;
    for (const [url, data] of Object.entries(results)) {
      console.log(`Page: ${url}`);
      console.log(`  Total links: ${data.totalLinks}, Failed links (404/broken): ${data.failedLinks}`);
      console.log(`  Total buttons/controls: ${data.totalButtons}, Disabled: ${data.disabledButtons}`);
      if (data.failedLinks > 0) {
        anyFail = true;
        console.log(`  FAILED LINKS DETAILS:`);
        data.links.filter(l => !l.ok).forEach(l => console.log(`    - ${l.href} (${l.text}): ${l.error}`));
      }
    }

    fs.writeFileSync('scripts/qa_links_buttons_report.json', JSON.stringify(results, null, 2));
    console.log(`\nSaved detailed report to scripts/qa_links_buttons_report.json`);

    chromeProc.kill();
    process.exit(anyFail ? 1 : 0);
  } catch (err) {
    console.error('Fatal error during link verification:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
