from PIL import Image
import math

mid = Image.open('design-reference/compare/ref_field_note_middle.png')
w, h = mid.size

# Let's find dark pixels first!
dark_pixels = []
for y in range(h):
    for x in range(w):
        c = mid.getpixel((x, y))[:3]
        if sum(c)/3 < 160:
            dark_pixels.append((x, y))

print(f"Dark pixels: {len(dark_pixels)}")
# Let's find bounding box of the radar chart inside mid:
# The radar chart is isolated in the middle of this image!
min_x = min(p[0] for p in dark_pixels)
max_x = max(p[0] for p in dark_pixels)
min_y = min(p[1] for p in dark_pixels)
max_y = max(p[1] for p in dark_pixels)
print(f"Radar chart bounds in mid: x=[{min_x}, {max_x}] (w={max_x - min_x}), y=[{min_y}, {max_y}] (h={max_y - min_y})")

cx = (min_x + max_x) // 2
cy = (min_y + max_y) // 2
print(f"Center in mid: ({cx}, {cy})")

# Let's crop it tightly
crop_radar = mid.crop((min_x - 10, min_y - 10, max_x + 10, max_y + 10))
crop_radar.save('design-reference/compare/ref_radar_tight_measured.png')
print("Saved ref_radar_tight_measured.png")

# Now let's check the radius:
# Distance from center to outer dark pixels:
radii = [math.hypot(p[0] - cx, p[1] - cy) for p in dark_pixels]
print(f"Max distance from center (outer circle radius): {max(radii):.1f}px")
print(f"Outer circle diameter: {max(radii)*2:.1f}px")
