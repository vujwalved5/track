// scripts/challenger_qa/probe_1_browser_timer.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9225;
const TMP_DIR = path.resolve('tmp_cdp_timer');

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

  await new Promise(r => setTimeout(r, 3000));

  try {
    const res = await fetch(`http://localhost:${PORT}/json`);
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) {
      throw new Error('No page tab found');
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = msgId++;
        const timer = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 10000);
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            clearTimeout(timer);
            ws.removeEventListener('message', handler);
            if (msg.error) reject(new Error(JSON.stringify(msg.error)));
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (res.exceptionDetails) {
        throw new Error(`Evaluation exception: ${JSON.stringify(res.exceptionDetails)}`);
      }
      return res.result.value;
    }

    // Wait until document.readyState === 'complete' and React has mounted
    for (let i = 0; i < 20; i++) {
      const ready = await evaluate(`document.readyState === 'complete' && !!document.querySelector('button')`);
      if (ready) break;
      await new Promise(r => setTimeout(r, 500));
    }

    console.log('Testing live DOM in /focus-room...');

    // 1. Check initial timer state
    const initialState = await evaluate(`(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim());
      const dialSvg = document.querySelector('svg[aria-label*="Timer dial indicator"]');
      const dialText = dialSvg?.getAttribute('aria-label');
      
      // Look for the formatted time display
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      const sessionTitle = Array.from(document.querySelectorAll('span')).find(s => s.textContent.trim() === 'FOCUS SESSION');

      return {
        buttons,
        dialText,
        timeDisplay: timeSpan ? timeSpan.textContent.trim() : null,
        sessionTitle: sessionTitle ? sessionTitle.textContent.trim() : null
      };
    })()`);
    console.log('Initial Timer State:', initialState);

    if (initialState.timeDisplay !== '25:00') {
      throw new Error(`Expected initial time 25:00, got ${initialState.timeDisplay}`);
    }
    if (initialState.sessionTitle !== 'FOCUS SESSION') {
      throw new Error(`Expected initial title FOCUS SESSION, got ${initialState.sessionTitle}`);
    }

    // 2. Click START
    await evaluate(`(() => {
      const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'START');
      if (startBtn) startBtn.click();
    })()`);

    // Wait 2.2 seconds for ticks
    await new Promise(r => setTimeout(r, 2200));

    const runningState = await evaluate(`(() => {
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      return { timeDisplay: timeSpan ? timeSpan.textContent.trim() : null };
    })()`);
    console.log('Running Timer State after 2.2s:', runningState);
    if (runningState.timeDisplay === '25:00') {
      throw new Error('Timer did not tick down after clicking START');
    }

    // 3. Click PAUSE
    await evaluate(`(() => {
      const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'PAUSE');
      if (pauseBtn) pauseBtn.click();
    })()`);

    const pausedTime = await evaluate(`(() => {
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      return timeSpan ? timeSpan.textContent.trim() : null;
    })()`);
    console.log('Paused Time:', pausedTime);

    // Wait 1.5s to verify time remains frozen
    await new Promise(r => setTimeout(r, 1500));
    const pausedTime2 = await evaluate(`(() => {
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      return timeSpan ? timeSpan.textContent.trim() : null;
    })()`);
    if (pausedTime !== pausedTime2) {
      throw new Error(`Timer kept ticking while paused! ${pausedTime} -> ${pausedTime2}`);
    }
    console.log('Paused Time after wait (verified frozen):', pausedTime2);

    // 4. Click RESET
    await evaluate(`(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'RESET');
      if (resetBtn) resetBtn.click();
    })()`);

    const resetTime = await evaluate(`(() => {
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      return timeSpan ? timeSpan.textContent.trim() : null;
    })()`);
    console.log('Reset Time:', resetTime);
    if (resetTime !== '25:00') {
      throw new Error(`Expected reset time 25:00, got ${resetTime}`);
    }

    // 5. Test Preset Switch: SHORT BREAK 5 MIN
    await evaluate(`(() => {
      const shortBtn = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('SHORT BREAK'));
      if (shortBtn) shortBtn.click();
    })()`);

    const shortState = await evaluate(`(() => {
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      const sessionTitle = Array.from(document.querySelectorAll('span')).find(s => s.textContent.trim() === 'SHORT BREAK');
      return {
        timeDisplay: timeSpan ? timeSpan.textContent.trim() : null,
        sessionTitle: sessionTitle ? sessionTitle.textContent.trim() : null
      };
    })()`);
    console.log('Short Break State:', shortState);
    if (shortState.timeDisplay !== '05:00' || shortState.sessionTitle !== 'SHORT BREAK') {
      throw new Error(`Expected Short Break 05:00, got ${JSON.stringify(shortState)}`);
    }

    // 6. Test Preset Switch: LONG BREAK 15 MIN
    await evaluate(`(() => {
      const longBtn = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('LONG BREAK'));
      if (longBtn) longBtn.click();
    })()`);

    const longState = await evaluate(`(() => {
      const timeSpan = Array.from(document.querySelectorAll('span')).find(s => /^\\d{2}:\\d{2}$/.test(s.textContent.trim()));
      const sessionTitle = Array.from(document.querySelectorAll('span')).find(s => s.textContent.trim() === 'LONG BREAK');
      return {
        timeDisplay: timeSpan ? timeSpan.textContent.trim() : null,
        sessionTitle: sessionTitle ? sessionTitle.textContent.trim() : null
      };
    })()`);
    console.log('Long Break State:', longState);
    if (longState.timeDisplay !== '15:00' || longState.sessionTitle !== 'LONG BREAK') {
      throw new Error(`Expected Long Break 15:00, got ${JSON.stringify(longState)}`);
    }

    // 7. Switch back to Focus 25 min
    await evaluate(`(() => {
      const focusBtn = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.textContent.includes('FOCUS 25 MIN'));
      if (focusBtn) focusBtn.click();
    })()`);

    console.log('\n[PASS] All Live DOM Timer interactions verified successfully!');
    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
