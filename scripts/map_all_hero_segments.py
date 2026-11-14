from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')
bg = (244, 239, 228)

# For every row y from 100 to 900, if there is ink in x: 70..550, print summary
y_ranges = []
cur_range = []
for y in range(100, 920):
    ink = [x for x in range(70, 550) if sum(abs(a-b) for a, b in zip(site.getpixel((x, y))[:3], bg)) > 35]
    if ink:
        cur_range.append((y, min(ink), max(ink), len(ink)))
    else:
        if len(cur_range) > 4:
            y_ranges.append(cur_range)
        cur_range = []
if len(cur_range) > 4:
    y_ranges.append(cur_range)

print(f"Found {len(y_ranges)} vertical text segments in site hero:")
for i, seg in enumerate(y_ranges):
    sy = seg[0][0]
    ey = seg[-1][0]
    min_x = min(p[1] for p in seg)
    max_x = max(p[2] for p in seg)
    print(f"Segment {i}: page y={sy}..{ey} (rel y={sy-95}..{ey-95}, h={ey-sy+1}), x={min_x}..{max_x} (w={max_x-min_x+1})")
