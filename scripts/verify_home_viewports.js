// scripts/verify_home_viewports.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9224;
const TMP_DIR = path.resolve('tmp_cdp_verify');

const VIEWPORTS = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 1000 },
  { name: 'desktop-1366', width: 1366, height: 1000 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
  { name: 'desktop-1536', width: 1536, height: 1000 },
  { name: 'desktop-1600', width: 1600, height: 1000 },
  { name: 'desktop-1920', width: 1920, height: 1200 },
  { name: 'desktop-2560', width: 2560, height: 1440 }
];

async function run() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${TMP_DIR}`,
    'http://localhost:3000/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch(`http://localhost:${PORT}/json`);
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) {
      console.error('No page tab found');
      chromeProc.kill();
      return;
    }

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('DOM.enable');

    const results = {};

    for (const vp of VIEWPORTS) {
      console.log(`\n================ Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ================`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: vp.width < 768
      });

      await send('Page.navigate', { url: 'http://localhost:3000/' });
      await new Promise(r => setTimeout(r, 1200));

      const evalMetrics = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            const overflow = docWidth > winWidth;

            // Nav metrics
            const nav = document.querySelector('nav');
            const navRect = nav ? nav.getBoundingClientRect() : null;
            const navBrand = nav ? nav.querySelector('a[href="/"]') : null;
            const navBrandRect = navBrand ? navBrand.getBoundingClientRect() : null;
            const navCta = nav ? nav.querySelector('a[href="/login"]') : null;
            const navCtaRect = navCta ? navCta.getBoundingClientRect() : null;

            // Hero section
            const heroSection = document.querySelector('section');
            const heroRect = heroSection ? heroSection.getBoundingClientRect() : null;

            // FIELD NOTES label
            const fieldNotes = Array.from(document.querySelectorAll('div')).find(d => d.textContent.trim().startsWith('FIELD NOTES / 01'));
            const fnRect = fieldNotes ? fieldNotes.getBoundingClientRect() : null;

            // Heading & Buttons
            const h1 = document.querySelector('h1');
            const h1Rect = h1 ? h1.getBoundingClientRect() : null;
            const expBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('EXPLORE FOCUS ROOM'));
            const expBtnRect = expBtn ? expBtn.getBoundingClientRect() : null;

            // Photo panel
            const photoImg = document.querySelector('img[src*="hero-desk-crop"]');
            const photoPanel = photoImg ? photoImg.closest('.overflow-hidden') : null;
            const photoRect = photoPanel ? photoPanel.getBoundingClientRect() : null;

            // Polaroid
            const polaroid = Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('LANDSCAPE STUDY / 01'));
            const polaroidCard = polaroid ? polaroid.closest('.lift-card') : null;
            const polRect = polaroidCard ? polaroidCard.getBoundingClientRect() : null;

            // Section 01
            const sec01 = document.getElementById('about');
            const sec01Rect = sec01 ? sec01.getBoundingClientRect() : null;

            // Left paragraph in Sec 01
            const sec01PLeft = sec01 ? sec01.querySelector('.font-public-serif') : null;
            const sec01PLeftRect = sec01PLeft ? sec01PLeft.getBoundingClientRect() : null;

            // Right paragraph in Sec 01
            const sec01PRight = sec01 ? sec01.querySelector('.font-public-sans') : null;
            const sec01PRightRect = sec01PRight ? sec01PRight.getBoundingClientRect() : null;

            // Botanical sprig
            const sprig = sec01 ? sec01.querySelector('svg[aria-label*="botanical"]') : null;
            const sprigRect = sprig ? sprig.getBoundingClientRect() : null;

            // Colophon
            const colophon = sec01 ? Array.from(sec01.querySelectorAll('span')).find(s => s.textContent.includes('A PERSONAL ATLAS')) : null;
            const colophonRect = colophon ? colophon.getBoundingClientRect() : null;

            return {
              winWidth,
              docWidth,
              overflow,
              nav: {
                height: navRect ? navRect.height : null,
                brandX: navBrandRect ? navBrandRect.left : null,
                ctaRight: navCtaRect ? navCtaRect.right : null
              },
              hero: {
                height: heroRect ? heroRect.height : null,
                fieldNotesX: fnRect ? fnRect.left : null,
                h1Right: h1Rect ? h1Rect.right : null,
                expBtnRight: expBtnRect ? expBtnRect.right : null,
                photoPanel: photoRect ? {
                  left: photoRect.left,
                  right: photoRect.right,
                  width: photoRect.width,
                  top: photoRect.top,
                  bottom: photoRect.bottom,
                  height: photoRect.height
                } : null,
                polaroid: polRect ? {
                  left: polRect.left,
                  right: polRect.right,
                  width: polRect.width,
                  insideViewport: polRect.right <= winWidth
                } : null
              },
              section01: {
                height: sec01Rect ? sec01Rect.height : null,
                pLeft: sec01PLeftRect ? {
                  left: sec01PLeftRect.left,
                  width: sec01PLeftRect.width,
                  height: sec01PLeftRect.height
                } : null,
                pRight: sec01PRightRect ? {
                  left: sec01PRightRect.left,
                  width: sec01PRightRect.width,
                  height: sec01PRightRect.height
                } : null,
                sprig: sprigRect ? {
                  left: sprigRect.left,
                  right: sprigRect.right,
                  width: sprigRect.width
                } : null,
                colophon: colophonRect ? {
                  left: colophonRect.left
                } : null
              }
            };
          })()
        `,
        returnByValue: true
      });

      const data = evalMetrics.result.value;
      results[vp.name] = data;
      console.log(`Window Width: ${data.winWidth}, Document ScrollWidth: ${data.docWidth}, Horizontal Overflow: ${data.overflow}`);
      if (data.hero.photoPanel) {
        console.log(`Hero Photo Panel: x=${data.hero.photoPanel.left.toFixed(1)}..${data.hero.photoPanel.right.toFixed(1)}, width=${data.hero.photoPanel.width.toFixed(1)}, height=${data.hero.photoPanel.height.toFixed(1)}`);
      }
      if (data.hero.polaroid) {
        console.log(`Polaroid: x=${data.hero.polaroid.left.toFixed(1)}..${data.hero.polaroid.right.toFixed(1)}, fully inside viewport: ${data.hero.polaroid.insideViewport}`);
      }
      if (data.hero.fieldNotesX) {
        console.log(`FIELD NOTES x: ${data.hero.fieldNotesX.toFixed(1)}`);
      }
      if (data.nav.brandX && data.nav.ctaRight) {
        console.log(`Nav Brand x: ${data.nav.brandX.toFixed(1)}, Nav CTA right: ${data.nav.ctaRight.toFixed(1)}`);
      }
      if (data.section01.pLeft && data.section01.pRight) {
        console.log(`Sec 01 Left P x: ${data.section01.pLeft.left.toFixed(1)}, Sec 01 Right P x: ${data.section01.pRight.left.toFixed(1)}`);
      }
      if (data.section01.sprig) {
        console.log(`Sec 01 Sprig: x=${data.section01.sprig.left.toFixed(1)}..${data.section01.sprig.right.toFixed(1)}`);
      }
    }

    fs.writeFileSync('scripts/viewport_verification_results.json', JSON.stringify(results, null, 2));
    console.log('\nResults written to scripts/viewport_verification_results.json');
    ws.close();
  } catch (err) {
    console.error('Error during verification:', err);
  } finally {
    chromeProc.kill();
  }
}

run();
