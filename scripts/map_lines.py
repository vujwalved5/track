from PIL import Image

ref = Image.open('design-reference/focus-room.png')
crop = ref.crop((780, 91, 1366, 953))

# Let's check: does focus-room.png have orbit circles?
# Let's look closely at crop.
# Where is the lamp?
# In focus-desk.jpg, where is the lamp?
# Let's check what objects are in focus-room.png:
# Left side of photo: books? coffee cup?
# Right side: lamp?
# Where is the lamp shade?
# Let's inspect the RGB colors across the photo in a 10x10 block grid:
w, h = crop.size
print(f"Photo size: {w}x{h}")

# Let's find all pixels with saturation or color that looks like orbit lines:
# Orbit lines in the reference:
# Are there thin white or gold circles in ref?
# Let's check pixels that are distinctly brighter than their surroundings by scanning every pixel:
line_pixels = []
for y in range(20, h - 20):
    for x in range(20, w - 40):
        # check if (x,y) is a line pixel:
        # compare with x-2, x+2, y-2, y+2
        c = crop.getpixel((x, y))[:3]
        br = sum(c)/3
        br_l = sum(crop.getpixel((x-2, y))[:3])/3
        br_r = sum(crop.getpixel((x+2, y))[:3])/3
        br_u = sum(crop.getpixel((x, y-2))[:3])/3
        br_d = sum(crop.getpixel((x, y+2))[:3])/3
        if (br - br_l > 15 and br - br_r > 15) or (br - br_u > 15 and br - br_d > 15):
            line_pixels.append((x, y, c))

print(f"Total line pixels found: {len(line_pixels)}")
# Let's save a map of these line pixels
line_map = Image.new('RGB', (w, h), (0, 0, 0))
for x, y, c in line_pixels:
    line_map.putpixel((x, y), (255, 255, 255))
line_map.save('design-reference/compare/line_map.png')
print("Saved line_map.png")
