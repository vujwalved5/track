const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9243', 'http://localhost:3001/focus-room'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9243/json');
    const tabs = await res.json();
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);
    let id = 1;
    function send(m, p={}) {
      return new Promise(r => {
        const cur = id++;
        const h = (e) => {
          const msg = JSON.parse(e.data);
          if (msg.id === cur) { ws.removeEventListener('message', h); r(msg.result); }
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: cur, method: m, params: p }));
      });
    }
    await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
    const info = await send('Runtime.evaluate', {
      expression: `(() => {
        const practice = document.getElementById("practice");
        // find the two cards grid
        const grid = practice.querySelector(".grid.grid-cols-1.lg\\:grid-cols-12.gap-8");
        return {
          practiceTop: practice.offsetTop,
          gridTop: grid ? grid.offsetTop : null,
          gridBounding: grid ? grid.getBoundingClientRect() : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Grid info:', JSON.stringify(info.result.value, null, 2));
    ws.close();
    chromeProc.kill();
  } catch (e) {
    console.error(e);
    chromeProc.kill();
  }
}, 2000);
