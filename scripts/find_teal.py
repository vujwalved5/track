from PIL import Image

src = Image.open('public/welcome/hero-desk.jpg')
w, h = src.size

# Search for teal-blue pixels: r < 120, g > 130, b > 140 (or b > r + 30 and g > r + 20)
teal_points = []
for y in range(0, h, 20):
    for x in range(0, w, 20):
        r, g, b = src.getpixel((x, y))[:3]
        if b > r + 25 and g > r + 15:
            teal_points.append((x, y, (r, g, b)))

print('Found', len(teal_points), 'teal points in hero-desk.jpg')
if teal_points:
    min_x = min(p[0] for p in teal_points)
    max_x = max(p[0] for p in teal_points)
    min_y = min(p[1] for p in teal_points)
    max_y = max(p[1] for p in teal_points)
    print(f'Teal magazine in hero-desk.jpg: x={min_x}..{max_x}, y={min_y}..{max_y}')
