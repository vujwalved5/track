from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In focus-room.png, let's inspect the circles around the lamp!
# Let's crop from x: 900 to 1350, y: 50 to 500
lamp_area = ref.crop((900, 50, 1350, 500))
lamp_area.save('design-reference/compare/lamp_and_circles.png')

# Let's inspect what lines/circles are in this lamp_area:
# Let's find any circle lines centered around (1132, 248.5)
# In lamp_area, the center (1132, 248.5) is at (232, 198.5).
# Let's check pixel values at radius R = 50, 80, 100, 120, 150, 180, 200, etc.
import math
for r in range(40, 250, 10):
    # sample at 12 angles around circle
    line_scores = []
    for deg in range(0, 360, 30):
        rad = math.radians(deg)
        x = int(round(1132 + r * math.cos(rad)))
        y = int(round(248.5 + r * math.sin(rad)))
        if 780 <= x < 1366 and 91 <= y < 953:
            r_c, g_c, b_c = ref.getpixel((x, y))[:3]
            line_scores.append((r_c, g_c, b_c))
    if line_scores:
        avg_r = sum(c[0] for c in line_scores)/len(line_scores)
        # print if notable
        pass

print("Saved lamp_and_circles.png")
