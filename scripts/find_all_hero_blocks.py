from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')
# Scan for ink in x: 70..550, y: 150..650
bg = (244, 239, 228)

# Find each distinct text line in hero
lines = []
for y in range(150, 650):
    ink = [x for x in range(70, 550) if sum(abs(a-b) for a, b in zip(site.getpixel((x, y))[:3], bg)) > 40]
    if ink:
        lines.append((y, min(ink), max(ink), len(ink)))

# Group into blocks
blocks = []
cur = []
for y, min_x, max_x, cnt in lines:
    if not cur or y == cur[-1][0] + 1:
        cur.append((y, min_x, max_x, cnt))
    else:
        if len(cur) > 10:
            blocks.append((cur[0][0], cur[-1][0], min(p[1] for p in cur), max(p[2] for p in cur)))
        cur = [(y, min_x, max_x, cnt)]
if len(cur) > 10:
    blocks.append((cur[0][0], cur[-1][0], min(p[1] for p in cur), max(p[2] for p in cur)))

for i, (sy, ey, min_x, max_x) in enumerate(blocks):
    print(f"Block {i}: page y={sy}..{ey} (rel y={sy-95}..{ey-95}, h={ey-sy+1}), x={min_x}..{max_x} (w={max_x-min_x+1})")
