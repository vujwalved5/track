from PIL import Image

mid = Image.open('design-reference/compare/ref_field_note_middle.png')
w, h = mid.size

# Let's inspect where the circle is in mid:
# Let's find dark pixels that belong to the radar chart:
# Check lines and circle in mid:
# Find outer circle diameter:
# In mid, let's search for the outer circle:
# Center is roughly x ~ 175, y ~ 160
# Let's test radii R from 60 to 140 from center (cx, cy):
import math
best = None
max_c = 0
for cy in range(120, 200):
    for cx in range(140, 210):
        for r in range(60, 140):
            # check 72 points on circle
            dark = 0
            for deg in range(0, 360, 5):
                rad = math.radians(deg)
                px = int(round(cx + r * math.cos(rad)))
                py = int(round(cy + r * math.sin(rad)))
                if 0 <= px < w and 0 <= py < h:
                    c = mid.getpixel((px, py))[:3]
                    if sum(c)/3 < 180:
                        dark += 1
            if dark > max_c:
                max_c = dark
                best = (cx, cy, r, dark)

print(f"Detected circle in mid: cx={best[0]}, cy={best[1]}, r={best[2]} (diameter = {best[2]*2}px), votes={best[3]}")

# Let's check the strokes, spoke lines, polygon fill in this detected radar chart:
crop_radar = mid.crop((best[0] - best[2] - 30, best[1] - best[2] - 30, best[0] + best[2] + 30, best[1] + best[2] + 30))
crop_radar.save('design-reference/compare/ref_radar_extracted.png')
print("Saved ref_radar_extracted.png")

# Let's check colors inside the polygon:
# Any pink or terracotta?
# What is the stroke color and opacity?
colors = []
for y in range(crop_radar.height):
    for x in range(crop_radar.width):
        r, g, b = crop_radar.getpixel((x, y))[:3]
        if sum((r, g, b))/3 < 200:
            colors.append((r, g, b))

avg_r = sum(c[0] for c in colors)/len(colors)
avg_g = sum(c[1] for c in colors)/len(colors)
avg_b = sum(c[2] for c in colors)/len(colors)
print(f"Average stroke RGB: ({avg_r:.1f}, {avg_g:.1f}, {avg_b:.1f})")
