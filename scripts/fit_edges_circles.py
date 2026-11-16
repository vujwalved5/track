from PIL import Image

edges = Image.open('design-reference/compare/hero_edges.png')
# In hero_edges, edges have high RGB values.
# Let's inspect where strong edges are in hero_edges:
print("Edges size:", edges.size)

# Find coordinates of strong edges in edges (excluding the rectangular frame border at x=12, x=560, y=26, y=836):
strong_edges = []
w, h = edges.size
for y in range(50, h - 50):
    for x in range(30, w - 40):
        # ignore text on the right (x > 530)
        if x > 520: continue
        r, g, b = edges.getpixel((x, y))[:3]
        if (r + g + b) / 3 > 70:
            strong_edges.append((x, y, (r + g + b) / 3))

print(f"Number of strong edge pixels: {len(strong_edges)}")
# Let's fit circles on these strong edge pixels
import math
best = []
for cy in range(100, 500, 5):
    for cx in range(200, 450, 5):
        dists = [round(math.hypot(p[0] - cx, p[1] - cy)) for p in strong_edges]
        # count occurrences of each radius
        counts = {}
        for d in dists:
            counts[d] = counts.get(d, 0) + 1
        top_radii = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:3]
        score = sum(x[1] for x in top_radii)
        best.append((score, cx, cy, top_radii))

best.sort(reverse=True)
print("Top 5 circle fits on edge pixels (relative to hero photo 586x862):")
for score, cx, cy, radii in best[:5]:
    print(f"cx={cx}, cy={cy}, score={score}, radii={radii}")
