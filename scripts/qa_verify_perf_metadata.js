// scripts/qa_verify_perf_metadata.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9228;
const TMP_DIR = path.resolve('tmp_cdp_qa_metadata');

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
    await send('Performance.enable');

    const pages = ['http://localhost:3000/', 'http://localhost:3000/focus-room'];
    const results = {};

    for (const pageUrl of pages) {
      console.log(`\n==================================================`);
      console.log(`METADATA & PERFORMANCE AUDIT: ${pageUrl}`);
      console.log(`==================================================`);

      await send('Page.navigate', { url: pageUrl });
      await new Promise(r => setTimeout(r, 2500));

      // 1. Metadata check
      const metaEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const getMeta = (name, prop) => {
              const el = document.querySelector(\`meta[name="\${name}"], meta[property="\${prop || name}"]\`);
              return el ? el.getAttribute('content') : null;
            };

            const title = document.title;
            const description = getMeta('description');
            const favicon = document.querySelector('link[rel*="icon"]')?.getAttribute('href') || null;
            
            // Open Graph
            const ogTitle = getMeta('og:title');
            const ogDesc = getMeta('og:description');
            const ogType = getMeta('og:type');
            const ogImage = getMeta('og:image');
            const ogUrl = getMeta('og:url');

            // Twitter Cards
            const twitterCard = getMeta('twitter:card');
            const twitterTitle = getMeta('twitter:title');

            return {
              title,
              description,
              favicon,
              og: { ogTitle, ogDesc, ogType, ogImage, ogUrl },
              twitter: { twitterCard, twitterTitle }
            };
          })()
        `,
        returnByValue: true
      });
      const meta = metaEval.result.value;
      console.log(`Title: "${meta.title}" (${meta.title ? '✓ Present' : '✗ Missing'})`);
      console.log(`Description: "${meta.description}" (${meta.description ? '✓ Present' : '✗ Missing'})`);
      console.log(`Favicon: "${meta.favicon}" (${meta.favicon ? '✓ Present' : '✗ Missing'})`);
      console.log(`Open Graph:`, meta.og);

      // 2. Font check: verified Next/Font usage
      const fontEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const fontLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
            const externalFontLinks = fontLinks.filter(href => href.includes('fonts.googleapis.com') || href.includes('typekit'));
            
            // Check computed styles and next/font classes on html / body
            const htmlClasses = document.documentElement.className;
            const bodyClasses = document.body.className;
            const hasNextFontClasses = /__className_|font-/.test(htmlClasses + ' ' + bodyClasses);

            return {
              fontLinks,
              externalFontLinks,
              htmlClasses,
              hasNextFontClasses
            };
          })()
        `,
        returnByValue: true
      });
      const fontData = fontEval.result.value;
      console.log(`Next/Font Loading: ${fontData.externalFontLinks.length === 0 ? '✓ PASS (Zero external font stylesheets)' : '✗ FAIL (External font links found)'}`);
      console.log(`  HTML Classes: ${fontData.htmlClasses}`);

      // 3. Layout Shift (CLS) check
      const clsEval = await send('Runtime.evaluate', {
        expression: `
          new Promise((resolve) => {
            let clsValue = 0;
            const observer = new PerformanceObserver((entryList) => {
              for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                }
              }
            });
            try {
              observer.observe({ type: 'layout-shift', buffered: true });
            } catch (e) {}
            setTimeout(() => {
              observer.disconnect();
              resolve(clsValue);
            }, 500);
          })
        `,
        awaitPromise: true,
        returnByValue: true
      });
      const cls = clsEval.result.value;
      console.log(`Cumulative Layout Shift (CLS): ${cls} (${cls <= 0.05 ? '✓ EXCELLENT' : '⚠ High CLS'})`);

      // 4. Image sizes and optimization check
      const imgEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            return Array.from(document.querySelectorAll('img')).map(img => ({
              src: img.currentSrc,
              width: img.naturalWidth,
              height: img.naturalHeight,
              displayWidth: img.clientWidth,
              displayHeight: img.clientHeight,
              loading: img.loading,
              decoding: img.decoding
            }));
          })()
        `,
        returnByValue: true
      });
      const imgData = imgEval.result.value;
      console.log(`Images on page (${imgData.length} total):`);
      imgData.forEach((img, i) => {
        const isNextImage = img.src && (img.src.includes('/_next/image') || img.src.includes('w='));
        console.log(`  Img[${i}]: natural=${img.width}x${img.height}, display=${img.displayWidth}x${img.displayHeight}, nextImage=${isNextImage}, src=${img.src.slice(0, 80)}...`);
      });

      results[pageUrl] = {
        meta,
        fontData,
        cls,
        imgData
      };
    }

    fs.writeFileSync('scripts/qa_perf_metadata_report.json', JSON.stringify(results, null, 2));
    console.log(`\nReport saved to scripts/qa_perf_metadata_report.json`);
    ws.close();
    chromeProc.kill();
  } catch (err) {
    console.error('Metadata/perf error:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
