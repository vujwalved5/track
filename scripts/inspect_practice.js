const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9244', 'http://localhost:3001/focus-room'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9244/json');
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
        if (!practice) return "no practice";
        const buttons = Array.from(practice.querySelectorAll("button")).map(b => ({
          text: b.textContent.trim(),
          rect: b.getBoundingClientRect()
        }));
        const h1_2 = Array.from(practice.querySelectorAll("h1, h2, h3, span")).filter(s => s.textContent.includes("FOCUS SESSION") || s.textContent.includes("FIELD NOTE")).map(s => ({
          text: s.textContent.trim(),
          rect: s.getBoundingClientRect()
        }));
        return { buttons, h1_2 };
      })()`,
      returnByValue: true
    });
    console.log('Practice elements:', JSON.stringify(info.result.value, null, 2));
    ws.close();
    chromeProc.kill();
  } catch (e) {
    console.error(e);
    chromeProc.kill();
  }
}, 2000);
