const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9242', 'http://localhost:3001/focus-room'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9242/json');
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
    const pos = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = document.getElementById("practice");
        const sections = Array.from(document.querySelectorAll("section")).map(s => ({ id: s.id, top: s.offsetTop, h: s.offsetHeight }));
        // find timer card
        let timerCard = null;
        for (const el of document.querySelectorAll("div")) {
          if (el.textContent.includes("FOCUS SESSION") && el.offsetWidth > 400) {
            timerCard = { top: el.offsetTop, h: el.offsetHeight, rect: el.getBoundingClientRect() };
            break;
          }
        }
        return { sections, timerCard };
      })()`,
      returnByValue: true
    });
    console.log('Positions:', JSON.stringify(pos.result.value, null, 2));
    ws.close();
    chromeProc.kill();
  } catch (e) {
    console.error(e);
    chromeProc.kill();
  }
}, 2000);
