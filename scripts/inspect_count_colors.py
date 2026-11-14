from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')
# Crop y=500..650, x=80..500
c_crop = site.crop((80, 500, 500, 650))
c_crop.save('design-reference/crops/site_count_area.png')
print('Saved site_count_area.png')

# Let's inspect non-cream pixels in site_count_area
bg = (244, 239, 228)
non_bg = []
for y in range(c_crop.height):
    for x in range(c_crop.width):
        c = c_crop.getpixel((x, y))[:3]
        if sum(abs(a-b) for a, b in zip(c, bg)) > 40:
            non_bg.append((x + 80, y + 500, c))

print(f"Non-bg pixels in count area: {len(non_bg)}")
if non_bg:
    print("Sample colors:", [p[2] for p in non_bg[:5]])
    min_x = min(p[0] for p in non_bg)
    max_x = max(p[0] for p in non_bg)
    min_y = min(p[1] for p in non_bg)
    max_y = max(p[1] for p in non_bg)
    print(f"Bbox: x={min_x}..{max_x} (w={max_x-min_x+1}), y={min_y}..{max_y} (rel y={min_y-95}..{max_y-95}, h={max_y-min_y+1})")
