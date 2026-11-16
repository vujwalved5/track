const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testWrapRange() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_wrap');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9234',
    `--user-data-dir=${tmpDir}`,
    'http://localhost:3000/focus-room'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  try {
    const res = await fetch('http://localhost:9234/json');
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
    
    for (const w of [430, 435, 440, 445, 450, 460, 470, 480]) {
      const evalRes = await send('Runtime.evaluate', {
        expression: `(() => {
          const p = document.querySelector('p.font-public-sans');
          p.style.maxWidth = '${w}px';
          const range = document.createRange();
          const textNode = p.childNodes[0];
          const text = textNode.textContent.trim();
          const words = text.split(/\\s+/);
          let cur = 0;
          const lines = [];
          let curLine = [];
          let lastTop = -1;
          for (const word of words) {
            const idx = text.indexOf(word, cur);
            range.setStart(textNode, idx);
            range.setEnd(textNode, idx + word.length);
            const r = range.getBoundingClientRect();
            if (lastTop === -1 || Math.abs(r.top - lastTop) > 4) {
              if (curLine.length) lines.push(curLine.join(' '));
              curLine = [word];
              lastTop = r.top;
            } else {
              curLine.push(word);
            }
            cur = idx + word.length;
          }
          if (curLine.length) lines.push(curLine.join(' '));
          return { w: ${w}, lines: lines };
        })()`,
        returnByValue: true
      });
      console.log(evalRes.result.value);
    }
    ws.close();
  } finally {
    chromeProc.kill();
  }
}
testWrapRange().catch(console.error);
