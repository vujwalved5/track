const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_eval_metrics');
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9226',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9226/json');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
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

    // Set mobile viewport 390x844
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: true
    });

    // Evaluate window.innerWidth and document.documentElement.scrollWidth
    const dims = await send('Runtime.evaluate', {
      expression: `
        (() => {
          return {
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            scrollHeight: document.documentElement.scrollHeight
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Dims with emulation:', dims.result.value);

    // Let's also check the compass rose bounding box now!
    const compass = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.querySelector('[aria-label="Compass rose indicator"]');
          if (!el) return { found: false };
          const r = el.getBoundingClientRect();
          return {
            found: true,
            x: Math.round(r.x),
            y: Math.round(r.y),
            w: Math.round(r.width),
            h: Math.round(r.height),
            right: Math.round(r.right)
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Compass with emulation:', compass.result.value);

    ws.close();
  } finally {
    chromeProc.kill();
  }
}
main().catch(console.error);
