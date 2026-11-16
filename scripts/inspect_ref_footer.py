from PIL import Image

ref_footer = Image.open('design-reference/compare/ref_footer.png')
w, h = ref_footer.size
print(f"Ref footer crop size: {w}x{h}")

# In FocusRoom reference:
# Where is the footer heading "Until then, take your time."?
# Where are the nav links: HOME JOURNAL FOCUS ROOM ABOUT?
# Let's find their positions in ref_footer:
# Scan for cream text pixels (r > 200, g > 200, b > 190):
# Save an image with bounding boxes or inspect lines:
ref_footer.save('design-reference/compare/ref_footer_full.png')

# Let's find text lines in ref_footer:
for y in range(0, h, 10):
    xs = []
    for x in range(0, w):
        r, g, b = ref_footer.getpixel((x, y))[:3]
        if r > 180 and g > 180 and b > 160:
            xs.append(x)
    if xs:
        print(f"y={y}: text from x={min(xs)} to x={max(xs)} (w={max(xs) - min(xs)})")
