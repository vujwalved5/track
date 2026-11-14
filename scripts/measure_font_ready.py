from PIL import Image

im = Image.open('design-reference/compare/font_ready_screenshot.png')
# Crop top area where status text is
status_crop = im.crop((40, 30, 800, 100))
status_crop.save('design-reference/crops/status_crop.png')
print('Saved status_crop.png')

# Let's inspect the word bounding boxes directly in font_ready_screenshot.png
# w_make is below status
# Find Make
bg = (244, 239, 228)
# Search rows below 100
rows = []
for y in range(100, im.height):
    has_ink = any(sum(abs(a-b) for a, b in zip(im.getpixel((x, y))[:3], bg)) > 30 for x in range(40, 600))
    if has_ink:
        rows.append(y)

# Group contiguous rows
words = []
cur = []
for y in rows:
    if not cur or y == cur[-1] + 1:
        cur.append(y)
    else:
        if len(cur) > 10:
            words.append((cur[0], cur[-1]))
        cur = [y]
if len(cur) > 10:
    words.append((cur[0], cur[-1]))

for i, (sy, ey) in enumerate(words):
    # tight bbox
    min_x, max_x = im.width, 0
    for y in range(sy, ey+1):
        for x in range(40, 600):
            if sum(abs(a-b) for a, b in zip(im.getpixel((x, y))[:3], bg)) > 30:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
    w_px = max_x - min_x + 1
    h_px = ey - sy + 1
    print(f'Word {i}: y={sy}..{ey} (h={h_px}), x={min_x}..{max_x} (w={w_px})')
