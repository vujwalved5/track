from PIL import Image

im = Image.open('design-reference/home.png')

# Field note is on top of desk photo in right panel (panel x: 710..1366)
# Field note paper is cream (#F4EFE4 or similar, r > 230, g > 225, b > 215)
# Desk around it is dark wood (r < 100, g < 100, b < 100) or teal (b > r + 20)
# Search in x: 730..1150, y: 450..850
note_pixels = []
for y in range(450, 850, 2):
    for x in range(730, 1150, 2):
        r, g, b = im.getpixel((x, y))[:3]
        if r > 225 and g > 215 and b > 200:
            note_pixels.append((x, y))

if note_pixels:
    min_x = min(p[0] for p in note_pixels)
    max_x = max(p[0] for p in note_pixels)
    min_y = min(p[1] for p in note_pixels)
    max_y = max(p[1] for p in note_pixels)
    print(f'Field note paper in home.png: x={min_x}..{max_x} (w={max_x-min_x+1}), y={min_y}..{max_y} (h={max_y-min_y+1})')
    print(f'Rel to hero: y={min_y - 95}..{max_y - 95}')
    print(f'Rel to panel (x=710): left={min_x - 710}..{max_x - 710}')
