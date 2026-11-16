// scripts/qa_verify_all_overflow.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9229;
const TMP_DIR = path.resolve('tmp_cdp_overflow');

const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 1000 },
  { name: 'desktop-1366', width: 1366, height: 1000 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'desktop-1536', width: 1536, height: 1000 },
  { name: 'desktop-1600', width: 1600, height: 1000 },
  { name: 'desktop-1920', width: 1920, height: 1200 },
  { name: 'desktop-2560', width: 2560, height: 1440 }
];

async function run() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TMP_DIR}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch(`http://localhost:${PORT}/json`);
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab found');
    
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

    const pages = [
      { name: 'Home', url: 'http://localhost:3000/' },
      { name: 'FocusRoom', url: 'http://localhost:3000/focus-room' }
    ];

    const allResults = {};

    for (const page of pages) {
      console.log(`\n========================================================`);
      console.log(`CHECKING HORIZONTAL OVERFLOW: ${page.name} (${page.url})`);
      console.log(`========================================================`);

      await send('Page.navigate', { url: page.url });
      await new Promise(r => setTimeout(r, 2500));

      const pageRes = [];

      for (const vp of VIEWPORTS) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width <= 768
        });
        await new Promise(r => setTimeout(r, 500));

        const metrics = await send('Runtime.evaluate', {
          expression: `
            (function() {
              const docEl = document.documentElement;
              const scrollWidth = docEl.scrollWidth;
              const clientWidth = docEl.clientWidth;
              const innerWidth = window.innerWidth;
              const hasOverflow = scrollWidth > innerWidth + 1; // 1px threshold for fractional rounding
              
              // Find offending elements if overflow exists
              let overflowElements = [];
              if (hasOverflow) {
                const all = document.querySelectorAll('*');
                for (const el of all) {
                  const r = el.getBoundingClientRect();
                  if (r.right > innerWidth + 1) {
                    overflowElements.push({
                      tag: el.tagName.toLowerCase(),
                      cls: (el.className || '').slice(0, 50),
                      right: r.right,
                      overflowBy: r.right - innerWidth
                    });
                  }
                }
              }

              return {
                scrollWidth,
                clientWidth,
                innerWidth,
                hasOverflow,
                overflowBy: Math.max(0, scrollWidth - innerWidth),
                overflowElements: overflowElements.slice(0, 5)
              };
            })()
          `,
          returnByValue: true
        });

        const m = metrics.result.value;
        const statusStr = !m.hasOverflow ? '✓ 0 OVERFLOW' : `✗ OVERFLOW by ${m.overflowBy}px`;
        console.log(`  [${vp.name}] ${vp.width}x${vp.height} => docWidth=${m.scrollWidth}, winWidth=${m.innerWidth} : ${statusStr}`);
        if (m.hasOverflow) {
          console.log(`    Offenders:`, m.overflowElements);
        }

        pageRes.push({
          viewport: vp.name,
          width: vp.width,
          scrollWidth: m.scrollWidth,
          hasOverflow: m.hasOverflow,
          overflowBy: m.overflowBy
        });
      }

      allResults[page.name] = pageRes;
    }

    fs.writeFileSync('scripts/qa_overflow_report.json', JSON.stringify(allResults, null, 2));
    console.log(`\nReport written to scripts/qa_overflow_report.json`);
    ws.close();
    chromeProc.kill();
  } catch (err) {
    console.error('Overflow test error:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
