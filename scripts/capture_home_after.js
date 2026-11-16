const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testDiff() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_diff');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9229',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9229/json');
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

    async function captureFooter(width, mobile, filename) {
      await send('Page.navigate', { url: 'http://localhost:3000/' });
      await new Promise(r => setTimeout(r, 1500));
      await send('Emulation.setDeviceMetricsOverride', {
        width: width,
        height: 4000,
        deviceScaleFactor: 1,
        mobile: mobile
      });
      await send('Runtime.evaluate', {
        expression: 'document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden";'
      });
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 1000));

      const footerRect = await send('Runtime.evaluate', {
        expression: `(() => {
          const f = document.querySelector('footer');
          if (!f) return null;
          const r = f.getBoundingClientRect();
          return {
            x: Math.round(r.x),
            y: Math.round(r.y + window.pageYOffset),
            width: Math.round(r.width),
            height: Math.round(r.height)
          };
        })()`,
        returnByValue: true
      });
      const rect = footerRect.result.value;

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: 0,
          y: rect.y,
          width: width,
          height: rect.height,
          scale: 1
        },
        captureBeyondViewport: true
      });
      fs.writeFileSync(filename, Buffer.from(shot.data, 'base64'));
      console.log(`Saved ${filename}`);
    }

    await captureFooter(1366, false, 'design-reference/compare/home_footer_1366_after.png');
    await captureFooter(768, false, 'design-reference/compare/home_footer_768_after.png');
    await captureFooter(390, true, 'design-reference/compare/home_footer_390_after.png');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

testDiff().catch(console.error);
