from PIL import Image

site = Image.open('design-reference/crops/site_count_area.png')
# crop was from (80, 500, 500, 650)
# Look at row y=570 (rel y=70 in crop)
bg = (244, 239, 228)
row_colors = [site.getpixel((x, 70))[:3] for x in range(site.width) if sum(abs(a-b) for a, b in zip(site.getpixel((x, 70))[:3], bg)) > 30]
print("Row y=570 distinct colors:", set(row_colors))
