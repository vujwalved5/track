// scripts/eval_cdp.js
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tmpDir = path.resolve('tmp_cdp_eval');
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9223',
    `--user-data-dir=${tmpDir}`,
    '--window-size=390,7000',
    'http://localhost:3000/'
  ]);

  // wait for chrome to start
  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9223/json');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab || !pageTab.webSocketDebuggerUrl) {
      console.log('No page tab found with ws url');
      return;
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    // Evaluate script
    const evalResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('[aria-label="Compass rose indicator"]');
          if (!el) return { found: false };
          const rect = el.getBoundingClientRect();
          const p = el.parentElement;
          const pRect = p ? p.getBoundingClientRect() : null;
          return {
            found: true,
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            parentRect: pRect ? { x: pRect.x, y: pRect.y, width: pRect.width, height: pRect.height } : null,
            computedWidth: window.getComputedStyle(el).width,
            computedHeight: window.getComputedStyle(el).height,
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            opacity: window.getComputedStyle(el).opacity
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Eval result:', JSON.stringify(evalResult.result.value, null, 2));

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

main().catch(console.error);
