from PIL import Image
import math

im = Image.open('design-reference/compare/ref_dial_bottom_arc.png')
# bottom_arc crop was from dial_crop at (230, 530)
# Dial center in dial_crop was (328.4, 433.9)
# In bottom_arc, dial center is (328.4 - 230, 433.9 - 530) = (98.4, -96.1)
# 6 o'clock is at x = 98.4, y = -96.1 + 180 = 83.9
# Let's find all gold pixels in bottom_arc:
gold = []
for y in range(im.height):
    for x in range(im.width):
        r, g, b = im.getpixel((x, y))[:3]
        if r > 140 and g > 110 and b < 100:
            gold.append((x, y, r, g, b))

print(f"Gold pixels in bottom arc: {len(gold)}")
if gold:
    xs = [p[0] for p in gold]
    ys = [p[1] for p in gold]
    print(f"Gold bounds in bottom arc: x=[{min(xs)}, {max(xs)}], y=[{min(ys)}, {max(ys)}]")
    # Calculate angles from 12 o'clock for each pixel:
    angles = []
    for x, y, r, g, b in gold:
        dx = x - 98.4
        dy = y - (-96.1)
        ang = math.degrees(math.atan2(dx, -dy))
        if ang < 0: ang += 360
        angles.append(ang)
    print(f"Bottom arc angles: {min(angles):.1f}° to {max(angles):.1f}°")
