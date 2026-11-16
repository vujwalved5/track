from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's inspect rows and columns to find the circles.
# What are the circles in the design?
# Are there visible circle strokes in focus-room.png?
# Let's write a script that tests for circular symmetry or high contrast circular arcs.
# Let's search across candidate centers (cx, cy) and radii R.
# If there is a circle of radius R centered at (cx, cy), the average pixel intensity along the perimeter
# will be higher than the background.
import math

# Let's look at the lamp area: cx in [1050, 1200], cy in [200, 400]
# Wait, let's also inspect where the lamp shade opening/bulb is.
# Let's find the pixels that form the lamp shade or light cone.
# In lamp_shade_detail: x=1000..1250, y=200..450.
# Let's find the exact coordinates of the lamp features in ref.
for y in range(250, 360, 10):
    row = []
    for x in range(1100, 1200, 5):
        r, g, b = ref.getpixel((x, y))[:3]
        row.append(f"{r:3d}")
    print(f"y={y}: " + " ".join(row))
