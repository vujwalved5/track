from PIL import Image

im = Image.open('design-reference/compare/ref_footer_top_zoom.png')
# crop was from (80, 3340, 1300, 3550)
# Let's inspect where all elements are relative to this crop:
# Let's find:
# 1. Eyebrows:
# Left: "TRACK / FOCUS ROOM"
# Right: "COMPANION PAGES / DESIGN PREVIEW" or nav links?
# Let's find text in y in [0..100]:
for y in range(0, 100, 5):
    for x in range(0, im.width):
        r, g, b = im.getpixel((x, y))[:3]
        if r > 160 and g > 130:
            pass

# Let's print out what text is on the right side of the footer (x > 800) for all y in 0..150:
for y in range(50, 150, 4):
    right_text = []
    for x in range(800, im.width):
        r, g, b = im.getpixel((x, y))[:3]
        if r > 160 and g > 150:
            right_text.append(80 + x)
    if right_text:
        print(f"y={3340+y}: right text from x={min(right_text)} to x={max(right_text)}")
