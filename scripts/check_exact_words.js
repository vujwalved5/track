const { spawn } = require('child_process');
const path = require('path');

async function checkWords() {
  const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--user-data-dir=' + path.resolve('tmp_cdp_words'),
    'http://localhost:3000/'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:9227/json');
  const tabs = await res.json();
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  function send(m, p={}) {
    return new Promise(r => {
      const cur = id++;
      const h = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.id === cur) {
          ws.removeEventListener('message', h);
          r(msg.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({id: cur, method: m, params: p}));
    });
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 1500));

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const sec01 = document.getElementById('about');
        const pLeft = sec01.querySelector('.font-public-serif');
        const words = pLeft.textContent.trim().split(/\\s+/);
        const node = pLeft.firstChild;
        const lineWords = [];
        let curTop = null;
        let curLine = [];
        let offset = 0;
        for (const w of words) {
          const idx = pLeft.textContent.indexOf(w, offset);
          offset = idx + w.length;
          const r = document.createRange();
          r.setStart(node, idx);
          r.setEnd(node, offset);
          const top = Math.round(r.getBoundingClientRect().top);
          if (curTop === null) curTop = top;
          if (Math.abs(top - curTop) > 5) {
            lineWords.push(curLine.join(' '));
            curLine = [w];
            curTop = top;
          } else {
            curLine.push(w);
          }
        }
        if (curLine.length) lineWords.push(curLine.join(' '));
        return lineWords;
      })()
    `,
    returnByValue: true
  });
  console.log('Line words at 1920:', evalRes.result.value);
  ws.close();
  proc.kill();
}
checkWords();
