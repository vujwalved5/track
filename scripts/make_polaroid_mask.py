from PIL import Image

im = Image.open('design-reference/crops/polaroid_clean_crop.png')
# Let's save a thresholded image to see the polaroid clearly
out = Image.new('L', im.size)
for y in range(im.height):
    for x in range(im.width):
        r, g, b = im.getpixel((x, y))[:3]
        # Polaroid white border: r > 230, g > 220, b > 210
        # or greyscale photo: abs(r-g) < 6 and abs(g-b) < 6 and 40 < r < 200
        if (r > 235 and g > 230 and b > 215) or (abs(r-g) < 6 and abs(g-b) < 6 and 40 < r < 200):
            out.putpixel((x, y), 255)
        else:
            out.putpixel((x, y), 0)
out.save('design-reference/crops/polaroid_mask.png')
print('Saved polaroid_mask.png')
