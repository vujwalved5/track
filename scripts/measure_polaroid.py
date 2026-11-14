from PIL import Image

im = Image.open('design-reference/crops/polaroid_clean_crop.png')
# polaroid_clean_crop was cropped from (1050, 60, 1366, 380)
# Let's inspect where the polaroid is
w, h = im.size
# Find leftmost pixel of polaroid
min_x = w
for x in range(w):
    for y in range(h):
        r, g, b = im.getpixel((x, y))[:3]
        if (r > 230 and g > 225 and b > 210 and y > 20) or (abs(r-g)<5 and abs(g-b)<5 and 50 < r < 200 and y > 30 and x > 50):
            if x < min_x:
                min_x = x
                break

print('Polaroid starts at rel x:', min_x, 'page x:', 1050 + min_x)
# What is the top-most pixel of the polaroid?
min_y = h
for y in range(h):
    for x in range(w):
        r, g, b = im.getpixel((x, y))[:3]
        if (r > 230 and g > 225 and b > 210 and y > 20) or (abs(r-g)<5 and abs(g-b)<5 and 50 < r < 200 and y > 30 and x > 50):
            if y < min_y:
                min_y = y
                break
print('Polaroid starts at rel y:', min_y, 'page y:', 60 + min_y)
