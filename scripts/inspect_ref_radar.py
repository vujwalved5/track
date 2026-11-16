from PIL import Image

ref_radar = Image.open('design-reference/compare/ref_radar.png')
w, h = ref_radar.size
print(f"Radar crop size: {w}x{h}")

# Let's inspect the colors in ref_radar:
# Is there any pink/terracotta (#BD634A) fill?
# Let's check all pixels in ref_radar:
pink_pixels = []
dark_lines = []
for y in range(h):
    for x in range(w):
        r, g, b = ref_radar.getpixel((x, y))[:3]
        # Pink/terracotta has r in 150..220, g in 80..130, b in 60..100
        if r > 160 and g < 130 and b < 100:
            pink_pixels.append((x, y, r, g, b))
        # Dark lines in cream paper (cream paper is r~244, g~239, b~228)
        # Dark lines have r < 120, g < 100, b < 90
        if r < 120 and g < 100 and b < 90:
            dark_lines.append((x, y, r, g, b))

print(f"Pink pixels count in ref radar: {len(pink_pixels)}")
print(f"Dark line pixels in ref radar: {len(dark_lines)}")

# Let's find the bounding box of the radar chart in ref:
# Radar chart has spokes and circles:
# Let's find the center and diameter of the radar chart circle in ref:
# Let's crop tightly around the radar chart:
# In field note:
# Let's find the field note card in ref:
# x around 850..1300, y around 1300..1900
