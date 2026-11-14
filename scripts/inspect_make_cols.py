from PIL import Image

im = Image.open('design-reference/crops/crop_make_site.png')
# crop_make_site was cropped from (70, 260, 420, 400)
# Let's inspect the columns that have ink
bg = (244, 239, 228)
w, h = im.size
ink_cols = []
for x in range(w):
    has_ink = any(sum(abs(a-b) for a, b in zip(im.getpixel((x, y))[:3], bg)) > 40 for y in range(h))
    if has_ink:
        ink_cols.append(x)

print(f"Ink cols: start={ink_cols[0]} (page x={70+ink_cols[0]}), end={ink_cols[-1]} (page x={70+ink_cols[-1]}), w={ink_cols[-1]-ink_cols[0]+1}")
