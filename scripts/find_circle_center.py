from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's find local peaks across the photo region (x: 820..1320, y: 140..850)
peaks = []
for y in range(140, 850):
    for x in range(820, 1320):
        # A 1px line will have higher intensity than neighbors (x-1, x+1) or (y-1, y+1)
        # In grayscale:
        c = sum(ref.getpixel((x, y))[:3]) / 3
        cx_m1 = sum(ref.getpixel((x - 1, y))[:3]) / 3
        cx_p1 = sum(ref.getpixel((x + 1, y))[:3]) / 3
        cy_m1 = sum(ref.getpixel((x, y - 1))[:3]) / 3
        cy_p1 = sum(ref.getpixel((x, y + 1))[:3]) / 3
        
        # Check horizontal peak or vertical peak
        if (c - cx_m1 > 12 and c - cx_p1 > 12) or (c - cy_m1 > 12 and c - cy_p1 > 12):
            peaks.append((x, y, c))

print(f"Found {len(peaks)} sharp peak points in hero photo")

# Let's fit concentric circles to these peaks!
# What center (cx, cy) and radii best fit subsets of peaks?
import math

# Test center candidates around cx in [1000..1250], cy in [250..450]
best_scores = []
for cy in range(250, 450, 2):
    for cx in range(1050, 1250, 2):
        # Calculate distances from (cx, cy) to all peaks
        dists = [math.hypot(p[0] - cx, p[1] - cy) for p in peaks]
        # Histogram of distances in 2px bins
        bins = {}
        for d in dists:
            b = round(d / 2) * 2
            bins[b] = bins.get(b, 0) + 1
        # Top 3 bins
        top_bins = sorted(bins.items(), key=lambda item: item[1], reverse=True)[:3]
        total_top = sum(item[1] for item in top_bins)
        best_scores.append((total_top, cx, cy, top_bins))

best_scores.sort(reverse=True)
print("Top 5 candidate circle centers:")
for score, cx, cy, top_bins in best_scores[:5]:
    radii = [f"r={b}(count={c})" for b, c in top_bins]
    print(f"Score {score}: cx={cx}, cy={cy}, radii={radii}")

