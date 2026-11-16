const { spawn } = require('child_process');
const path = require('path');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_eval3');
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9225',
    `--user-data-dir=${tmpDir}`,
    '--window-size=390,7000',
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9225/json');
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const curId = id++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    const evalResult = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const docW = document.documentElement.scrollWidth;
          const winW = window.innerWidth;
          const overflowing = [];
          document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > 390.5) {
              overflowing.push({
                tag: el.tagName,
                id: el.id,
                className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 80) : '',
                right: Math.round(r.right),
                width: Math.round(r.width)
              });
            }
          });
          return { docW, winW, count: overflowing.length, sample: overflowing.slice(0, 15) };
        })()
      `,
      returnByValue: true
    });

    console.log(JSON.stringify(evalResult.result.value, null, 2));
    ws.close();
  } finally {
    chromeProc.kill();
  }
}
main().catch(console.error);
