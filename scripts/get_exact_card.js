const { spawn } = require('child_process');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chromeProc = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9246', 'http://localhost:3001/focus-room'
]);

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:9246/json');
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
        const span = Array.from(document.querySelectorAll("span")).find(s => s.textContent.includes("FOCUS SESSION /"));
        if (!span) return "no span";
        // Walk up to find the card container
        let card = span;
        while (card && card.parentElement && card.parentElement.id !== "practice" && !card.className.includes("lg:col-span-8")) {
          card = card.parentElement;
        }
        const spanRect = span.getBoundingClientRect();
        const cardRect = card ? card.getBoundingClientRect() : null;
        return {
          spanTop: spanRect.top + window.scrollY,
          cardTop: cardRect ? cardRect.top + window.scrollY : null,
          cardHeight: cardRect ? cardRect.height : null,
          cardWidth: cardRect ? cardRect.width : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Position details:', info.result.value);
    ws.close();
    chromeProc.kill();
  } catch (e) {
    console.error(e);
    chromeProc.kill();
  }
}, 2000);
