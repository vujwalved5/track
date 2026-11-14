from PIL import Image

m = Image.open('design-reference/crops/polaroid_mask.png')
# Find connected component of the polaroid
# In crops (1050, 60, 1366, 380)
# Let's inspect rows around y=100..200
left_x = []
for y in range(40, m.height - 40):
    row = [x for x in range(30, m.width) if m.getpixel((x, y)) == 255]
    if row:
        left_x.append((row[0], y))

# Top-left corner of the polaroid
print('Leftmost edge points (rel to 1050):', sorted(left_x, key=lambda p: p[0])[:5])
min_rel_x, best_y = sorted(left_x, key=lambda p: p[0])[0]
print(f'Polaroid left corner: page x={1050 + min_rel_x}, page y={60 + best_y}')
