// scripts/qa_test_interactive.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9227;
const TMP_DIR = path.resolve('tmp_cdp_interactive');

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
    await new Promise(r => setTimeout(r, 1500));

    console.log(`=== Testing Focus Room Interactive Controls & Keyboard ===`);

    // 1. Initial Timer State
    const s0 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const time = document.querySelector('[aria-live="polite"] span')?.innerText;
          const arc = document.querySelector('svg circle[stroke="#B68A53"]')?.getAttribute('stroke-dasharray');
          return { time, arc };
        })()
      `,
      returnByValue: true
    });
    console.log('Initial Timer State:', s0.result.value);

    // 2. Click START button
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'START');
          if (startBtn) startBtn.click();
        })()
      `
    });
    // Wait 2.5 seconds to observe countdown
    await new Promise(r => setTimeout(r, 2500));

    const s1 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const time = document.querySelector('[aria-live="polite"] span')?.innerText;
          const arc = document.querySelector('svg circle[stroke="#B68A53"]')?.getAttribute('stroke-dasharray');
          return { time, arc };
        })()
      `,
      returnByValue: true
    });
    console.log('Running Timer State (after ~2s):', s1.result.value);

    // 3. Click PAUSE button
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'PAUSE');
          if (pauseBtn) pauseBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 1000));
    const s2 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const time = document.querySelector('[aria-live="polite"] span')?.innerText;
          return { time };
        })()
      `,
      returnByValue: true
    });
    console.log('Paused Timer State:', s2.result.value);

    // 4. Click RESET button
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'RESET');
          if (resetBtn) resetBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));
    const s3 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const time = document.querySelector('[aria-live="polite"] span')?.innerText;
          const arc = document.querySelector('svg circle[stroke="#B68A53"]')?.getAttribute('stroke-dasharray');
          return { time, arc };
        })()
      `,
      returnByValue: true
    });
    console.log('Reset Timer State:', s3.result.value);

    // 5. Test Presets (Short Break & Long Break)
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const sbTab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.innerText.includes('SHORT BREAK'));
          if (sbTab) sbTab.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));
    const s4 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const time = document.querySelector('[aria-live="polite"] span')?.innerText;
          const title = document.querySelector('[aria-live="polite"]')?.parentElement?.querySelector('div')?.innerText;
          const selected = Array.from(document.querySelectorAll('button[role="tab"]')).map(b => ({
            name: b.innerText.trim().replace(/\\n/g, ' '),
            selected: b.getAttribute('aria-selected')
          }));
          return { time, title, selected };
        })()
      `,
      returnByValue: true
    });
    console.log('Short Break Preset State:', s4.result.value);

    // 6. Test Sound Player
    console.log('\n=== Testing Sound Player Interactive Controls ===');
    const soundInit = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const chips = Array.from(document.querySelectorAll('button[role="radio"]')).map(c => ({
            text: c.innerText.trim(),
            checked: c.getAttribute('aria-checked')
          }));
          const vol = document.querySelector('input[type="range"]')?.value;
          const playBtn = document.querySelector('button[aria-label*="ambient focus sound"]')?.getAttribute('aria-label');
          return { chips, vol, playBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('Initial Sound Player State:', soundInit.result.value);

    // Select DEEP FOCUS
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const chip = Array.from(document.querySelectorAll('button[role="radio"]')).find(c => c.innerText.includes('DEEP FOCUS'));
          if (chip) chip.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));

    // Click Play
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const playBtn = document.querySelector('button[aria-label*="ambient focus sound"]');
          if (playBtn) playBtn.click();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 500));

    const soundPlaying = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const chips = Array.from(document.querySelectorAll('button[role="radio"]')).map(c => ({
            text: c.innerText.trim(),
            checked: c.getAttribute('aria-checked')
          }));
          const playBtn = document.querySelector('button[aria-label*="ambient focus sound"]')?.getAttribute('aria-label');
          return { chips, playBtn };
        })()
      `,
      returnByValue: true
    });
    console.log('Sound Playing State:', soundPlaying.result.value);

    // Adjust Volume
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const slider = document.querySelector('input[type="range"]');
          if (slider) {
            slider.value = "0.5";
            slider.dispatchEvent(new Event('change', { bubbles: true }));
            slider.dispatchEvent(new Event('input', { bubbles: true }));
          }
        })()
      `
    });
    await new Promise(r => setTimeout(r, 300));
    const soundVol = await send('Runtime.evaluate', {
      expression: `document.querySelector('input[type="range"]')?.value`,
      returnByValue: true
    });
    console.log('Adjusted Volume State:', soundVol.result.value);

    ws.close();
    chromeProc.kill();
  } catch (err) {
    console.error('Interactive test error:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
