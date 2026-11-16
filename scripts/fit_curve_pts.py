from PIL import Image
import math

pts_img = Image.open('design-reference/compare/curve_pts.png')
w, h = pts_img.size

# Find all white pixels
pts = []
for y in range(h):
    for x in range(w):
        if pts_img.getpixel((x, y))[0] == 255:
            pts.append((x, y))

print(f"Points count: {len(pts)}")
min_x = min(p[0] for p in pts)
max_x = max(p[0] for p in pts)
min_y = min(p[1] for p in pts)
max_y = max(p[1] for p in pts)
print(f"Bounding box: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")

# Let's see what shapes exist:
# Are there distinct clusters or circles?
# Let's find centers:
centers = {}
# For pairs of points, test perpendicular bisectors or test circle fit
# Test candidate centers cx in [200..500], cy in [100..400]
best_c = None
best_fit = 0
for cy in range(100, 400, 5):
    for cx in range(200, 500, 5):
        # find distances
        dists = [round(math.hypot(p[0] - cx, p[1] - cy)) for p in pts]
        # count distance histogram
        d_count = {}
        for d in dists:
            d_count[d] = d_count.get(d, 0) + 1
        top3 = sorted(d_count.items(), key=lambda x: x[1], reverse=True)[:3]
        score = sum(x[1] for x in top3)
        if score > best_fit:
            best_fit = score
            best_c = (cx, cy, top3)

print("Best circle fit on curve points:")
print(f"Center rel: cx={best_c[0]}, cy={best_c[1]} (Page cx={780 + best_c[0]}, cy={91 + best_c[1]})")
print(f"Top radii: {best_c[2]}, Score: {best_fit}")
