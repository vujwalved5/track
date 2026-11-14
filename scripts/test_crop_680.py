from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')

crop_exact = desk.crop((680, 142, 680 + 1847, 142 + 2450)).resize((656, 870), Image.Resampling.LANCZOS)
crop_exact.save('design-reference/crops/crop_exact_680.png')
print('Saved crop_exact_680.png')

# Compare left edge:
print('Crop left edge vs ref left edge:')
for y in range(0, 870, 80):
    c_cand = crop_exact.getpixel((0, y))[:3]
    c_ref = ref.getpixel((0, y))[:3]
    print(f'y={y}: cand={c_cand}, ref={c_ref}')
