from PIL import Image

im = Image.open('design-reference/crops/ref_fn_title_crop.png')
# Check letter stem thickness (e.g. 'B')
# Let's inspect rows
for y in range(im.height):
    ink = [x for x in range(im.width) if im.getpixel((x, y))[0] < 60]
    if ink:
        print(f'rel y={y}: ink={len(ink)}, span={max(ink)-min(ink)+1}')
