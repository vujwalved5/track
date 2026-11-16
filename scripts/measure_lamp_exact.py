from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In ref, let's find the exact boundaries of the lamp.
# Let's inspect x from 1000 to 1250 and y from 100 to 350.
# The lamp has a shade, bulb/glow, or armature.
# Let's find where the shade is by looking at colors:
# In the crop lamp_zoom.png, what are the coordinates of the lamp shade?
# Let's print out the min/max coordinates where brightness > 125 in the upper photo region:
lamp_pts = []
for y in range(120, 400):
    for x in range(1000, 1250):
        r, g, b = ref.getpixel((x, y))[:3]
        if (r + g + b) / 3 > 120:
            lamp_pts.append((x, y))

if lamp_pts:
    min_x = min(p[0] for p in lamp_pts)
    max_x = max(p[0] for p in lamp_pts)
    min_y = min(p[1] for p in lamp_pts)
    max_y = max(p[1] for p in lamp_pts)
    cx = (min_x + max_x) / 2
    cy = (min_y + max_y) / 2
    print(f"Lamp high-brightness region:")
    print(f"x: {min_x} .. {max_x} (center x = {cx:.1f}, width = {max_x - min_x})")
    print(f"y: {min_y} .. {max_y} (center y = {cy:.1f}, height = {max_y - min_y})")

# Wait, let's also look for circles!
# Are there circles in focus-room.png?
# Let's check if there are circles in focus-room.png around the lamp!
# Let's inspect concentric rings centered near this lamp center:
# What if we look at radii R from 40 to 300 from (cx, cy)?
