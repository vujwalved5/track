const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function measureCards() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const tmpDir = path.resolve('tmp_cdp_cards');
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9240',
    `--user-data-dir=${tmpDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch('http://localhost:9240/json');
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

    const targets = [
      { name: 'design_a', port: 3001 },
      { name: 'design_b', port: 3002 },
      { name: 'design_c', port: 3003 }
    ];

    for (const target of targets) {
      await send('Page.navigate', { url: `http://localhost:${target.port}/focus-room` });
      await new Promise(r => setTimeout(r, 1200));
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1024,
        height: 768,
        deviceScaleFactor: 1,
        mobile: false
      });
      const cardBoxes = await send('Runtime.evaluate', {
        expression: `(() => {
          const mainCard = document.querySelector('div[class*="border-[#B68A53]/20"], div[class*="bg-[#141C28]"], div[class*="bg-[#1C2638]"]');
          const creamCard = document.querySelector('div[class*="bg-[#F8F5EE]"], div[class*="bg-[#F3EFE6]"], div[class*="bg-[#F4EDDC]"], div[class*="bg-[#FAF7F0]"]');
          const heroSec = document.querySelector('section, main');
          return {
            mainCard: mainCard ? mainCard.getBoundingClientRect() : null,
            creamCard: creamCard ? creamCard.getBoundingClientRect() : null,
            heroSec: heroSec ? heroSec.getBoundingClientRect() : null
          };
        })()`,
        returnByValue: true
      });
      console.log(target.name, 'cards:', cardBoxes.result.value);
    }

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

measureCards().catch(console.error);
