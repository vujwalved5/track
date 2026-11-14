from PIL import Image

im = Image.open('design-reference/compare/opt_screenshot.png')
bg = (244, 239, 228)

# Find all word blocks in opt_screenshot.png
rows = []
for y in range(40, im.height):
    has_ink = any(sum(abs(a-b) for a, b in zip(im.getpixel((x, y))[:3], bg)) > 30 for x in range(30, 600))
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

print('Found', len(words), 'words in opt_screenshot.png')
labels = ['Opt1 Make', 'Opt1 Every Day', 'Opt1 Count.', 'Opt2 Make', 'Opt2 Every Day', 'Opt2 Count.']
for i, (sy, ey) in enumerate(words):
    min_x, max_x = im.width, 0
    for y in range(sy, ey+1):
        for x in range(30, 600):
            if sum(abs(a-b) for a, b in zip(im.getpixel((x, y))[:3], bg)) > 30:
                if x < min_x: min_x = x
                if x > max_x: max_x = x
    w_px = max_x - min_x + 1
    h_px = ey - sy + 1
    lbl = labels[i] if i < len(labels) else f'Word {i}'
    print(f'{lbl}: w={w_px}px, h={h_px}px, y={sy}..{ey}')
