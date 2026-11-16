from PIL import Image

iso = Image.open('design-reference/compare/ref_lamp_isolated.png')
w, h = iso.size

# Let's inspect: does ref_lamp_isolated have circles?
# Let's check if there are circles in iso by looking for circular arcs:
# Let's inspect the colors: are there thin circular lines?
# Let's check for any circles:
for y in range(0, h, 20):
    for x in range(0, w, 20):
        pass

# Let's find the lamp center:
# In iso (offset rel_x = 150, rel_y = 100):
# Where is the lamp shade?
# Let's find the brightest/warmest spot of the lamp in iso:
pixels = []
for y in range(h):
    for x in range(w):
        r, g, b = iso.getpixel((x, y))[:3]
        # lamp light / shade
        pixels.append(((r + g + b)/3, r, g, b, x, y))

pixels.sort(reverse=True)
print("Top 10 pixels in lamp isolated:")
for p in pixels[:10]:
    rel_x = 150 + p[4]
    rel_y = 100 + p[5]
    page_x = 780 + rel_x
    page_y = 91 + rel_y
    print(f"rel=({rel_x}, {rel_y}), page=({page_x}, {page_y}), rgb=({p[1]},{p[2]},{p[3]})")
