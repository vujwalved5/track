from PIL import Image

src = Image.open('public/welcome/hero-desk.jpg')
w, h = src.size

cup_src = []
for y in range(0, h, 20):
    for x in range(0, w, 20):
        r, g, b = src.getpixel((x, y))[:3]
        if r > 160 and g > 100 and b < 80:
            cup_src.append((x, y, (r, g, b)))

print('Found', len(cup_src), 'cup points in src photo')
if cup_src:
    min_x = min(p[0] for p in cup_src)
    max_x = max(p[0] for p in cup_src)
    min_y = min(p[1] for p in cup_src)
    max_y = max(p[1] for p in cup_src)
    print(f'Cup in src: x={min_x}..{max_x}, y={min_y}..{max_y}')
