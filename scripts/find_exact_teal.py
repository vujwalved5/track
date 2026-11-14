from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
# Search for pixels around (71, 89, 99) in desk
target = (71, 89, 99)
matches = []
for y in range(0, desk.height, 10):
    for x in range(0, desk.width, 10):
        c = desk.getpixel((x, y))[:3]
        d = sum(abs(a - b) for a, b in zip(c, target))
        if d < 15:
            matches.append((x, y, c, d))

print('Found', len(matches), 'close matches to teal (71, 89, 99)')
for m in matches[:10]:
    print(m)
