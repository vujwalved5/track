from PIL import Image

ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')
w, h = ref.size

teal_ref = []
for y in range(0, h, 5):
    for x in range(0, w, 5):
        r, g, b = ref.getpixel((x, y))[:3]
        if b > r + 15 and g > r + 10:
            teal_ref.append((x, y, (r, g, b)))

print('Found', len(teal_ref), 'teal points in ref_hero_photo_actual.png')
if teal_ref:
    min_x = min(p[0] for p in teal_ref)
    max_x = max(p[0] for p in teal_ref)
    min_y = min(p[1] for p in teal_ref)
    max_y = max(p[1] for p in teal_ref)
    print(f'Teal in ref: x={min_x}..{max_x}, y={min_y}..{max_y}')
    print('Sample teal pixel in ref:', teal_ref[len(teal_ref)//2])
