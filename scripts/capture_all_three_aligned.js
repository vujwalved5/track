const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function captureAllThreeAligned() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_aligned_final');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9251',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9251/json');
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

    const targets = [
      { name: 'design_a', port: 3001, title: 'Design A: The Ledger' },
      { name: 'design_b', port: 3002, title: 'Design B: Dial-First' },
      { name: 'design_c', port: 3003, title: 'Design C: Session Strip' }
    ];

    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }

    for (const target of targets) {
      console.log(`Processing ${target.title}...`);
      await send('Page.navigate', { url: `http://localhost:${target.port}/focus-room` });
      await new Promise(r => setTimeout(r, 1500));

      // Viewport matching the given image's webpage area: width 1024, height 571
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 571,
        deviceScaleFactor: 1,
        mobile: false
      });
      await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
      await new Promise(r => setTimeout(r, 500));

      // Align scroll so the dark card top is at exactly y = 94 (matching baseline!)
      const align = await send('Runtime.evaluate', {
        expression: `(() => {
          const span = Array.from(document.querySelectorAll("span")).find(s => s.textContent.includes("FOCUS SESSION"));
          let card = span;
          while (card && card.parentElement && card.parentElement.id !== "practice" && !card.className.includes("lg:col-span-8")) {
            card = card.parentElement;
          }
          if (!card) return { error: "card not found" };
          const rect = card.getBoundingClientRect();
          // We want rect.top to be exactly 94
          const delta = rect.top - 94;
          window.scrollBy(0, delta);
          const newRect = card.getBoundingClientRect();
          return { originalTop: rect.top, delta, newTop: newRect.top, cardHeight: newRect.height };
        })()`,
        returnByValue: true
      });
      console.log(`${target.name} alignment:`, align.result.value);
      await new Promise(r => setTimeout(r, 600));

      // Capture matching 1024x571 viewport
      const shot571 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`screenshots/${target.name}_match_571.png`, Buffer.from(shot571.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_match_571.png`);

      // Also capture full view of cards (taller viewport 1024x720) so the entire companion panel is visible
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 720,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 500));
      const shot720 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(`screenshots/${target.name}_match_720.png`, Buffer.from(shot720.data, 'base64'));
      console.log(`Saved screenshots/${target.name}_match_720.png`);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

captureAllThreeAligned().catch(console.error);
