const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_cap_pre');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9228',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/focus-room'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9228/json');
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

    // 1. Capture Focus Room at 1366
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
    console.log('Focus Room full size at 1366:', docSize.result.value);

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
    fs.writeFileSync('design-reference/compare/focus_1366_before.png', Buffer.from(shotFocus.data, 'base64'));
    console.log('Saved design-reference/compare/focus_1366_before.png');

    // Helper to capture Home footer
    async function captureHomeFooter(width, mobile, filename) {
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
      console.log(`Home footer at ${width}:`, footerRect.result.value);
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

    await captureHomeFooter(1366, false, 'design-reference/compare/home_footer_1366_before.png');
    await captureHomeFooter(768, false, 'design-reference/compare/home_footer_768_before.png');
    await captureHomeFooter(390, true, 'design-reference/compare/home_footer_390_before.png');

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

capture().catch(console.error);
