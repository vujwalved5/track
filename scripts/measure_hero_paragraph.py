from PIL import Image

ref = Image.open('design-reference/focus-room.png')
# Hero paragraph in focus-room.png:
# In FocusHero.tsx:
# Paragraph: y=538 abs, 2 lines matching reference
# Let's crop x: 80..600, y: 500..600 in focus-room.png
crop = ref.crop((80, 500, 600, 600))
crop.save('design-reference/compare/ref_hero_paragraph_zoom.png')
print("Saved ref_hero_paragraph_zoom.png")

# Let's check where the text pixels are in this crop:
# Scan horizontal rows from y=500 to y=600 to find the text lines:
for y in range(500, 600):
    text_xs = []
    for x in range(80, 600):
        r, g, b = ref.getpixel((x, y))[:3]
        if r > 100 or g > 100 or b > 100:
            text_xs.append(x)
    if text_xs:
        min_x = min(text_xs)
        max_x = max(text_xs)
        print(f"y={y}: text from x={min_x} to x={max_x} (width={max_x - min_x})")
