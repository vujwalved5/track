const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9226;
const TMP_DIR = path.resolve('tmp_cdp_wraps');

async function testWraps() {
  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=' + PORT,
    '--user-data-dir=' + TMP_DIR,
    'http://localhost:3000/'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch(`http://localhost:${PORT}/json`);
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

  for (const width of [1920, 1366]) {
    console.log(`\n================ Testing at Viewport Width ${width} ================`);
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1080, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: 'http://localhost:3000/' });
    await new Promise(r => setTimeout(r, 1500));

    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          function getLines(el) {
            if (!el) return [];
            // Use range to inspect line rects
            const textNode = el.firstChild;
            const range = document.createRange();
            range.selectNodeContents(el);
            const rects = Array.from(range.getClientRects());
            // Merge rects on same line (same y roughly)
            const lines = [];
            for (const r of rects) {
              const existing = lines.find(l => Math.abs(l.top - r.top) < 5);
              if (existing) {
                existing.right = Math.max(existing.right, r.right);
                existing.width = existing.right - existing.left;
              } else {
                lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width });
              }
            }
            return lines;
          }

          const sec01 = document.getElementById('about');
          const pLeft = sec01 ? sec01.querySelector('.font-public-serif') : null;
          const pRight = sec01 ? sec01.querySelector('.font-public-sans') : null;

          return {
            pLeftLines: getLines(pLeft),
            pRightLines: getLines(pRight),
            pLeftText: pLeft ? pLeft.textContent.trim() : '',
            pRightText: pRight ? pRight.textContent.trim() : ''
          };
        })()
      `,
      returnByValue: true
    });

    const val = evalRes.result.value;
    console.log(`Section 01 Left Paragraph line count: ${val.pLeftLines.length}`);
    val.pLeftLines.forEach((l, i) => {
      console.log(`  Line ${i+1}: top=${l.top.toFixed(1)}, left=${l.left.toFixed(1)}, right=${l.right.toFixed(1)}, width=${l.width.toFixed(1)}`);
    });

    console.log(`Section 01 Right Paragraph line count: ${val.pRightLines.length}`);
    val.pRightLines.forEach((l, i) => {
      console.log(`  Line ${i+1}: top=${l.top.toFixed(1)}, left=${l.left.toFixed(1)}, right=${l.right.toFixed(1)}, width=${l.width.toFixed(1)}`);
    });
  }

  ws.close();
  proc.kill();
}

testWraps();
