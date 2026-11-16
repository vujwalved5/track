// scripts/capture_focus_widgets.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9231;
const TMP_DIR = path.resolve('tmp_cdp_widgets');
const COMPARE_DIR = path.resolve('design-reference/compare');

async function run() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
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

    async function captureByEval(getRectExpr, filename) {
      const rectEval = await send('Runtime.evaluate', {
        expression: getRectExpr,
        returnByValue: true
      });
      const rect = rectEval.result.value;
      if (!rect || !rect.width || !rect.height) {
        console.error(`Could not get rect for ${filename}`);
        return;
      }
      await new Promise(r => setTimeout(r, 400));
      // Re-query rect after scroll
      const afterScroll = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const el = window.__lastScrolledEl;
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
          })()
        `,
        returnByValue: true
      });
      const r = afterScroll.result.value || rect;
      const clip = {
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        scale: 1
      };
      const shot = await send('Page.captureScreenshot', { clip, captureBeyondViewport: true });
      fs.writeFileSync(path.join(COMPARE_DIR, filename), Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${filename} (${Math.round(r.width)}x${Math.round(r.height)})`);
    }

    // 1. Timer card default
    const timerRectExpr = `
      (function() {
        const el = document.querySelector('[role="tablist"]')?.closest('div.border');
        if (!el) return null;
        window.__lastScrolledEl = el;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `;
    await captureByEval(timerRectExpr, 'focus-timer-card.png');

    // 2. Start timer, wait 3s, capture running state
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'START');
          if (btn) btn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 3000));
    await captureByEval(timerRectExpr, 'focus-timer-running.png');

    // 3. Select Short Break preset
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const tab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.innerText.includes('SHORT BREAK'));
          if (tab) tab.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
    await captureByEval(timerRectExpr, 'focus-timer-shortbreak.png');

    // 4. Sound card default
    const soundRectExpr = `
      (function() {
        const el = document.querySelector('#focus-room-sound-volume')?.closest('div.border');
        if (!el) return null;
        window.__lastScrolledEl = el;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `;
    await captureByEval(soundRectExpr, 'focus-sound-player.png');

    // 5. Sound card playing with DEEP FOCUS
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const chip = Array.from(document.querySelectorAll('button[role="radio"]')).find(c => c.innerText.includes('DEEP FOCUS'));
          if (chip) chip.click();
          const play = document.querySelector('button[aria-label*="ambient focus sound"]');
          if (play) play.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
    await captureByEval(soundRectExpr, 'focus-sound-playing.png');

    ws.close();
    chromeProc.kill();
    console.log('Successfully captured focus widgets comparison artifacts!');
  } catch (err) {
    console.error('Error capturing widgets:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
