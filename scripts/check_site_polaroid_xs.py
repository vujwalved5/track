from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')
col_1365 = [site.getpixel((1365, y))[:3] for y in range(95, 350)]
print('Col 1365 sample:', col_1365[30:50])
# What is the max x of the polaroid in site?
polaroid_xs = []
for y in range(95, 350):
    for x in range(1100, 1366):
        c = site.getpixel((x, y))[:3]
        if c[0] > 220 and c[1] > 215 and c[2] > 200:
            polaroid_xs.append(x)

print(f'Polaroid x in site: {min(polaroid_xs)}..{max(polaroid_xs)}')
