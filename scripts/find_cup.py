from PIL import Image

ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')
w, h = ref.size

# Search for amber/yellow/orange of the cup (r > 150, g > 100, b < 60)
cup_ref = []
for y in range(0, h, 5):
    for x in range(0, w, 5):
        r, g, b = ref.getpixel((x, y))[:3]
        if r > 160 and g > 100 and b < 80:
            cup_ref.append((x, y, (r, g, b)))

print('Found', len(cup_ref), 'cup points in ref photo')
if cup_ref:
    min_x = min(p[0] for p in cup_ref)
    max_x = max(p[0] for p in cup_ref)
    min_y = min(p[1] for p in cup_ref)
    max_y = max(p[1] for p in cup_ref)
    print(f'Cup in ref: x={min_x}..{max_x}, y={min_y}..{max_y}')
    print(f'Cup in page: x={710+min_x}..{710+max_x}, y={95+min_y}..{95+max_y}')
