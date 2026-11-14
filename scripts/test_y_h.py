from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')
patch_ref = ref.crop((0, 750, 80, 820))

for h_crop in [2300, 2400, 2500, 2592]:
    w_crop = int(h_crop * 656 / 870)
    for y_start in [0, 50, 100, 150]:
        if y_start + h_crop > 2592: continue
        crop = desk.crop((470, y_start, 470 + w_crop, y_start + h_crop)).resize((656, 870), Image.Resampling.LANCZOS)
        cand_patch = crop.crop((0, 750, 80, 820))
        diff = sum(abs(a-b) for x in range(80) for y in range(70) for a, b in zip(cand_patch.getpixel((x, y))[:3], patch_ref.getpixel((x, y))[:3]))
        print(f'h={h_crop}, y={y_start}: diff={diff}')
