from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In Section 01, Field Note card:
# Where is the radar chart?
# Let's search in x: 880..1300, y: 1400..1850 for circular patterns or the outer circle:
# Let's crop x: 920..1280, y: 1450..1750
chart_crop = ref.crop((920, 1450, 1280, 1750))
chart_crop.save('design-reference/compare/ref_radar_tight.png')

# Find center and diameter of radar chart in chart_crop:
# Let's find the circle center:
# In chart_crop, let's find dark pixels:
w, h = chart_crop.size
print(f"Chart tight crop: {w}x{h}")

# In FocusThePractice.tsx:
# Currently:
# <div className="py-4 my-auto flex flex-col items-center justify-center">
#   <div className="relative w-full max-w-[155px] aspect-square flex items-center justify-center">
#     <svg viewBox="0 0 220 220" ...>
#       <circle cx="110" cy="110" r="70" ... />
# ...
# Notice `max-w-[155px]`!
# What is the size in the reference image?
# Let's measure the outer circle diameter in pixels in ref!
for y in range(h):
    for x in range(w):
        pass

# Let's find horizontal diameter of outer circle by checking along rows and columns:
# Outer circle has radius R.
# Let's test centers and radii:
import math
best = None
max_v = 0
for cy in range(100, 200, 2):
    for cx in range(130, 230, 2):
        for r in range(60, 130, 2):
            # check perimeter darkness
            dark_count = 0
            for deg in range(0, 360, 5):
                rad = math.radians(deg)
                px = int(round(cx + r * math.cos(rad)))
                py = int(round(cy + r * math.sin(rad)))
                if 0 <= px < w and 0 <= py < h:
                    c = chart_crop.getpixel((px, py))[:3]
                    if sum(c)/3 < 150:
                        dark_count += 1
            if dark_count > max_v:
                max_v = dark_count
                best = (cx, cy, r, dark_count)

print("Best circle fit in chart_crop:")
print(f"Center in chart_crop: ({best[0]}, {best[1]}), Radius: {best[2]}px (Diameter = {best[2]*2}px), votes={best[3]}")
page_cx = 920 + best[0]
page_cy = 1450 + best[1]
print(f"Page center: ({page_cx}, {page_cy})")
