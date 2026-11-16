const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testClip() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_clip');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9250',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3001/focus-room'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9250/json');
    const tabs = await res.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(m, p={}) {
      return new Promise(r => {
        const cur = id++;
        const h = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === cur) { ws.removeEventListener('message', h); r(msg.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method: m, params: p }));
      });
    }

    await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 614, deviceScaleFactor: 1, mobile: false });
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    await new Promise(r => setTimeout(r, 500));

    // Scroll to 1137
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 1137)' });
    await new Promise(r => setTimeout(r, 500));

    // Capture screenshot WITHOUT clip (captures viewport!)
    const shotViewport = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('screenshots/test_viewport_design_a.png', Buffer.from(shotViewport.data, 'base64'));
    console.log('Saved screenshots/test_viewport_design_a.png');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

testClip().catch(console.error);
