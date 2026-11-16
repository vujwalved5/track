const { spawn } = require('child_process');
const path = require('path');

async function checkRightWords() {
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
        const pRight = sec01.querySelector('.font-public-sans');
        const range = document.createRange();
        range.selectNodeContents(pRight);
        const rects = Array.from(range.getClientRects());
        return {
          text: pRight.textContent,
          rectsCount: rects.length,
          rects: rects.map(r => ({ top: Math.round(r.top), width: Math.round(r.width) }))
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Right paragraph lines at 1920:', evalRes.result.value);
  ws.close();
  proc.kill();
}
checkRightWords();
