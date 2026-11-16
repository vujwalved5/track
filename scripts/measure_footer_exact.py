from PIL import Image

f = Image.open('design-reference/compare/ref_footer_complete.png')

# In ref_footer_complete (starts at page_y=3340):
# Let's find:
# 1. Exact bounds of the nav links:
nav_pts = []
for y in range(85, 140):
    for x in range(950, 1300):
        r, g, b = f.getpixel((x, y))[:3]
        if r > 160 and g > 160 and b > 140:
            nav_pts.append((x, y))

if nav_pts:
    xs = [p[0] for p in nav_pts]
    ys = [p[1] for p in nav_pts]
    print(f"Nav links in ref_footer_complete:")
    print(f"X: {min(xs)} .. {max(xs)} (w = {max(xs) - min(xs)})")
    print(f"Y (rel to footer): {min(ys)} .. {max(ys)} (h = {max(ys) - min(ys)})")
    print(f"Y (page abs): {3340 + min(ys)} .. {3340 + max(ys)}")

# 2. Exact bounds of the heading "Until then, take your time.":
h_pts = []
for y in range(100, 200):
    for x in range(80, 960):
        r, g, b = f.getpixel((x, y))[:3]
        if r > 200 and g > 200 and b > 180:
            h_pts.append((x, y))

if h_pts:
    xs = [p[0] for p in h_pts]
    ys = [p[1] for p in h_pts]
    print(f"\nHeading in ref_footer_complete:")
    print(f"X: {min(xs)} .. {max(xs)} (w = {max(xs) - min(xs)})")
    print(f"Y (rel to footer): {min(ys)} .. {max(ys)} (h = {max(ys) - min(ys)})")
    print(f"Y (page abs): {3340 + min(ys)} .. {3340 + max(ys)}")

# 3. Eyebrow row:
eyebrow_pts = []
for y in range(50, 90):
    for x in range(80, 1300):
        r, g, b = f.getpixel((x, y))[:3]
        if r > 160 and g > 120 and b < 110:
            eyebrow_pts.append((x, y))

if eyebrow_pts:
    xs = [p[0] for p in eyebrow_pts]
    ys = [p[1] for p in eyebrow_pts]
    print(f"\nEyebrow row in ref_footer_complete:")
    print(f"Y (rel to footer): {min(ys)} .. {max(ys)}")
    print(f"Y (page abs): {3340 + min(ys)} .. {3340 + max(ys)}")
