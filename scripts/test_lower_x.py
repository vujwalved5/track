from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')
patch_ref = ref.crop((0, 750, 80, 820))

for x_start in [0, 100, 200, 300, 350, 400, 450, 500, 550, 600]:
    crop = desk.crop((x_start, 0, x_start + 1954, 2592)).resize((656, 870), Image.Resampling.LANCZOS)
    cand_patch = crop.crop((0, 750, 80, 820))
    diff = sum(abs(a-b) for x in range(80) for y in range(70) for a, b in zip(cand_patch.getpixel((x, y))[:3], patch_ref.getpixel((x, y))[:3]))
    print(f'x_start={x_start}: diff={diff}')
