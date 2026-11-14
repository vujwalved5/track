from PIL import Image

src = Image.open('public/welcome/hero-desk.jpg')
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')

# In ref, let's take a patch of the teal magazine at x=20..80, y=450..520
# Note that the field note in ref is around x=74, y=442..779, so x=0..60 at y=450..520 is unobscured!
patch_teal = ref.crop((0, 450, 60, 520)).convert('L')
patch_teal.save('design-reference/crops/patch_teal_ref.png')
print('Saved patch_teal_ref.png')

# Search in src for this exact teal patch!
# Let's search across scale and crop positions
best_score = float('inf')
best_crop = None

for h_crop in range(1400, 2500, 50):
    w_crop = int(h_crop * 656 / 870)
    for y_crop in range(0, 2592 - h_crop + 1, 100):
        for x_crop in range(0, min(1200, 3872 - w_crop), 50):
            crop_cand = src.crop((x_crop, y_crop, x_crop + w_crop, y_crop + h_crop)).resize((656, 870), Image.Resampling.BILINEAR)
            cand_patch = crop_cand.crop((0, 450, 60, 520)).convert('L')
            sad = sum(abs(cand_patch.getpixel((x, y)) - patch_teal.getpixel((x, y))) for x in range(60) for y in range(70))
            if sad < best_score:
                best_score = sad
                best_crop = (x_crop, y_crop, w_crop, h_crop)

print('Best crop for teal match:', best_crop, 'score:', best_score)
