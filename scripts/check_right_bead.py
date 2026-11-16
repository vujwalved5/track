from PIL import Image

im = Image.open('design-reference/compare/ref_dial_right_arc.png')
# Check gold pixels in right arc:
gold = []
for y in range(im.height):
    for x in range(im.width):
        r, g, b = im.getpixel((x, y))[:3]
        if r > 140 and g > 110 and b < 100:
            gold.append((x, y, r, g, b))

print(f"Gold pixels in right arc: {len(gold)}")
