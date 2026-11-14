import os
import subprocess
import json

test_html = """<!DOCTYPE html>
<html>
<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 50px; background: #F4EFE4; }
  .test { font-family: 'Instrument Serif', Georgia, serif; line-height: 0.88; font-weight: normal; margin-bottom: 40px; }
  .make { display: inline-block; color: #172536; }
  .everyday { display: inline-block; color: #172536; }
  .count { display: inline-block; font-style: italic; color: #BD634A; }
</style>
</head>
<body>
<div id="container"></div>
<script>
window.onload = function() {
  const container = document.getElementById('container');
  const configs = [
    // Uniform sizes
    { name: 'uniform_142', makeSize: 142, makeTrack: '-0.035em', edSize: 142, edTrack: '-0.035em', cntSize: 142, cntTrack: '-0.035em' },
    { name: 'uniform_150', makeSize: 150, makeTrack: '-0.03em', edSize: 150, edTrack: '-0.03em', cntSize: 150, cntTrack: '-0.03em' },
    { name: 'uniform_155', makeSize: 155, makeTrack: '-0.03em', edSize: 155, edTrack: '-0.03em', cntSize: 155, cntTrack: '-0.03em' },
    { name: 'uniform_160', makeSize: 160, makeTrack: '-0.03em', edSize: 160, edTrack: '-0.03em', cntSize: 160, cntTrack: '-0.03em' },
    // Tuned per-word to hit 277, 445, 364
    { name: 'tuned_A', makeSize: 165, makeTrack: '0.01em', edSize: 144, edTrack: '-0.03em', cntSize: 148, cntTrack: '-0.02em' },
    { name: 'tuned_B', makeSize: 162, makeTrack: '0.015em', edSize: 144, edTrack: '-0.025em', cntSize: 146, cntTrack: '-0.015em' },
    { name: 'tuned_C', makeSize: 168, makeTrack: '-0.01em', edSize: 145, edTrack: '-0.03em', cntSize: 148, cntTrack: '-0.02em' },
    { name: 'tuned_D', makeSize: 166, makeTrack: '0em', edSize: 144, edTrack: '-0.028em', cntSize: 146, cntTrack: '-0.02em' }
  ];

  const results = [];
  configs.forEach(c => {
    const div = document.createElement('div');
    div.className = 'test';
    div.id = c.name;
    
    const m = document.createElement('span');
    m.className = 'make';
    m.textContent = 'Make';
    m.style.fontSize = c.makeSize + 'px';
    m.style.letterSpacing = c.makeTrack;
    
    const ed = document.createElement('span');
    ed.className = 'everyday';
    ed.textContent = 'Every Day';
    ed.style.fontSize = c.edSize + 'px';
    ed.style.letterSpacing = c.edTrack;
    
    const cnt = document.createElement('span');
    cnt.className = 'count';
    cnt.textContent = 'Count.';
    cnt.style.fontSize = c.cntSize + 'px';
    cnt.style.letterSpacing = c.cntTrack;
    
    div.appendChild(m);
    div.appendChild(document.createElement('br'));
    div.appendChild(ed);
    div.appendChild(document.createElement('br'));
    div.appendChild(cnt);
    container.appendChild(div);
    
    const rm = m.getBoundingClientRect();
    const red = ed.getBoundingClientRect();
    const rcnt = cnt.getBoundingClientRect();
    results.push({
      name: c.name,
      make: { w: Math.round(rm.width), h: Math.round(rm.height) },
      everyDay: { w: Math.round(red.width), h: Math.round(red.height) },
      count: { w: Math.round(rcnt.width), h: Math.round(rcnt.height) }
    });
  });
  
  const res = document.createElement('pre');
  res.id = 'output';
  res.textContent = JSON.stringify(results, null, 2);
  document.body.appendChild(res);
  document.body.setAttribute('data-ready', 'true');
};
</script>
</body>
</html>
"""

with open('design-reference/compare/test_tune_headline.html', 'w', encoding='utf-8') as f:
    f.write(test_html)
print('Saved test_tune_headline.html')
