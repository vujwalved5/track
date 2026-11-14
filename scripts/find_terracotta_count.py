from PIL import Image

site = Image.open('design-reference/crops/site_count_area.png')
# Search for terracotta (r > 150 and r > g + 40 and r > b + 50)
terra_pts = []
for y in range(site.height):
    for x in range(site.width):
        r, g, b = site.getpixel((x, y))[:3]
        if r > 140 and (r - g) > 35 and (r - b) > 45:
            terra_pts.append((x + 80, y + 500, (r, g, b)))

print("Terracotta pixels in Count.:", len(terra_pts))
if terra_pts:
    min_x = min(p[0] for p in terra_pts)
    max_x = max(p[0] for p in terra_pts)
    min_y = min(p[1] for p in terra_pts)
    max_y = max(p[1] for p in terra_pts)
    print(f"Terracotta Count.: x={min_x}..{max_x} (w={max_x-min_x+1}), y={min_y}..{max_y} (rel y={min_y-95}..{max_y-95}, h={max_y-min_y+1})")
    print("Sample terracotta pixel:", terra_pts[len(terra_pts)//2])
