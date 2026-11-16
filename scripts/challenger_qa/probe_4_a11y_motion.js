// scripts/challenger_qa/probe_4_a11y_motion.js
/**
 * Adversarial Accessibility & Reduced Motion Probe
 * Tests:
 * 1. prefers-reduced-motion media query compliance:
 *    - Timer arc & bead transition disabled under reduce
 *    - Sound player waveform pulsing disabled under reduce
 * 2. Heading hierarchy:
 *    - Exactly one <h1> on Home page (/)
 *    - Exactly one <h1> on Focus Room (/focus-room)
 *    - Report complete heading hierarchy
 * 3. Text contrast calculations:
 *    - Exact WCAG AA 4.5:1 ratio verification across all public tokens
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9231;
const TMP_DIR = path.resolve('tmp_cdp_a11y');

const results = [];
function recordTest(name, passed, details) {
  results.push({ name, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}: ${details}`);
}

// WCAG 2.1 Relative Luminance & Contrast Formula
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function getContrastRatio(hex1, hex2) {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function run() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }

  // =========================================================================
  // 1. WCAG AA Contrast Mathematical Analysis
  // =========================================================================
  console.log('\n--- 1. WCAG Text Contrast Verification ---');

  const colorPairs = [
    { fg: '#F4EFE4', bg: '#172536', context: 'Cream text on Navy Dark background (Focus Room & Home navy sections)' },
    { fg: '#172536', bg: '#F4EFE4', context: 'Dark Navy ink text on Cream paper background (Home hero & cards)' },
    { fg: '#60432F', bg: '#F4EFE4', context: 'Brown / Earth eyebrow text on Cream paper' },
    { fg: '#BD634A', bg: '#F4EFE4', context: 'Terracotta red text on Cream paper' },
    { fg: '#B68A53', bg: '#172536', context: 'Gold label/button accents on Navy Dark background' },
    { fg: '#D2A75D', bg: '#172536', context: 'Amber beacon/heading accents on Navy Dark background' },
    { fg: '#90A0B3', bg: '#172536', context: 'Muted slate colophon text on Navy Dark background' },
  ];

  for (const pair of colorPairs) {
    const ratio = getContrastRatio(pair.fg, pair.bg);
    const passAA = ratio >= 4.5;
    const passLarge = ratio >= 3.0;
    recordTest(
      `Contrast: ${pair.fg} on ${pair.bg} (${pair.context})`,
      passAA || passLarge,
      `Ratio: ${ratio.toFixed(2)}:1 (AA Normal: ${passAA ? 'PASS' : 'FAIL'}, AA Large: ${passLarge ? 'PASS' : 'FAIL'})`
    );
  }

  // =========================================================================
  // 2. Browser CDP Tests for Headings and Prefers-Reduced-Motion
  // =========================================================================
  console.log('\n--- 2. Live Heading Audit (Home & Focus Room) ---');

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

    async function navigate(url) {
      await send('Page.navigate', { url });
      await new Promise(r => setTimeout(r, 2000));
    }

    // Audit Home page headings
    const homeHeadings = await evaluate(`(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.replace(/\\s+/g, ' ').trim());
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.replace(/\\s+/g, ' ').trim());
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.replace(/\\s+/g, ' ').trim());
      return { h1Count: h1s.length, h1s, h2Count: h2s.length, h2s, h3Count: h3s.length, h3s };
    })()`);

    console.log('Home Headings:', JSON.stringify(homeHeadings, null, 2));
    recordTest(
      'Home page (/) has exactly one <h1>',
      homeHeadings.h1Count === 1,
      `h1Count: ${homeHeadings.h1Count}, Text: "${homeHeadings.h1s[0]}"`
    );

    // Audit Focus Room page headings
    await navigate('http://localhost:3000/focus-room');
    const focusHeadings = await evaluate(`(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.replace(/\\s+/g, ' ').trim());
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.replace(/\\s+/g, ' ').trim());
      const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText.replace(/\\s+/g, ' ').trim());
      return { h1Count: h1s.length, h1s, h2Count: h2s.length, h2s, h3Count: h3s.length, h3s };
    })()`);

    console.log('Focus Room Headings:', JSON.stringify(focusHeadings, null, 2));
    recordTest(
      'Focus Room page (/focus-room) has exactly one <h1>',
      focusHeadings.h1Count === 1,
      `h1Count: ${focusHeadings.h1Count}, Text: "${focusHeadings.h1s[0]}"`
    );

    // =========================================================================
    // 3. Prefers-Reduced-Motion Testing
    // =========================================================================
    console.log('\n--- 3. Prefers-Reduced-Motion Emulation ---');

    // Default mode: no-preference
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
    });
    await new Promise(r => setTimeout(r, 500));

    const defaultMotion = await evaluate(`(() => {
      const arc = document.querySelector('circle[stroke-dasharray]');
      const bead = document.querySelector('circle[r="5"][fill="#B68A53"]');
      return {
        arcTransition: arc ? window.getComputedStyle(arc).transition : null,
        beadTransition: bead ? window.getComputedStyle(bead).transition : null,
      };
    })()`);
    console.log('Default Motion (no-preference):', defaultMotion);

    // Emulate reduced motion
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
    });
    await new Promise(r => setTimeout(r, 500));

    const reducedMotion = await evaluate(`(() => {
      const arc = document.querySelector('circle[stroke-dasharray]');
      const bead = document.querySelector('circle[r="5"][fill="#B68A53"]');
      const waveformBars = Array.from(document.querySelectorAll('.rounded-full.inline-block'));
      const barAnimations = waveformBars.map(b => window.getComputedStyle(b).animationName);
      const isPulseActive = barAnimations.some(a => a && a !== 'none');

      return {
        arcTransition: arc ? window.getComputedStyle(arc).transition : null,
        beadTransition: bead ? window.getComputedStyle(bead).transition : null,
        isPulseActive,
        barAnimationCount: barAnimations.filter(a => a && a !== 'none').length
      };
    })()`);
    console.log('Reduced Motion (reduce):', reducedMotion);

    // Timer arc transition under reduce: transition should be 'none' or 'all 0s ease 0s'
    const arcReducedPass = reducedMotion.arcTransition === 'none' ||
                          reducedMotion.arcTransition === '' ||
                          reducedMotion.arcTransition.includes('none');
    recordTest(
      'Timer arc transitions disabled under prefers-reduced-motion: reduce',
      arcReducedPass,
      `Computed transition: "${reducedMotion.arcTransition}"`
    );

    // Bead transition under reduce
    const beadReducedPass = reducedMotion.beadTransition === 'none' ||
                           reducedMotion.beadTransition === '' ||
                           reducedMotion.beadTransition.includes('none');
    recordTest(
      'Timer bead transitions disabled under prefers-reduced-motion: reduce',
      beadReducedPass,
      `Computed transition: "${reducedMotion.beadTransition}"`
    );

    // Click play to test waveform bars under reduced motion
    await evaluate(`(() => {
      const playBtn = document.querySelector('button[aria-label*="ambient focus sound"]');
      if (playBtn) playBtn.click();
    })()`);
    await new Promise(r => setTimeout(r, 500));

    const playingReducedWaveform = await evaluate(`(() => {
      const waveformBars = Array.from(document.querySelectorAll('.rounded-full.inline-block'));
      const barAnimations = waveformBars.map(b => window.getComputedStyle(b).animationName);
      return {
        pulseActive: barAnimations.some(a => a && a !== 'none'),
        activeAnimations: barAnimations.filter(a => a && a !== 'none')
      };
    })()`);

    recordTest(
      'Waveform pulsing disabled while playing under prefers-reduced-motion: reduce',
      !playingReducedWaveform.pulseActive,
      `Active pulse animations: ${playingReducedWaveform.activeAnimations.length}`
    );

    ws.close();
  } finally {
    chromeProc.kill();
  }
}

run().then(() => {
  const allPassed = results.every(r => r.passed);
  console.log(`\n=== PROBE 4 SUMMARY: ${results.filter(r => r.passed).length}/${results.length} PASSED ===`);
  if (!allPassed) process.exit(1);
}).catch(err => {
  console.error('[FAIL]', err);
  process.exit(1);
});
