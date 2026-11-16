const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_cap');
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9227',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9227/json');
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

    // Set mobile viewport 390
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 1000,
      deviceScaleFactor: 1,
      mobile: true
    });

    // Get bounding rect of #trace
    const rectRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const el = document.getElementById('trace');
          const r = el.getBoundingClientRect();
          return {
            x: Math.round(r.x),
            y: Math.round(r.y + window.pageYOffset),
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        })()
      `,
      returnByValue: true
    });

    const rect = rectRes.result.value;
    console.log('Section 03 rect:', rect);

    // Capture screenshot of #trace area
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 0,
        y: rect.y,
        width: 390,
        height: rect.height,
        scale: 1
      },
      captureBeyondViewport: true
    });

    const buffer = Buffer.from(shot.data, 'base64');
    fs.writeFileSync('design-reference/compare/home-16c-sec03-390.png', buffer);
    console.log('Saved design-reference/compare/home-16c-sec03-390.png');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}
main().catch(console.error);
