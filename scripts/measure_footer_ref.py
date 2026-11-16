from PIL import Image

ref_footer = Image.open('design-reference/compare/ref_footer.png')

# Let's crop y from 0 to 250 in ref_footer:
top_part = ref_footer.crop((0, 0, 1366, 250))
top_part.save('design-reference/compare/ref_footer_top_layout.png')
print("Saved ref_footer_top_layout.png")

# Let's find:
# 1. Nav links in ref_footer:
# Where are the nav links located?
# Are they at x around 900..1280, y around 60..120?
# Let's search for text around y in [50..140], x in [800..1300]:
nav_pixels = []
for y in range(50, 150):
    for x in range(800, 1300):
        r, g, b = ref_footer.getpixel((x, y))[:3]
        if r > 180 and g > 180:
            nav_pixels.append((x, y))

if nav_pixels:
    xs = [p[0] for p in nav_pixels]
    ys = [p[1] for p in nav_pixels]
    print(f"Nav links in ref footer: x=[{min(xs)}, {max(xs)}] (w={max(xs)-min(xs)}), y=[{min(ys)}, {max(ys)}] (h={max(ys)-min(ys)})")

# 2. Heading "Until then, take your time." in ref_footer:
# Where is the heading?
# Search for large text pixels:
heading_pixels = []
for y in range(140, 230):
    for x in range(80, 1000):
        r, g, b = ref_footer.getpixel((x, y))[:3]
        if r > 200 and g > 200:
            heading_pixels.append((x, y))

if heading_pixels:
    xs = [p[0] for p in heading_pixels]
    ys = [p[1] for p in heading_pixels]
    print(f"Heading in ref footer: x=[{min(xs)}, {max(xs)}] (w={max(xs)-min(xs)}), y=[{min(ys)}, {max(ys)}] (h={max(ys)-min(ys)})")
