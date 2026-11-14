from PIL import Image

site = Image.open('design-reference/crops/site_count_area.png')
# crop was from y=500..650
# Below y=542 is rel y=42 in crop
bg = (244, 239, 228)
non_bg = []
for y in range(45, site.height):
    for x in range(site.width):
        c = site.getpixel((x, y))[:3]
        if sum(abs(a-b) for a, b in zip(c, bg)) > 40:
            non_bg.append((x + 80, y + 500, c))

print("Non-bg pixels below y=545:", len(non_bg))
if non_bg:
    min_x = min(p[0] for p in non_bg)
    max_x = max(p[0] for p in non_bg)
    min_y = min(p[1] for p in non_bg)
    max_y = max(p[1] for p in non_bg)
    print(f"Count. in site: x={min_x}..{max_x} (w={max_x-min_x+1}), y={min_y}..{max_y} (rel y={min_y-95}..{max_y-95}, h={max_y-min_y+1})")
    print("Sample color in Count.:", non_bg[len(non_bg)//2][2])
