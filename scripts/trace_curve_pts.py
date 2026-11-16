from PIL import Image
import math

ref = Image.open('design-reference/focus-room.png')
hero_ref = ref.crop((780, 91, 1366, 953))

# Let's inspect all pixels in hero_ref that are circle lines or lamp features:
# Let's see: what circle passes through rel=(358, 232), rel=(387, 171), rel=(361, 197)?
# Let's fit a circle to these points:
# Points:
pts = [(358, 232), (387, 171), (376, 181), (361, 197), (395, 165)]
# Let's find more points along this curve!
# In hero_ref:
curve_pts = []
for y in range(50, 500):
    for x in range(100, 550):
        r, g, b = hero_ref.getpixel((x, y))[:3]
        # Check if pixel has gold/cream line characteristic:
        # It is noticeably brighter than surrounding dark photo background:
        # In this region, dark background is typically r < 80, g < 80, b < 80
        # If r > 130 and g > 110:
        if r > 135 and g > 120 and r > b:
            curve_pts.append((x, y, r, g, b))

print(f"Found {len(curve_pts)} bright warm points in hero photo")
# Save visualization of curve points
vis = Image.new('RGB', (586, 862), (0, 0, 0))
for x, y, r, g, b in curve_pts:
    vis.putpixel((x, y), (255, 255, 255))
vis.save('design-reference/compare/curve_pts.png')
print("Saved curve_pts.png")
