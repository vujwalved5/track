const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureMatchingCards() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_match');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9247',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9247/json');
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
      await new Promise(r => setTimeout(r, 1500));

      // Match the exact viewport of the user's browser: 1024 width, 571 height
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 571,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 500));

      // Scroll so that the dark timer card top aligns at y = 94 in the viewport (matching the baseline!)
      const scrollResult = await send('Runtime.evaluate', {
        expression: `(() => {
          const span = Array.from(document.querySelectorAll("span")).find(s => s.textContent.includes("FOCUS SESSION /") || s.textContent.includes("FOCUS SESSION"));
          if (!span) return { error: "span not found" };
          let card = span;
          while (card && card.parentElement && card.parentElement.id !== "practice" && !card.className.includes("lg:col-span-8")) {
            card = card.parentElement;
          }
          const rect = card.getBoundingClientRect();
          const currentCardTop = rect.top;
          // In the baseline image, the dark card top is at y = 94
          const targetY = 94;
          const diff = currentCardTop - targetY;
          window.scrollBy({ top: diff, behavior: 'instant' });
          const newRect = card.getBoundingClientRect();
          return { currentCardTop, targetY, diff, newTop: newRect.top, newHeight: newRect.height };
        })()`,
        returnByValue: true
      });
      console.log(target.name, 'scrolled alignment:', scrollResult.result.value);
      await new Promise(r => setTimeout(r, 800));

      // Capture screenshot at 1024x571 (exact webpage area matching given image)
      const shot = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1024, height: 571, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_aligned_571.png`, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_aligned_571.png`);

      // Also capture a taller view at height 720 to show the full cards if they are taller
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 720,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 500));
      const shotTaller = await send('Page.captureScreenshot', {
        format: 'png',
        clip: { x: 0, y: 0, width: 1024, height: 720, scale: 1 }
      });
      fs.writeFileSync(`screenshots/${target.name}_aligned_720.png`, Buffer.from(shotTaller.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_aligned_720.png`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

captureMatchingCards().catch(console.error);
