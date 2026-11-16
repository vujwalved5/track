from PIL import Image

im = Image.open('design-reference/compare/lamp_hc_zoom.png')
w, h = im.size

# Let's see what circular features exist in lamp_hc_zoom:
# Let's scan for any circular arcs or concentric rings.
# Where is the lamp center in lamp_hc_zoom?
# lamp_hc was cropped with box (200, 50, 500, 350)
# So rel center (352, 158) in lamp_hc is at (152, 108).
# Let's check pixel values around (152, 108):
print(f"Center in crop: (152, 108)")
for r in [30, 50, 70, 90, 110, 130, 150]:
    import math
    vals = []
    for deg in range(0, 360, 10):
        rad = math.radians(deg)
        x = int(round(152 + r * math.cos(rad)))
        y = int(round(108 + r * math.sin(rad)))
        if 0 <= x < w and 0 <= y < h:
            vals.append(sum(im.getpixel((x, y))[:3])/3)
    avg = sum(vals)/len(vals) if vals else 0
    print(f"r={r}: avg={avg:.1f}, min={min(vals):.1f}, max={max(vals):.1f}")
