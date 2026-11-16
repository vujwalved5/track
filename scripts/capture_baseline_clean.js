const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureBaselines() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_baseline');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const baselineDir = path.resolve('design-reference/baseline');
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9244',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9244/json');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            if (msg.error) {
              reject(new Error(JSON.stringify(msg.error)));
            } else {
              resolve(msg.result);
            }
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    const tasks = [
      { url: 'http://localhost:3000/', width: 1366, file: 'home-1366.png' },
      { url: 'http://localhost:3000/', width: 768, file: 'home-768.png' },
      { url: 'http://localhost:3000/', width: 390, file: 'home-390.png' },
      { url: 'http://localhost:3000/focus-room', width: 1366, file: 'focus-1366.png' },
      { url: 'http://localhost:3000/focus-room', width: 768, file: 'focus-768.png' },
      { url: 'http://localhost:3000/focus-room', width: 390, file: 'focus-390.png' },
    ];

    for (const t of tasks) {
      console.log(`Capturing ${t.url} at ${t.width}px -> ${t.file}...`);
      await send('Page.navigate', { url: t.url });
      await new Promise(r => setTimeout(r, 1500));

      await send('Emulation.setDeviceMetricsOverride', {
        width: t.width,
        height: 1200,
        deviceScaleFactor: 1,
        mobile: t.width <= 500
      });

      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 1000));

      const docSizeRes = await send('Runtime.evaluate', {
        expression: `({
          width: ${t.width},
          height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, document.documentElement.offsetHeight)
        })`,
        returnByValue: true
      });
      const docHeight = docSizeRes.result.value.height;
      console.log(`Document full height: ${docHeight}px`);

      await send('Emulation.setDeviceMetricsOverride', {
        width: t.width,
        height: docHeight,
        deviceScaleFactor: 1,
        mobile: t.width <= 500
      });
      await new Promise(r => setTimeout(r, 500));

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: 0,
          y: 0,
          width: t.width,
          height: docHeight,
          scale: 1
        },
        captureBeyondViewport: true
      });

      const outPath = path.join(baselineDir, t.file);
      const buf = Buffer.from(shot.data, 'base64');
      fs.writeFileSync(outPath, buf);
      console.log(`Saved ${outPath} (${buf.length} bytes)`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

captureBaselines()
  .then(() => {
    console.log('All baseline captures complete.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Capture error:', err);
    process.exit(1);
  });
