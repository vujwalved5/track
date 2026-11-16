const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureAll() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_designs');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9238',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9238/json');
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

    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    for (const target of targets) {
      console.log(`Navigating to ${target.name} at port ${target.port}...`);
      await send('Page.navigate', { url: `http://localhost:${target.port}/focus-room` });
      await new Promise(r => setTimeout(r, 1500));

      // Viewport matching the given image (1024x571)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 571,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 800));

      const shotMatched = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1024, height: 571, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_1024x571.png`, Buffer.from(shotMatched.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_1024x571.png`);

      // Viewport standard desktop (1280x750)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 750,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 500));

      const shot1280 = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1280, height: 750, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_1280x750.png`, Buffer.from(shot1280.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_1280x750.png`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

captureAll().catch(console.error);
