from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In focus-room.png, let's look at the lamp:
# Lamp center in 586 x 862 coordinate space is around (352, 158) or in 574 x 860 SVG viewBox (345, 158)
# Let's inspect the design reference: what circles are visible around the lamp in focus-room.png?
# Let's check if there are circular rings visible in focus-room.png.
# Let's inspect concentric rings around (1132, 248.5) in ref:
# Let's test radii from 30 to 220:
import math
for r in [40, 60, 80, 100, 120, 140, 160, 180, 200, 220]:
    # Let's check pixels at angle 0, 45, 90, 135, 180, 225, 270, 315
    pts = []
    for deg in range(0, 360, 15):
        rad = math.radians(deg)
        x = int(round(1132 + r * math.cos(rad)))
        y = int(round(248.5 + r * math.sin(rad)))
        if 780 <= x < 1366 and 91 <= y < 953:
            pts.append(ref.getpixel((x, y))[:3])
    # check how many points stand out
    # print
    pass
