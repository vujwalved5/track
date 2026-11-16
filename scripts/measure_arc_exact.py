from PIL import Image
import math

dial_crop = Image.open('design-reference/compare/ref_dial_full.png')
w, h = dial_crop.size

# Let's find the circle center of the dial in dial_crop:
# The center of the 25:00 dial
# Let's find dial center by looking at the track ring:
# In FocusThePractice.tsx:
# cx=250, cy=250, r=180
# In ref_dial_full, let's find the dial center and measure where the gold arc starts and ends:
# Let's check angles from 0 to 360 in 1 degree steps:
# For each angle, what is the maximum gold intensity along the radius dist in [165..195]?
# Let's first pinpoint exact center:
# Center is between the four cardinal ticks!
# Cardinal ticks: top (12 o'clock), bottom (6 o'clock), left (9 o'clock), right (3 o'clock).
# Let's find the cardinal ticks in dial_crop:
# Top tick (dy < 0, dx ~ 0), bottom tick (dy > 0, dx ~ 0), left tick (dx < 0, dy ~ 0), right tick (dx > 0, dy ~ 0).
# Let's find the dial center by scanning:
# Let's test centers around (325, 350..420):
best_c = None
best_sym = 0
for cy in range(300, 420):
    for cx in range(300, 360):
        # check circle at r=180
        pass

# Let's inspect where 25:00 text is in dial_crop:
# 25:00 text is centered inside the dial!
# Find center of '25:00' text:
text_pts = []
for y in range(h):
    for x in range(w):
        r, g, b = dial_crop.getpixel((x, y))[:3]
        # cream text: r > 230, g > 220, b > 200
        if r > 230 and g > 220 and b > 200:
            text_pts.append((x, y))

# The large digits '25:00' are in the center:
digits = [p for p in text_pts if 200 < p[0] < 450 and 200 < p[1] < 500]
cx = sum(p[0] for p in digits)/len(digits)
cy = sum(p[1] for p in digits)/len(digits)
print(f"Dial text center: ({cx:.1f}, {cy:.1f})")

# Now check the arc around this center at r ~ 180 (dist in 165..195):
arc_by_deg = {}
for deg in range(360):
    rad = math.radians(deg)
    # 0 deg is 12 o'clock
    dx = math.sin(rad)
    dy = -math.cos(rad)
    # sample along radius dist in 160..200
    is_gold = False
    for dist in range(165, 195):
        px = int(round(cx + dist * dx))
        py = int(round(cy + dist * dy))
        if 0 <= px < w and 0 <= py < h:
            r, g, b = dial_crop.getpixel((px, py))[:3]
            if r > 140 and g > 110 and b < 100:
                is_gold = True
                break
    arc_by_deg[deg] = is_gold

# Find continuous runs of gold arc starting from 0 deg (12 o'clock):
gold_degs = [deg for deg in range(360) if arc_by_deg[deg]]
print(f"Gold arc active degrees around 12 o'clock:")
# Group into continuous spans:
runs = []
curr = []
for d in range(360):
    if arc_by_deg[d]:
        curr.append(d)
    else:
        if curr:
            runs.append(curr)
            curr = []
if curr:
    runs.append(curr)

for r in runs:
    print(f"Run: {r[0]}° to {r[-1]}° (span: {len(r)}°)")
