import os
import subprocess
import shutil

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

out_path = os.path.abspath("design-reference/compare/current_site_1366.png")
tmp_profile = os.path.abspath("tmp_chrome_snap")
if os.path.exists(tmp_profile):
    shutil.rmtree(tmp_profile, ignore_errors=True)

# Using --virtual-time-budget=5000 allows all web fonts to load before screenshot!
cmd = [
    chrome_path,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--virtual-time-budget=5000",
    f"--user-data-dir={tmp_profile}",
    "--window-size=1366,1900",
    f"--screenshot={out_path}",
    "http://localhost:3000"
]

print("Capturing with virtual time budget...")
subprocess.run(cmd, check=True)
print("Saved", out_path)
