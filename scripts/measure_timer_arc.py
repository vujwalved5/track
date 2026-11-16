from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In Section 01, Timer Card:
# Timer dial is in left card (x: 80..850, y: 1100..1800)
# Let's crop the timer dial:
dial_crop = ref.crop((150, 1150, 800, 1850))
dial_crop.save('design-reference/compare/ref_dial_full.png')
print("Saved ref_dial_full.png (650x700)")

# Let's find the gold arc in the dial:
# Gold color is #B68A53 / #D2A75D: r > 150, g > 110, b < 100
gold_pixels = []
for y in range(dial_crop.height):
    for x in range(dial_crop.width):
        r, g, b = dial_crop.getpixel((x, y))[:3]
        if r > 140 and g > 105 and b < 100:
            gold_pixels.append((x, y, r, g, b))

print(f"Found {len(gold_pixels)} gold pixels in timer dial")
if gold_pixels:
    xs = [p[0] for p in gold_pixels]
    ys = [p[1] for p in gold_pixels]
    print(f"Gold bounds: x=[{min(xs)}, {max(xs)}], y=[{min(ys)}, {max(ys)}]")
    dial_cx = (min(xs) + max(xs)) / 2
    dial_cy = (min(ys) + max(ys)) / 2
    print(f"Dial center: ({dial_cx:.1f}, {dial_cy:.1f})")
    
    # Calculate angles of gold arc relative to 12 o'clock (top):
    # Angle clockwise from 12 o'clock:
    # 12 o'clock is (x = cx, y < cy) -> angle = 0
    # 3 o'clock is (x > cx, y = cy) -> angle = 90
    # 6 o'clock is (x = cx, y > cy) -> angle = 180
    # 9 o'clock is (x < cx, y = cy) -> angle = 270
    import math
    angles = []
    for x, y, r, g, b in gold_pixels:
        dx = x - dial_cx
        dy = y - dial_cy
        dist = math.hypot(dx, dy)
        # only look at the thick arc (dist around 150..220)
        if dist > 140:
            # angle clockwise from top:
            # math.atan2(dx, -dy) gives angle from top, clockwise in radians
            ang = math.degrees(math.atan2(dx, -dy))
            if ang < 0:
                ang += 360
            angles.append(ang)
    
    if angles:
        print(f"Gold arc angles from 12 o'clock:")
        print(f"Min angle: {min(angles):.1f}°")
        print(f"Max angle: {max(angles):.1f}°")
        print(f"Total arc span: {max(angles) - min(angles):.1f}°")

