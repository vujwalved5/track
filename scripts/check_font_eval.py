import subprocess
import os

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

js_script = """
(() => {
  const h1 = document.querySelector('h1');
  const make = h1 ? h1.querySelector('span') : null;
  if (!make) return 'make not found';
  const style = window.getComputedStyle(make);
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    letterSpacing: style.letterSpacing,
    width: make.getBoundingClientRect().width,
    height: make.getBoundingClientRect().height
  };
})()
"""

# Let's write an html file that fetches localhost:3000 in an iframe and evaluates, or runs via node puppeteer if installed
# Let's check node_modules for puppeteer
print('Checking puppeteer in node_modules...')
