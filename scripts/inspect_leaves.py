from PIL import Image

im = Image.open('design-reference/crops/ref_botanical_branch.png')
# Crop size is 270x300, divider at x=133
# Let's inspect where leaves are
w, h = im.size
# Threshold for green leaf pixels: 80 < r < 160 and 110 < g < 185 and 90 < b < 160
leaf_pixels = []
for y in range(h):
    for x in range(w):
        r, g, b = im.getpixel((x, y))[:3]
        if 70 < r < 165 and 100 < g < 185 and 80 < b < 165:
            leaf_pixels.append((x, y))

print('Leaf pixels count:', len(leaf_pixels))
# Let's cluster leaf pixels by y into 7 leaves
# We can find y clusters
y_hist = {}
for x, y in leaf_pixels:
    y_hist[y] = y_hist.get(y, 0) + 1

# Print y ranges where leaf pixels exist
y_ranges = []
cur_y = []
for y in sorted(y_hist.keys()):
    if not cur_y or y == cur_y[-1] + 1:
        cur_y.append(y)
    else:
        if len(cur_y) > 5:
            y_ranges.append((cur_y[0], cur_y[-1]))
        cur_y = [y]
if len(cur_y) > 5:
    y_ranges.append((cur_y[0], cur_y[-1]))

for s, e in y_ranges:
    sub = [p for p in leaf_pixels if s <= p[1] <= e]
    xs = [p[0] for p in sub]
    print(f'Leaf group rel y={s}..{e} (page y={1300+s}..{1300+e}): crop x={min(xs)}..{max(xs)} (page x={550+min(xs)}..{550+max(xs)})')
