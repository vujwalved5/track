const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9245', 'http://localhost:3001/focus-room'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9245/json');
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
        const el = Array.from(document.querySelectorAll("*")).find(e => e.textContent && e.textContent.includes("FOCUS SESSION") && e.offsetWidth > 400 && e.offsetHeight > 300);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          tagName: el.tagName,
          className: el.className,
          top: r.top + window.scrollY,
          left: r.left,
          width: r.width,
          height: r.height
        };
      })()`,
      returnByValue: true
    });
    console.log('Timer card absolute pos:', info.result.value);
    ws.close();
    chromeProc.kill();
  } catch (e) {
    console.error(e);
    chromeProc.kill();
  }
}, 2000);
