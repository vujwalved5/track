from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')
# Crop Make from site
crop_make_site = site.crop((70, 260, 420, 400))
crop_make_site.save('design-reference/crops/crop_make_site.png')
print('Saved crop_make_site.png')

# Measure tight width of Make in crop_make_site
bg = (244, 239, 228)
w, h = crop_make_site.size
min_x, max_x = w, 0
for y in range(h):
    for x in range(w):
        c = crop_make_site.getpixel((x, y))[:3]
        if sum(abs(a-b) for a, b in zip(c, bg)) > 40:
            if x < min_x: min_x = x
            if x > max_x: max_x = x

print(f"Make in site: min_x={min_x}, max_x={max_x}, width={max_x - min_x + 1}px")
