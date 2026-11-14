from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')

# Inspect x=1340..1365 at y=95..400
for y in range(95, 300, 20):
    row = [site.getpixel((x, y))[:3] for x in range(1340, 1366)]
    # Check if there is polaroid
    print(f'y={y}: min={min(row)}, max={max(row)}')
