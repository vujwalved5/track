from PIL import Image, ImageFilter
import math

ref = Image.open('design-reference/focus-room.png')
hero_ref = ref.crop((780, 91, 1366, 953))

# Find edges
edges = hero_ref.filter(ImageFilter.FIND_EDGES)
w, h = hero_ref.size

# Extract strong edge points (excluding the 1px framing border around the edges)
edge_pts = []
for y in range(40, h - 40):
    for x in range(30, w - 40):
        # exclude text at the bottom right
        if x > 510: continue
        r, g, b = edges.getpixel((x, y))[:3]
        if (r + g + b) / 3 > 50:
            edge_pts.append((x, y))

print(f"Edge points: {len(edge_pts)}")

# Hough transform for circles:
# For each candidate radius r in range(40, 260, 5):
# and candidate center (cx, cy)
# To be fast, let's test a grid of (cx, cy) with step 4:
accumulator = {}
# Radii to test
radii = list(range(50, 260, 10))

for cx in range(150, 450, 4):
    for cy in range(50, 450, 4):
        # count how many edge points are within distance r +- 1.5
        dists = [math.hypot(px - cx, py - cy) for px, py in edge_pts]
        for r in radii:
            count = sum(1 for d in dists if abs(d - r) <= 1.5)
            if count > 30:
                accumulator[(cx, cy, r)] = count

sorted_circles = sorted(accumulator.items(), key=lambda x: x[1], reverse=True)
print("Top 15 detected circles in hero_ref (rel coords in 586x862):")
for (cx, cy, r), count in sorted_circles[:15]:
    page_x = 780 + cx
    page_y = 91 + cy
    print(f"Center rel=({cx}, {cy}), page=({page_x}, {page_y}), r={r}, votes={count}")
