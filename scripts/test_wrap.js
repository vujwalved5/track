const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testWrap() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_wrap');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9231',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/focus-room'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const res = await fetch('http://localhost:9231/json');
    const tabs = await res.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(m, p = {}) {
      return new Promise(r => {
        const curId = id++;
        const h = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === curId) { ws.removeEventListener('message', h); r(msg.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params: p }));
      });
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = document.querySelector('p.font-public-sans');
        const s = window.getComputedStyle(p);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = s.font;
        const w_deep = ctx.measureText("One focused session at a time. Make space for deep").width;
        const w_work = ctx.measureText("One focused session at a time. Make space for deep work,").width;
        const w_for = ctx.measureText("One focused session at a time. Make space for").width;
        return {
          font: s.font,
          fontSize: s.fontSize,
          w_for,
          w_deep,
          w_work
        };
      })()`,
      returnByValue: true
    });
    console.log('Text measurements:', evalRes.result.value);
    ws.close();
  } finally {
    chromeProc.kill();
  }
}
testWrap().catch(console.error);
