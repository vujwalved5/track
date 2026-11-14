from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')

for x in [560, 600, 640, 680]:
    crop = desk.crop((x, 140, x + 1847, 140 + 2450)).resize((656, 870), Image.Resampling.LANCZOS)
    crop.save(f'design-reference/crops/crop_cand_{x}.png')
    print(f'Saved crop_cand_{x}.png')
