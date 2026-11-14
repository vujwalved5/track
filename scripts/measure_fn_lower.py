from PIL import Image

im = Image.open('design-reference/crops/ref_fn_lower.png')

# In ref_fn_lower:
# Search for terracotta text (r > 160, g < 120, b < 100)
# and faint ruled lines (r > 180, g > 180, b > 180 but darker than paper 240)
terracotta_pts = []
for y in range(im.height):
    for x in range(im.width):
        r, g, b = im.getpixel((x, y))[:3]
        if r > 160 and g < 120 and b < 100:
            terracotta_pts.append((x, y))

if terracotta_pts:
    min_x = min(p[0] for p in terracotta_pts)
    max_x = max(p[0] for p in terracotta_pts)
    min_y = min(p[1] for p in terracotta_pts)
    max_y = max(p[1] for p in terracotta_pts)
    print(f'Terracotta text in fn_lower: x={min_x}..{max_x}, y={min_y}..{max_y}')
