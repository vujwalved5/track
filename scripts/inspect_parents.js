const { spawn } = require('child_process');
const path = require('path');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_eval2');
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9224',
    `--user-data-dir=${tmpDir}`,
    '--window-size=390,7000',
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9224/json');
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
          const el = document.querySelector('[aria-label="Compass rose indicator"]');
          const chain = [];
          let curr = el;
          while (curr && curr !== document.body) {
            const r = curr.getBoundingClientRect();
            chain.push({
              tag: curr.tagName,
              class: curr.className,
              rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
            });
            curr = curr.parentElement;
          }
          return chain;
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
