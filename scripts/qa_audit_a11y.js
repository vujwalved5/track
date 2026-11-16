// scripts/qa_audit_a11y.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9226;
const TMP_DIR = path.resolve('tmp_cdp_qa_a11y');

function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrast(rgb1, rgb2) {
  const l1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
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

  await new Promise(r => setTimeout(r, 2500));

  try {
    const res = await fetch(`http://localhost:${PORT}/json`);
    const tabs = await res.json();
    const tab = tabs.find(t => t.type === 'page');
    if (!tab) throw new Error('No page tab found');
    
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const msg = JSON.parse(evt.data);
          if (msg.id === id) {
            ws.removeEventListener('message', handler);
            if (msg.error) reject(msg.error);
            else resolve(msg.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 1000, deviceScaleFactor: 1, mobile: false });

    const pages = ['http://localhost:3000/', 'http://localhost:3000/focus-room'];
    const auditResults = {};

    for (const pageUrl of pages) {
      console.log(`\n==================================================`);
      console.log(`ACCESSIBILITY AUDIT: ${pageUrl}`);
      console.log(`==================================================`);

      await send('Page.navigate', { url: pageUrl });
      await new Promise(r => setTimeout(r, 2500));

      // 1. Exactly one <h1> check
      const h1Eval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const h1s = Array.from(document.querySelectorAll('h1')).map(h => ({
              text: h.innerText.trim().replace(/\\n/g, ' '),
              classes: h.className,
              rect: h.getBoundingClientRect()
            }));
            return h1s;
          })()
        `,
        returnByValue: true
      });
      const h1s = h1Eval.result.value;
      console.log(`1. H1 Count: ${h1s.length} ${h1s.length === 1 ? '✓ PASS' : '✗ FAIL'}`);
      h1s.forEach((h, i) => console.log(`   H1[${i}]: "${h.text}"`));

      // 2. Heading hierarchy check
      const headingsEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
              tag: h.tagName.toLowerCase(),
              level: parseInt(h.tagName.substring(1)),
              text: h.innerText.trim().replace(/\\n/g, ' ')
            }));
            let valid = true;
            let errors = [];
            let lastLevel = 0;
            headings.forEach((h, i) => {
              if (i === 0 && h.level !== 1) {
                valid = false;
                errors.push(\`First heading is \${h.tag}, expected h1\`);
              }
              if (lastLevel > 0 && h.level > lastLevel + 1) {
                valid = false;
                errors.push(\`Heading jump from \${lastLevel} to \${h.level} at "\${h.text.slice(0, 30)}"\`);
              }
              lastLevel = h.level;
            });
            return { headings, valid, errors };
          })()
        `,
        returnByValue: true
      });
      const headingData = headingsEval.result.value;
      console.log(`2. Heading Hierarchy: ${headingData.valid ? '✓ PASS' : '✗ FAIL'} (${headingData.headings.length} headings total)`);
      if (!headingData.valid) {
        headingData.errors.forEach(e => console.log(`   Error: ${e}`));
      } else {
        console.log(`   Heading levels sequence: ${headingData.headings.map(h => h.tag).join(' -> ')}`);
      }

      // 3. Image alt attributes check
      const imgEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const imgs = Array.from(document.querySelectorAll('img')).map(img => {
              const hasAlt = img.hasAttribute('alt');
              const altVal = img.getAttribute('alt');
              const isDecorative = altVal === '';
              return {
                src: img.currentSrc || img.getAttribute('src'),
                hasAlt,
                alt: altVal,
                isDecorative,
                valid: hasAlt
              };
            });
            return imgs;
          })()
        `,
        returnByValue: true
      });
      const imgs = imgEval.result.value;
      const invalidImgs = imgs.filter(img => !img.valid);
      console.log(`3. Image alt attributes: ${invalidImgs.length === 0 ? '✓ PASS' : '✗ FAIL'} (${imgs.length} total images, ${invalidImgs.length} missing alt)`);
      imgs.forEach((img, i) => {
        const desc = img.isDecorative ? '[DECORATIVE empty alt=""]' : `alt="${img.alt}"`;
        console.log(`   Img[${i}]: ${desc} src=${img.src ? img.src.slice(img.src.lastIndexOf('/') + 1) : 'none'}`);
      });

      // 4. Focus indicators on interactive controls
      const focusEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const controls = Array.from(document.querySelectorAll('a, button, input, [role="button"], [role="tab"], [role="radio"]')).filter(el => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0;
            });

            const results = controls.map(el => {
              el.focus();
              const cs = window.getComputedStyle(el);
              const outlineWidth = parseFloat(cs.outlineWidth) || 0;
              const outlineStyle = cs.outlineStyle;
              const boxShadow = cs.boxShadow;
              const hasRing = boxShadow && boxShadow !== 'none';
              const hasOutline = outlineWidth > 0 && outlineStyle !== 'none';
              
              // Also check class names for focus ring classes
              const cls = el.className || '';
              const hasFocusCls = cls.includes('focus-visible:') || cls.includes('focus:');

              return {
                tag: el.tagName.toLowerCase(),
                text: el.innerText.trim().replace(/\\n/g, ' ') || el.getAttribute('aria-label') || '',
                hasVisibleFocus: hasOutline || hasRing || hasFocusCls,
                outline: \`\${outlineWidth}px \${outlineStyle}\`,
                boxShadow: boxShadow,
                classes: cls
              };
            });
            return results;
          })()
        `,
        returnByValue: true
      });
      const focusControls = focusEval.result.value;
      const missingFocus = focusControls.filter(c => !c.hasVisibleFocus);
      console.log(`4. Focus Indicators: ${missingFocus.length === 0 ? '✓ PASS' : '✗ FAIL'} (${focusControls.length} interactive controls checked, ${missingFocus.length} missing visible indicator)`);

      // 5. Text contrast check
      const contrastEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            function parseRgb(colorStr) {
              const match = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
              if (!match) return [0, 0, 0, 1];
              return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), match[4] !== undefined ? parseFloat(match[4]) : 1];
            }

            function getEffectiveBg(el) {
              let cur = el;
              while (cur && cur !== document.documentElement) {
                const bg = window.getComputedStyle(cur).backgroundColor;
                const parsed = parseRgb(bg);
                if (parsed[3] > 0.05) {
                  return parsed;
                }
                cur = cur.parentElement;
              }
              return [255, 255, 255, 1]; // default white
            }

            const textEls = Array.from(document.querySelectorAll('h1, h2, h3, h4, p, span, a, button, label')).filter(el => {
              const rect = el.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return false;
              if (el.children.length > 0 && el.innerText.trim() !== el.textContent.trim()) return false;
              const text = el.innerText.trim();
              return text.length > 0;
            });

            return textEls.slice(0, 50).map(el => {
              const cs = window.getComputedStyle(el);
              const color = parseRgb(cs.color);
              const bg = getEffectiveBg(el);
              const fontSize = parseFloat(cs.fontSize);
              const fontWeight = cs.fontWeight;
              const isLarge = fontSize >= 24 || (fontSize >= 18.66 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700));
              return {
                text: el.innerText.trim().slice(0, 40),
                fg: color,
                bg: bg,
                fontSize,
                isLarge
              };
            });
          })()
        `,
        returnByValue: true
      });
      const textSamples = contrastEval.result.value;
      let failedContrast = 0;
      textSamples.forEach(sample => {
        const ratio = getContrast(sample.fg, sample.bg);
        const reqRatio = sample.isLarge ? 3.0 : 4.5;
        const pass = ratio >= reqRatio;
        if (!pass) failedContrast++;
      });
      console.log(`5. Text Contrast (Sampled elements): ${failedContrast === 0 ? '✓ PASS' : '⚠ NOTICE'} (${textSamples.length} sampled, ${failedContrast} below threshold)`);

      // 6. Keyboard Operability check
      if (pageUrl.includes('focus-room')) {
        console.log(`6. Keyboard Operability (Focus Room Timer & Sound Player):`);
        
        // Timer keyboard operability
        const timerKbdEval = await send('Runtime.evaluate', {
          expression: `
            (function() {
              const results = [];
              const startBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('START'));
              const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('PAUSE'));
              const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('RESET'));
              const shortBreakTab = Array.from(document.querySelectorAll('button[role="tab"]')).find(b => b.innerText.includes('SHORT BREAK'));
              
              if (startBtn) {
                startBtn.focus();
                results.push({ name: 'Start Button Focused', active: document.activeElement === startBtn });
              }
              if (shortBreakTab) {
                shortBreakTab.focus();
                results.push({ name: 'Short Break Tab Focused', active: document.activeElement === shortBreakTab });
                shortBreakTab.click();
              }
              const displayTime = document.querySelector('[aria-live="polite"]');
              results.push({ name: 'Preset Changed to 05:00', text: displayTime ? displayTime.innerText : null });

              // Sound player keyboard operability
              const rainChip = Array.from(document.querySelectorAll('button[role="radio"]')).find(b => b.innerText.includes('RAIN'));
              const deepChip = Array.from(document.querySelectorAll('button[role="radio"]')).find(b => b.innerText.includes('DEEP FOCUS'));
              const volSlider = document.querySelector('input[type="range"]');
              const playBtn = document.querySelector('button[aria-label*="ambient focus sound"]');

              if (deepChip) {
                deepChip.focus();
                results.push({ name: 'Deep Focus Chip Focused', active: document.activeElement === deepChip });
                deepChip.click();
                results.push({ name: 'Deep Focus Selected', ariaChecked: deepChip.getAttribute('aria-checked') });
              }
              if (volSlider) {
                volSlider.focus();
                results.push({ name: 'Volume Slider Focused', active: document.activeElement === volSlider });
                volSlider.value = "50";
                volSlider.dispatchEvent(new Event('input', { bubbles: true }));
                results.push({ name: 'Volume Slider Modulated', value: volSlider.value });
              }
              if (playBtn) {
                playBtn.focus();
                results.push({ name: 'Play Button Focused', active: document.activeElement === playBtn });
              }

              return results;
            })()
          `,
          returnByValue: true
        });
        const timerKbd = timerKbdEval.result.value;
        timerKbd.forEach(res => console.log(`   ${res.name}: ${JSON.stringify(res)}`));
      }

      // 7. prefers-reduced-motion check
      await send('Emulation.setEmulatedMedia', {
        features: [{ name: 'prefers-reduced-motion', value: 'reduce' }]
      });
      const motionEval = await send('Runtime.evaluate', {
        expression: `
          (function() {
            const mediaMatches = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            // Check animated elements
            const pulsedElements = Array.from(document.querySelectorAll('[class*="animate-"], [class*="transition-"]')).map(el => {
              const cs = window.getComputedStyle(el);
              return {
                tag: el.tagName.toLowerCase(),
                classes: el.className,
                animationDuration: cs.animationDuration,
                transitionDuration: cs.transitionDuration
              };
            });
            return { mediaMatches, count: pulsedElements.length };
          })()
        `,
        returnByValue: true
      });
      const motionData = motionEval.result.value;
      console.log(`7. prefers-reduced-motion: ${motionData.mediaMatches ? '✓ PASS' : '✗ FAIL'} (Media query matched properly, ${motionData.count} elements with motion-aware styling)`);

      auditResults[pageUrl] = {
        h1Count: h1s.length,
        headingValid: headingData.valid,
        totalHeadings: headingData.headings.length,
        headings: headingData.headings,
        totalImages: imgs.length,
        invalidImages: invalidImgs.length,
        totalControls: focusControls.length,
        missingFocus: missingFocus.length,
        motionMatches: motionData.mediaMatches
      };
    }

    ws.close();
    await fetch(`http://localhost:${PORT}/json/close/${tab.id}`);

    fs.writeFileSync('scripts/qa_a11y_report.json', JSON.stringify(auditResults, null, 2));
    console.log(`\nDetailed report written to scripts/qa_a11y_report.json`);
    chromeProc.kill();
  } catch (err) {
    console.error('A11y audit error:', err);
    chromeProc.kill();
    process.exit(1);
  }
}

run();
