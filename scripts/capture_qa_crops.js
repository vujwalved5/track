// scripts/capture_qa_crops.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9230;
const TMP_DIR = path.resolve('tmp_cdp_qa_crops');
const COMPARE_DIR = path.resolve('design-reference/compare');

async function run() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
  if (!fs.existsSync(COMPARE_DIR)) {
    fs.mkdirSync(COMPARE_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TMP_DIR}`,
    'http://localhost:3000/focus-room'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch(`http://localhost:${PORT}/json`);
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab found');
    
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 2000));

    // Helper to capture bounding rect crop
    async function captureElement(selector, filename) {
      const rectEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const el = document.querySelector('${selector}');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height };
          })()
        `,
        returnByValue: true
      });
      const rect = rectEval.result.value;
      if (!rect) {
        console.error(`Element not found: ${selector}`);
        return;
      }

      const clip = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        scale: 1
      };

      const shot = await send('Page.captureScreenshot', { clip });
      fs.writeFileSync(path.join(COMPARE_DIR, filename), Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${filename} (${rect.width}x${rect.height})`);
    }

    // 1. Initial Timer Card
    await captureElement('[aria-live="polite"]', 'focus-timer-display.png');
    // Whole timer card container
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const el = document.querySelector('[aria-live="polite"]')?.closest('.bg-\\[\\#172536\\]');
          if (el) el.id = 'qa-timer-card';
        })()
      `
    });
    await captureElement('#qa-timer-card', 'focus-timer-card-default.png');

    // 2. Start timer, wait 3 seconds, capture running state
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'START');
          if (startBtn) startBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 3000));
    await captureElement('#qa-timer-card', 'focus-timer-card-running.png');

    // 3. Switch to Short Break tab
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const sbTab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.innerText.includes('SHORT BREAK'));
          if (sbTab) sbTab.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));
    await captureElement('#qa-timer-card', 'focus-timer-card-shortbreak.png');

    // 4. Capture Sound Player initial state
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const el = document.querySelector('input[type="range"]')?.closest('.bg-\\[\\#172536\\]');
          if (el) el.id = 'qa-sound-card';
        })()
      `
    });
    await captureElement('#qa-sound-card', 'focus-sound-card-default.png');

    // 5. Select DEEP FOCUS, start playback
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const chip = Array.from(document.querySelectorAll('button[role="radio"]')).find(c => c.innerText.includes('DEEP FOCUS'));
          if (chip) chip.click();
          const playBtn = document.querySelector('button[aria-label*="ambient focus sound"]');
          if (playBtn) playBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 800));
    await captureElement('#qa-sound-card', 'focus-sound-card-playing.png');

    ws.close();
    chromeProc.kill();
    console.log('Finished capturing QA interactive crops!');
  } catch (err) {
    console.error('Capture error:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
