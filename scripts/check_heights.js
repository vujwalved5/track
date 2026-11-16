const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function checkHeights() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_heights');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9239',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9239/json');
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

    const targets = [
      { name: 'design_a', port: 3001 },
      { name: 'design_b', port: 3002 },
      { name: 'design_c', port: 3003 }
    ];

    for (const target of targets) {
      await send('Page.navigate', { url: `http://localhost:${target.port}/focus-room` });
      await new Promise(r => setTimeout(r, 1200));
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false
      });
      const evalRes = await send('Runtime.evaluate', {
        expression: `({
          scrollWidth: document.documentElement.scrollWidth,
          scrollHeight: document.documentElement.scrollHeight,
          bodyScrollHeight: document.body.scrollHeight,
          clientHeight: document.documentElement.clientHeight
        })`,
        returnByValue: true
      });
      console.log(target.name, 'at 1024x800:', evalRes.result.value);

      // Full-page screenshot at 1024 width:
      const fullHeight = Math.max(evalRes.result.value.scrollHeight, evalRes.result.value.bodyScrollHeight);
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: fullHeight,
        deviceScaleFactor: 1,
        mobile: false
      });
      const fullShot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1024, height: fullHeight, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_full_1024.png`, Buffer.from(fullShot.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_full_1024.png (${fullHeight}px high)`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

checkHeights().catch(console.error);
