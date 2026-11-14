import os
import subprocess

html_content = """<!DOCTYPE html>
<html>
<head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 40px; background: #F4EFE4; }
  .box { display: inline-block; }
</style>
</head>
<body>
<div id="status">Loading...</div>
<div id="content" style="visibility: hidden;">
  <div id="w_make" style="font-family: 'Instrument Serif', serif; font-size: 154px; letter-spacing: -0.02em;">Make</div>
  <div id="w_everyday" style="font-family: 'Instrument Serif', serif; font-size: 144px; letter-spacing: -0.025em;">Every Day</div>
  <div id="w_count" style="font-family: 'Instrument Serif', serif; font-style: italic; font-size: 150px; letter-spacing: -0.015em; color: #BD634A;">Count.</div>
</div>
<script>
document.fonts.ready.then(() => {
  document.getElementById('content').style.visibility = 'visible';
  const m = document.getElementById('w_make').getBoundingClientRect();
  const ed = document.getElementById('w_everyday').getBoundingClientRect();
  const c = document.getElementById('w_count').getBoundingClientRect();
  document.getElementById('status').textContent = JSON.stringify({
    loaded: document.fonts.check("16px 'Instrument Serif'"),
    make: { w: m.width, h: m.height },
    everyDay: { w: ed.width, h: ed.height },
    count: { w: c.width, h: c.height }
  });
  document.body.setAttribute('data-ready', 'true');
});
</script>
</body>
</html>
"""

with open('design-reference/compare/test_font_ready.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
html_path = os.path.abspath("design-reference/compare/test_font_ready.html")
screenshot_path = os.path.abspath("design-reference/compare/font_ready_screenshot.png")
tmp_profile = os.path.abspath("tmp_chrome_profile")

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    f"--user-data-dir={tmp_profile}",
    f"--window-size=1366,768",
    f"--screenshot={screenshot_path}",
    f"file:///{html_path}"
]

subprocess.run(cmd, check=True)
print("Done")
