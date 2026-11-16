from PIL import Image

top_part = Image.open('design-reference/compare/ref_footer_top_layout.png')
w, h = top_part.size

# Let's inspect where text is across the entire top_part:
# Find all text clusters in top_part:
# Let's print out all lines of text:
for y in range(0, 150, 5):
    xs = []
    for x in range(w):
        r, g, b = top_part.getpixel((x, y))[:3]
        if r > 160 and g > 150:
            xs.append(x)
    if xs:
        print(f"y={y}: text from x={min(xs)} to x={max(xs)}")
