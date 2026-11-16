const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureAfter() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_cap_post');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9235',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/focus-room'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9235/json');
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

    await send('Page.navigate', { url: 'http://localhost:3000/focus-room' });
    await new Promise(r => setTimeout(r, 1500));
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1366,
      height: 4000,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Runtime.evaluate', {
      expression: 'document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden";'
    });
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    await new Promise(r => setTimeout(r, 1000));

    const docSize = await send('Runtime.evaluate', {
      expression: `({
        width: document.documentElement.clientWidth,
        height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      })`,
      returnByValue: true
    });
    console.log('Focus Room full size at 1366 after edit:', docSize.result.value);

    const shotFocus = await send('Page.captureScreenshot', {
      format: 'png',
      clip: {
        x: 0,
        y: 0,
        width: 1366,
        height: docSize.result.value.height,
        scale: 1
      },
      captureBeyondViewport: true
    });
    fs.writeFileSync('design-reference/compare/focus_1366_after.png', Buffer.from(shotFocus.data, 'base64'));
    console.log('Saved design-reference/compare/focus_1366_after.png');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

captureAfter().catch(console.error);
