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
</style>
</head>
<body>
<div id="content">
  <!-- Option 1 -->
  <div id="opt1" style="margin-bottom: 50px;">
    <div id="m1" style="font-family: 'Instrument Serif', serif; font-size: 158px; letter-spacing: -0.015em; line-height: 0.88; display: inline-block;">Make</div><br>
    <div id="ed1" style="font-family: 'Instrument Serif', serif; font-size: 141px; letter-spacing: -0.03em; line-height: 0.88; display: inline-block;">Every Day</div><br>
    <div id="c1" style="font-family: 'Instrument Serif', serif; font-style: italic; font-size: 165px; letter-spacing: -0.01em; line-height: 0.88; display: inline-block; color: #BD634A;">Count.</div>
  </div>
  <!-- Option 2 -->
  <div id="opt2" style="margin-bottom: 50px;">
    <div id="m2" style="font-family: 'Instrument Serif', serif; font-size: 157px; letter-spacing: -0.012em; line-height: 0.88; display: inline-block;">Make</div><br>
    <div id="ed2" style="font-family: 'Instrument Serif', serif; font-size: 140px; letter-spacing: -0.028em; line-height: 0.88; display: inline-block;">Every Day</div><br>
    <div id="c2" style="font-family: 'Instrument Serif', serif; font-style: italic; font-size: 166px; letter-spacing: -0.012em; line-height: 0.88; display: inline-block; color: #BD634A;">Count.</div>
  </div>
</div>
</body>
</html>
"""

with open('design-reference/compare/test_opt.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
html_path = os.path.abspath("design-reference/compare/test_opt.html")
screenshot_path = os.path.abspath("design-reference/compare/opt_screenshot.png")
tmp_profile = os.path.abspath("tmp_chrome_profile")

cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    f"--user-data-dir={tmp_profile}",
    f"--window-size=1366,1200",
    f"--screenshot={screenshot_path}",
    f"file:///{html_path}"
]

subprocess.run(cmd, check=True)
print("Option test complete")
