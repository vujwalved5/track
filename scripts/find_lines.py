from PIL import Image

im = Image.open('design-reference/crops/ref_fn_lower.png')

# Find horizontal lines across x=40..250 between y=20 and y=160
for y in range(20, 160):
    row = [im.getpixel((x, y))[:3] for x in range(50, 240)]
    # Average luminance
    lum = sum(0.299*r + 0.587*g + 0.114*b for r, g, b in row) / len(row)
    if lum < 232:
        print(f'Line candidate at y={y}: lum={lum:.1f}')
