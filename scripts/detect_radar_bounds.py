from PIL import Image

ref_radar = Image.open('design-reference/compare/ref_radar.png')
# Let's save a clear crop of the radar chart with enhanced contrast:
# Where is the radar chart in ref_radar?
# In ref_radar (crop was from (850, 1400, 1300, 1850)):
# Let's find the radar chart coordinates in ref:
# Let's search for the crosshairs '+' or the polygon vertices:
# In FocusThePractice.tsx:
# <polygon points="98,52 155,88 142,148 78,148 58,96" ... />
# <text ...>NORTH / 02</text>
# Let's find the polygon and text in ref_radar:
w, h = ref_radar.size
# Find where NORTH or '+' is:
# Let's scan for the darkest pixels:
# The ink color on cream paper:
# In cream paper, r > 230, g > 220, b > 200.
# Any ink line has r < 100, g < 100, b < 100.
ink_pts = []
for y in range(h):
    for x in range(w):
        r, g, b = ref_radar.getpixel((x, y))[:3]
        if r < 120 and g < 110 and b < 110:
            ink_pts.append((x, y))

print(f"Ink points in ref_radar: {len(ink_pts)}")
if ink_pts:
    xs = [p[0] for p in ink_pts]
    ys = [p[1] for p in ink_pts]
    print(f"Ink bounding box in ref_radar: x=[{min(xs)}, {max(xs)}], y=[{min(ys)}, {max(ys)}]")
    # Crop tightly to the ink points:
    tight = ref_radar.crop((min(xs), min(ys), max(xs), max(ys)))
    tight.save('design-reference/compare/radar_tight_detected.png')
    print("Saved radar_tight_detected.png")
