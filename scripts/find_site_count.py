from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')
# Scan for #BD634A (r: 160..210, g: 80..130, b: 60..100) around y=480..620
count_pts = []
for y in range(480, 640):
    for x in range(80, 500):
        r, g, b = site.getpixel((x, y))[:3]
        if r > 150 and g < 130 and b < 110 and (r - g) > 40:
            count_pts.append((x, y))

if count_pts:
    min_x = min(p[0] for p in count_pts)
    max_x = max(p[0] for p in count_pts)
    min_y = min(p[1] for p in count_pts)
    max_y = max(p[1] for p in count_pts)
    print(f"Site Count.: x={min_x}..{max_x} (w={max_x-min_x+1}), y={min_y}..{max_y} (rel y={min_y-95}..{max_y-95}, h={max_y-min_y+1})")
