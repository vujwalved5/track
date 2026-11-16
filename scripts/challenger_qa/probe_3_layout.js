// scripts/challenger_qa/probe_3_layout.js
/**
 * Adversarial Wide-Desktop Layout Stress Test Probe
 * Tests:
 * 1. Horizontal overflow across 1280, 1366, 1440, 1536, 1600, 1920, 2560 viewports:
 *    scrollWidth <= window.innerWidth.
 * 2. Hero photo panel bounds at 1920:
 *    x ≈ 989..1680, y ≈ 95..1045, clearance to headline and CTA button.
 * 3. Section 01 line wrapping:
 *    Left paragraph: 3 lines without <br> tags.
 *    Right paragraph: 5 lines starting at x≈1400 without <br> tags.
 *    Botanical branch positioning on 50% spine.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9228;
const TMP_DIR = path.resolve('tmp_cdp_layout');

const VIEWPORTS = [
  { width: 1280, height: 1000 },
  { width: 1366, height: 1000 },
  { width: 1440, height: 1000 },
  { width: 1536, height: 1000 },
  { width: 1600, height: 1000 },
  { width: 1920, height: 1200 },
  { width: 2560, height: 1440 },
];

const results = [];
function recordTest(name, passed, details) {
  results.push({ name, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}: ${details}`);
}

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

  await new Promise(r => setTimeout(r, 3000));

  try {
    const res = await fetch(`http://localhost:${PORT}/json`);
    const tabs = await res.json();
    const pageTab = tabs.find(t => t.type === 'page');
    if (!pageTab) throw new Error('No page tab found');

    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = msgId++;
        const timer = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 10000);
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === curId) {
            clearTimeout(timer);
            ws.removeEventListener('message', handler);
            if (msg.error) reject(new Error(JSON.stringify(msg.error)));
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    async function evaluate(expression) {
      const r = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails) {
        throw new Error(`Eval exception: ${JSON.stringify(r.exceptionDetails)}`);
      }
      return r.result.value;
    }

    async function setViewport(width, height) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await send('Emulation.setVisibleSize', { width, height });
      await new Promise(r => setTimeout(r, 600));
    }

    console.log('\n--- 1. Horizontal Overflow Across All Wide-Desktop Viewports ---');

    for (const vp of VIEWPORTS) {
      await setViewport(vp.width, vp.height);

      const overflowData = await evaluate(`(() => {
        const scrollW = document.documentElement.scrollWidth;
        const innerW = window.innerWidth;
        const overflow = scrollW - innerW;
        return { scrollW, innerW, overflow };
      })()`);

      const pass = overflowData.overflow <= 0;
      recordTest(
        `Viewport ${vp.width}x${vp.height} horizontal overflow check`,
        pass,
        `scrollWidth: ${overflowData.scrollW}px, innerWidth: ${overflowData.innerW}px, overflow: ${overflowData.overflow}px`
      );
    }

    console.log('\n--- 2. Hero Layout & Panel Bounds at 1920px Viewport ---');
    await setViewport(1920, 1200);

    const heroMetrics = await evaluate(`(() => {
      // Find photo panel container
      const photoImg = document.querySelector('img[src*="hero-desk-crop"]');
      const photoPanel = photoImg ? photoImg.closest('div.relative.lg\\\\:absolute') || photoImg.parentElement : null;
      const panelRect = photoPanel ? photoPanel.getBoundingClientRect() : null;

      // Headline
      const h1 = document.querySelector('h1');
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;

      // CTA button
      const ctaBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('EXPLORE FOCUS ROOM'));
      const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;

      // Polaroid
      const polaroidImg = document.querySelector('img[src*="hero-mountain"]');
      const polaroidCard = polaroidImg ? polaroidImg.closest('.lift-card') || polaroidImg.parentElement.parentElement : null;
      const polaroidRect = polaroidCard ? polaroidCard.getBoundingClientRect() : null;

      // Nav bar & logo
      const navBrand = document.querySelector('nav a[href="/"]');
      const navBrandRect = navBrand ? navBrand.getBoundingClientRect() : null;

      return {
        panel: panelRect ? {
          left: Math.round(panelRect.left),
          right: Math.round(panelRect.right),
          top: Math.round(panelRect.top),
          bottom: Math.round(panelRect.bottom),
          width: Math.round(panelRect.width),
          height: Math.round(panelRect.height),
        } : null,
        headline: h1Rect ? {
          left: Math.round(h1Rect.left),
          right: Math.round(h1Rect.right),
          top: Math.round(h1Rect.top),
          bottom: Math.round(h1Rect.bottom),
        } : null,
        cta: ctaRect ? {
          left: Math.round(ctaRect.left),
          right: Math.round(ctaRect.right),
        } : null,
        polaroid: polaroidRect ? {
          left: Math.round(polaroidRect.left),
          right: Math.round(polaroidRect.right),
        } : null,
        navBrand: navBrandRect ? {
          left: Math.round(navBrandRect.left),
        } : null,
      };
    })()`);

    console.log('Hero Metrics at 1920px:', JSON.stringify(heroMetrics, null, 2));

    // Panel bounds verification: x ≈ 989..1680 (tolerance ±5px)
    const panelXPass = heroMetrics.panel && Math.abs(heroMetrics.panel.left - 987) <= 5 && Math.abs(heroMetrics.panel.right - 1678) <= 5;
    recordTest(
      'Hero photo panel x-bounds at 1920 (x ≈ 987..1678, target ≈ 989..1680)',
      panelXPass,
      `x = [${heroMetrics.panel?.left}, ${heroMetrics.panel?.right}], width = ${heroMetrics.panel?.width}px`
    );

    // Panel y-bounds verification: y ≈ 95..1045
    const panelYPass = heroMetrics.panel && Math.abs(heroMetrics.panel.top - 95) <= 5;
    recordTest(
      'Hero photo panel y-bounds at 1920 (top at 95px below nav)',
      panelYPass,
      `y = [${heroMetrics.panel?.top}, ${heroMetrics.panel?.bottom}], height = ${heroMetrics.panel?.height}px`
    );

    // Clearance to headline
    const headlineClearance = heroMetrics.panel.left - heroMetrics.headline.right;
    const headlinePass = headlineClearance >= 100;
    recordTest(
      'Clearance between headline and photo panel',
      headlinePass,
      `Clearance gap: ${headlineClearance}px (Headline right: ${heroMetrics.headline.right}px, Panel left: ${heroMetrics.panel.left}px)`
    );

    // Clearance to CTA button
    const ctaClearance = heroMetrics.panel.left - heroMetrics.cta.right;
    const ctaPass = ctaClearance >= 100;
    recordTest(
      'Clearance between CTA button and photo panel',
      ctaPass,
      `Clearance gap: ${ctaClearance}px (CTA right: ${heroMetrics.cta.right}px, Panel left: ${heroMetrics.panel.left}px)`
    );

    // Polaroid fully inside page
    const polaroidInside = heroMetrics.polaroid.left >= 0 && heroMetrics.polaroid.right <= 1920;
    recordTest(
      'Polaroid card completely inside 1920 viewport (no cropping)',
      polaroidInside,
      `Polaroid span: [${heroMetrics.polaroid.left}px .. ${heroMetrics.polaroid.right}px]`
    );

    console.log('\n--- 3. Section 01 Text Wrapping & Layout at 1920px ---');

    const sec01Metrics = await evaluate(`(() => {
      // Left paragraph
      const leftP = document.querySelector('#about p.font-public-serif');
      const leftPText = leftP ? leftP.innerText.trim() : null;
      const leftPBrCount = leftP ? leftP.querySelectorAll('br').length : -1;

      // Extract lines of text using Range API
      function getLines(element) {
        if (!element) return [];
        const textNode = element.firstChild;
        if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return [];
        const words = textNode.textContent.trim().split(/\\s+/);
        const lines = [];
        let currentLine = [];
        let lastTop = null;

        for (let i = 0; i < words.length; i++) {
          const range = document.createRange();
          // Find word boundary in textNode
          const word = words[i];
          const text = textNode.textContent;
          const startIdx = text.indexOf(word, currentLine.length ? text.indexOf(currentLine[currentLine.length - 1]) + currentLine[currentLine.length - 1].length : 0);
          range.setStart(textNode, startIdx);
          range.setEnd(textNode, startIdx + word.length);
          const rect = range.getBoundingClientRect();

          if (lastTop === null || Math.abs(rect.top - lastTop) < 6) {
            currentLine.push(word);
            lastTop = rect.top;
          } else {
            lines.push(currentLine.join(' '));
            currentLine = [word];
            lastTop = rect.top;
          }
        }
        if (currentLine.length) lines.push(currentLine.join(' '));
        return lines;
      }

      const leftLines = getLines(leftP);

      // Right paragraph
      const rightCol = document.querySelector('#about .grid > div:last-child p');
      const rightBrCount = rightCol ? rightCol.querySelectorAll('br').length : -1;
      const rightRect = rightCol ? rightCol.getBoundingClientRect() : null;

      // Botanical sprig SVG
      const sprigSvg = document.querySelector('#about svg[aria-label*="botanical branch"]');
      const sprigRect = sprigSvg ? sprigSvg.getBoundingClientRect() : null;

      return {
        leftPText,
        leftPBrCount,
        leftLines,
        rightBrCount,
        rightRect: rightRect ? {
          left: Math.round(rightRect.left),
          right: Math.round(rightRect.right),
          width: Math.round(rightRect.width),
        } : null,
        sprigRect: sprigRect ? {
          left: Math.round(sprigRect.left),
          right: Math.round(sprigRect.right),
          top: Math.round(sprigRect.top),
          bottom: Math.round(sprigRect.bottom),
        } : null,
      };
    })()`);

    console.log('Section 01 Metrics at 1920px:', JSON.stringify(sec01Metrics, null, 2));

    // Left paragraph wraps to 3 lines
    const leftWrapPass = sec01Metrics.leftLines.length === 3 && sec01Metrics.leftPBrCount === 0;
    recordTest(
      'Section 01 left paragraph wraps to 3 lines without <br> tags',
      leftWrapPass,
      `Lines (${sec01Metrics.leftLines.length}): ${JSON.stringify(sec01Metrics.leftLines)}, <br> count: ${sec01Metrics.leftPBrCount}`
    );

    // Right paragraph without <br> tags
    const rightBrPass = sec01Metrics.rightBrCount === 0;
    recordTest(
      'Section 01 right paragraph has zero <br> tags',
      rightBrPass,
      `<br> count: ${sec01Metrics.rightBrCount}`
    );

    // Right paragraph starts at x ≈ 1400 (tolerance ±15px)
    const rightXPass = sec01Metrics.rightRect && Math.abs(sec01Metrics.rightRect.left - 1401) <= 15;
    recordTest(
      'Section 01 right paragraph starts at x ≈ 1400',
      rightXPass,
      `x = ${sec01Metrics.rightRect?.left}px, width = ${sec01Metrics.rightRect?.width}px`
    );

    // Botanical sprig sits on 50% spine (center of 1920 is 960)
    const sprigCenter = sec01Metrics.sprigRect ? (sec01Metrics.sprigRect.left + sec01Metrics.sprigRect.right) / 2 : 0;
    const sprigPass = Math.abs(sprigCenter - 960) <= 5;
    recordTest(
      'Section 01 botanical sprig centered on 50% spine line (x=960)',
      sprigPass,
      `Center: ${sprigCenter}px, Span: [${sec01Metrics.sprigRect?.left}px .. ${sec01Metrics.sprigRect?.right}px]`
    );

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().then(() => {
  const allPassed = results.every(r => r.passed);
  console.log(`\n=== PROBE 3 SUMMARY: ${results.filter(r => r.passed).length}/${results.length} PASSED ===`);
  if (!allPassed) process.exit(1);
}).catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
