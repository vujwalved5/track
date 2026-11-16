from PIL import Image, ImageChops

before = Image.open('design-reference/compare/focus_1366_before.png')
after = Image.open('design-reference/compare/focus_1366_after.png')

diff = ImageChops.difference(before, after)
bbox = diff.getbbox()
print(f"Overall diff bbox: {bbox}")

# Let's find rows with differences:
w, h = diff.size
diff_rows = []
for y in range(h):
    row_diff = False
    for x in range(w):
        if diff.getpixel((x, y))[:3] != (0, 0, 0):
            row_diff = True
            break
    if row_diff:
        diff_rows.append(y)

# Group contiguous rows into regions (allow gaps of up to 15px)
regions = []
if diff_rows:
    curr_start = diff_rows[0]
    curr_end = diff_rows[0]
    for y in diff_rows[1:]:
        if y - curr_end <= 15:
            curr_end = y
        else:
            regions.append((curr_start, curr_end))
            curr_start = y
            curr_end = y
    regions.append((curr_start, curr_end))

print(f"\nFound {len(regions)} differing vertical regions:")
for idx, (y1, y2) in enumerate(regions, 1):
    # find x bounds for this region:
    xs = []
    for y in range(y1, y2 + 1):
        for x in range(w):
            if diff.getpixel((x, y))[:3] != (0, 0, 0):
                xs.append(x)
    min_x, max_x = min(xs), max(xs)
    print(f"Region {idx}: X=[{min_x}, {max_x}] (w={max_x-min_x}), Y=[{y1}, {y2}] (h={y2-y1})")
