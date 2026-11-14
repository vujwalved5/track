import os
import subprocess
import time
import json
from PIL import Image

# Path to chrome
chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

html_path = os.path.abspath("design-reference/compare/test_tune_headline.html")
screenshot_path = os.path.abspath("design-reference/compare/tune_headline_screenshot.png")
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

print("Running Chrome...")
subprocess.run(cmd, check=True)
print("Screenshot captured at:", screenshot_path)
