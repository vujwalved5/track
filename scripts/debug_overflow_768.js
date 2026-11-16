const { spawn } = require('child_process');
const path = require('path');

async function testOverflow() {
  const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + path.resolve('tmp_cdp_over'),
    'http://localhost:3000/'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://localhost:9225/json');
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
  await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3000/' });
  await new Promise(r => setTimeout(r, 1500));

  const evalRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const docW = document.documentElement.scrollWidth;
        const winW = window.innerWidth;
        const bad = [];
        document.querySelectorAll('*').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.right > winW + 1) {
            bad.push({
              tag: el.tagName,
              cls: el.className ? el.className.toString().slice(0, 50) : '',
              id: el.id,
              right: r.right,
              width: r.width,
              text: el.textContent ? el.textContent.trim().slice(0, 30) : ''
            });
          }
        });
        return { docW, winW, bad: bad.slice(0, 10) };
      })()
    `,
    returnByValue: true
  });
  console.log(JSON.stringify(evalRes.result.value, null, 2));
  ws.close();
  proc.kill();
}
testOverflow();
