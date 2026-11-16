from PIL import Image

desk = Image.open('public/welcome/focus-desk.jpg')
# desk is 2730 x 4096 (aspect ratio 0.6665)
# In FocusHero, it is in a container of 586 x 862 (aspect ratio 0.6798)
# With object-cover object-center:
# container w/h = 586 / 862 = 0.679814
# image w/h = 2730 / 4096 = 0.666504
# Since image is narrower than container (0.6665 < 0.6798),
# object-cover scales image by width:
# scale = 586 / 2730 = 0.214652
# scaled height = 4096 * scale = 879.2px
# y_offset = (879.2 - 862) / 2 = 8.6px (cropped 8.6px from top and bottom)
# So image (x, y) maps to:
# screen_x = x * 0.214652
# screen_y = y * 0.214652 - 8.6

# Where is the lamp bulb/light in focus-desk.jpg?
# Let's find the brightest region in focus-desk.jpg:
# In the original photo, the lamp is lit and glowing brightly!
# Let's find pixels with max brightness in focus-desk.jpg:
max_br = 0
lamp_pixels = []
w, h = desk.size
for y in range(0, h // 2, 20):
    for x in range(0, w, 20):
        r, g, b = desk.getpixel((x, y))[:3]
        br = (r + g + b) / 3
        if br > 240:
            lamp_pixels.append((x, y, br))

print(f"Found {len(lamp_pixels)} very bright pixels in top half of focus-desk.jpg")
if lamp_pixels:
    xs = [p[0] for p in lamp_pixels]
    ys = [p[1] for p in lamp_pixels]
    print(f"Photo lamp coords: x=[{min(xs)}, {max(xs)}], y=[{min(ys)}, {max(ys)}]")
    center_raw_x = (min(xs) + max(xs)) / 2
    center_raw_y = (min(ys) + max(ys)) / 2
    print(f"Raw lamp center: ({center_raw_x}, {center_raw_y})")
    scr_x = center_raw_x * 586 / 2730
    scr_y = center_raw_y * 586 / 2730 - 8.6
    print(f"Mapped to hero container (586x862): rel_x={scr_x:.1f}, rel_y={scr_y:.1f}")
    print(f"Mapped to page coords: page_x={780 + scr_x:.1f}, page_y={91 + scr_y:.1f}")
