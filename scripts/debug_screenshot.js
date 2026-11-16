const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function debugCapture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_debug');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9248',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9248/json');
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
      console.log(`Loading ${target.name}...`);
      await send('Page.navigate', { url: `http://localhost:${target.port}/focus-room` });
      await new Promise(r => setTimeout(r, 1500));

      // 1024 x 614 - matches user's uploaded image exactly!
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 614,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 500));

      const scrollInfo = await send('Runtime.evaluate', {
        expression: `(() => {
          // Find the two cards container inside #practice
          const practice = document.getElementById("practice");
          if (!practice) return { error: "no practice" };
          const cardsContainer = practice.querySelector(".grid.grid-cols-1.lg\\\\:grid-cols-12.gap-8.items-start");
          if (!cardsContainer) return { error: "no cards container" };
          
          // Scroll so the cardsContainer top sits ~95px below the top (just beneath sticky nav)
          cardsContainer.scrollIntoView(true);
          // Now offset for the sticky nav (95px)
          window.scrollBy(0, -100);
          
          const rect = cardsContainer.getBoundingClientRect();
          return {
            windowScrollY: window.scrollY,
            containerTop: rect.top,
            containerHeight: rect.height,
            containerWidth: rect.width
          };
        })()`,
        returnByValue: true
      });
      console.log(target.name, 'scrollInfo:', scrollInfo.result.value);
      await new Promise(r => setTimeout(r, 800));

      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1024, height: 614, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_cards_1024x614.png`, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_cards_1024x614.png`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

debugCapture().catch(console.error);
