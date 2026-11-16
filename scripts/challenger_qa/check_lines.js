// scripts/challenger_qa/check_lines.js
const { spawn } = require('child_process');
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--window-size=1920,1200',
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 3000));

  try {
    const tabs = await (await fetch('http://localhost:9230/json')).json();
    const pageTab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve) => { ws.onopen = resolve; });

    let msgId = 1;
    function evalExpr(expression) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result.result.value);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }));
      });
    }

    const info = await evalExpr(`(() => {
      const p = document.querySelector('#about .grid > div:last-child p');
      const rect = p.getBoundingClientRect();
      const style = window.getComputedStyle(p);
      const lineHeight = parseFloat(style.lineHeight);
      const lines = Math.round(rect.height / lineHeight);
      
      // Also get text lines using getClientRects on text nodes or words
      const text = p.innerText;
      return {
        text,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        lineHeight,
        lineCount: lines,
      };
    })()`);

    console.log('Right Paragraph Info:', info);
    ws.close();
  } finally {
    proc.kill();
  }
}

main();
