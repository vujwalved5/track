// scripts/capture_current_home.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9228;
const TMP_DIR = path.resolve('tmp_cdp_cap');

const VIEWPORTS = [
  { name: 'home-1366', width: 1366, height: 1000 },
  { name: 'home-768', width: 768, height: 1024 },
  { name: 'home-390', width: 390, height: 844 },
  { name: 'home-1920', width: 1920, height: 1200 }
];

async function capture() {
  if (!fs.existsSync('scripts/output')) {
    fs.mkdirSync('scripts/output', { recursive: true });
  }

  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    '--hide-scrollbars',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + TMP_DIR,
    'http://localhost:3000/'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch(`http://localhost:${PORT}/json`);
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(m, p={}) {
    return new Promise(r => {
      const cur = id++;
      const h = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === cur) {
          ws.removeEventListener('message', h);
          r(msg.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({id: cur, method: m, params: p}));
    });
  }

  for (const vp of VIEWPORTS) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 1,
      mobile: vp.width < 768
    });
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 2000));

    // Get layout metrics for full page screenshot
    const metrics = await send('Page.getLayoutMetrics');
    const contentHeight = Math.ceil(metrics.contentSize.height);

    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: contentHeight,
      deviceScaleFactor: 1,
      mobile: vp.width < 768
    });

    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true
    });

    const buf = Buffer.from(screenshot.data, 'base64');
    fs.writeFileSync(`scripts/output/${vp.name}.png`, buf);
    console.log(`Saved scripts/output/${vp.name}.png (${vp.width}x${contentHeight})`);
  }

  ws.close();
  proc.kill();
}

capture();
