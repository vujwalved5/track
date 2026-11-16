const { spawn } = require('child_process');
const path = require('path');

async function testFontSize() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_wrap');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9233',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/focus-room'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const res = await fetch('http://localhost:9233/json');
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
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const results = {};
        for (const fs of ['15px', '16px', '17px', '18px']) {
          ctx.font = fs + ' "DM Sans", sans-serif';
          results[fs] = {
            w_deep: ctx.measureText("One focused session at a time. Make space for deep").width,
            w_work: ctx.measureText("One focused session at a time. Make space for deep work,").width,
          };
        }
        return results;
      })()`,
      returnByValue: true
    });
    console.log(evalRes.result.value);
    ws.close();
  } finally {
    chromeProc.kill();
  }
}
testFontSize().catch(console.error);
