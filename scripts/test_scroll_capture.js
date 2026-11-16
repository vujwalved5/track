const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testScrollCapture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_scroll');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9241',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9241/json');
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

      // Set viewport to 1024 x 614 (the exact resolution of user's uploaded image!)
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 614,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 500));

      // Find the position of the timer card or scroll so that the top of the dark card is right under the nav
      const cardInfo = await send('Runtime.evaluate', {
        expression: `(() => {
          // Find the container with the two cards
          const timer = document.querySelector('#practice') || document.querySelector('section:nth-of-type(2)');
          // Or find the dark card
          const cards = document.querySelectorAll('div');
          let darkCard = null;
          for (const d of cards) {
            if (d.textContent.includes('FOCUS SESSION') && (d.textContent.includes('START') || d.textContent.includes('RESUME'))) {
              if (d.offsetWidth > 400 && d.offsetHeight > 300) {
                darkCard = d;
                break;
              }
            }
          }
          if (darkCard) {
            const rect = darkCard.getBoundingClientRect();
            // We want the top of darkCard to be around y = 110 (just under the sticky nav which is ~95px)
            const targetScrollY = window.scrollY + rect.top - 110;
            window.scrollTo({ top: targetScrollY, behavior: 'instant' });
            return { found: true, targetScrollY, rect: darkCard.getBoundingClientRect() };
          }
          return { found: false };
        })()`,
        returnByValue: true
      });
      console.log(target.name, 'scroll result:', cardInfo.result.value);
      await new Promise(r => setTimeout(r, 600));

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1024, height: 614, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_exact_match.png`, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_exact_match.png`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

testScrollCapture().catch(console.error);
