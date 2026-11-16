from PIL import Image

f = Image.open('design-reference/compare/ref_footer_complete.png')
w, h = f.size

# Let's find every line of text in ref_footer_complete:
# Scan horizontal slices:
print(f"Footer complete size: {w}x{h}")

# Let's inspect where:
# 1. Eyebrow "TRACK / FOCUS ROOM" and "COMPANION PAGES / DESIGN PREVIEW" are located.
# 2. Nav links "HOME JOURNAL FOCUS ROOM ABOUT" are located.
# 3. Heading "Until then, take your time." is located.
# 4. Paragraph "The Focus Room is being prepared..." is located.
# 5. Colophon bar is located.

for y in range(0, h, 8):
    xs = []
    for x in range(w):
        r, g, b = f.getpixel((x, y))[:3]
        if (r > 150 and g > 150) or (r > 150 and g > 120 and b < 100):
            xs.append(x)
    if xs:
        print(f"rel_y={y} (page_y={3340+y}): text from x={min(xs)} to x={max(xs)} (w={max(xs)-min(xs)})")
