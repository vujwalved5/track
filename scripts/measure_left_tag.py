from PIL import Image

im = Image.open('design-reference/home.png')

# Left vertical tag in home.png
# Scan x: 10..40, y: 100..400 for dark text
tag_pts = []
for y in range(100, 400):
    for x in range(10, 40):
        r, g, b = im.getpixel((x, y))[:3]
        if r < 120 and g < 100 and b < 80:
            tag_pts.append((x, y))

if tag_pts:
    min_x = min(p[0] for p in tag_pts)
    max_x = max(p[0] for p in tag_pts)
    min_y = min(p[1] for p in tag_pts)
    max_y = max(p[1] for p in tag_pts)
    print(f'Left vertical tag in home.png: x={min_x}..{max_x} (w={max_x-min_x+1}), y={min_y}..{max_y} (h={max_y-min_y+1})')
    print(f'Rel to hero: y={min_y - 95}..{max_y - 95}')
