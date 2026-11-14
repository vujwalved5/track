from PIL import Image

im = Image.open('design-reference/compare/tune_headline_screenshot.png')
# Target: 'Make' 277px wide, 'Every Day' 445px, 'Count.' 364 x 160
# In tune_headline_screenshot, tests are laid out vertically
# Let's inspect rows to find the exact pixel dimensions of each word
# Let's write a python function to find tight bounding box of any word patch
def get_tight_bbox(crop, bg=(244, 239, 228), threshold=30):
    w, h = crop.size
    min_x, max_x, min_y, max_y = w, 0, h, 0
    found = False
    for y in range(h):
        for x in range(w):
            c = crop.getpixel((x, y))[:3]
            if sum(abs(a - b) for a, b in zip(c, bg)) > threshold:
                found = True
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
    if not found:
        return None
    return (min_x, min_y, max_x, max_y, max_x - min_x + 1, max_y - min_y + 1)

# Let's crop each row in tune_headline_screenshot
# Since padding is 50px, each config has 3 lines of text
# Let's search for lines of ink in x: 50..650
bg = (244, 239, 228)
w, h = im.size
row_ink = []
for y in range(h):
    has_ink = any(sum(abs(a-b) for a, b in zip(im.getpixel((x, y))[:3], bg)) > 30 for x in range(50, 650))
    if has_ink:
        row_ink.append(y)

# Group contiguous row ranges into words
words = []
cur_w = []
for y in row_ink:
    if not cur_w or y == cur_w[-1] + 1:
        cur_w.append(y)
    else:
        if len(cur_w) > 10:
            words.append((cur_w[0], cur_w[-1]))
        cur_w = [y]
if len(cur_w) > 10:
    words.append((cur_w[0], cur_w[-1]))

print('Found', len(words), 'word blocks in test page')
for i, (sy, ey) in enumerate(words):
    crop = im.crop((50, sy, 650, ey + 1))
    bbox = get_tight_bbox(crop, bg)
    if bbox:
        w_px, h_px = bbox[4], bbox[5]
        print(f'Word {i} (y={sy}..{ey}): w={w_px}px, h={h_px}px')
