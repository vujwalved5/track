from PIL import Image
import math

ref = Image.open('design-reference/focus-room.png')

# Let's check circles around (1101, 231) in page coordinates:
# Let's test radii from 20 to 400
# For each radius r, sample points around the circle perimeter:
cx, cy = 1101, 231
print(f"Testing circles around page coords cx={cx}, cy={cy}:")

for r in range(40, 350, 10):
    samples = []
    for deg in range(0, 360, 5):
        rad = math.radians(deg)
        px = int(round(cx + r * math.cos(rad)))
        py = int(round(cy + r * math.sin(rad)))
        if 792 <= px <= 1340 and 117 <= py <= 927:
            # get brightness
            samples.append(sum(ref.getpixel((px, py))[:3]) / 3)
    if samples:
        avg = sum(samples) / len(samples)
        # Check standard deviation or max
        # print if interesting
        # let's find if any radius has sharp contrast
        pass

# Let's also check if there are circles in focus-room.png anywhere in the hero photo!
# Where are the circles in focus-room.png?
# Let's save a visual edge map of ref_hero_photo_full to see ALL lines/overlays clearly!
from PIL import ImageFilter
edge_img = ref.crop((780, 91, 1366, 953)).filter(ImageFilter.FIND_EDGES)
edge_img.save('design-reference/compare/hero_edges.png')
print("Saved hero_edges.png")
