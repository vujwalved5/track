from PIL import Image

src = Image.open('public/welcome/hero-desk.jpg')
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')

# Let's crop from src at (500, 0, 500+1357, 1800) and resize to (656, 870)
crop_cand = src.crop((500, 0, 500+1357, 1800)).resize((656, 870), Image.Resampling.LANCZOS)
crop_cand.save('design-reference/crops/new_hero_desk_crop.png')
print('Saved new_hero_desk_crop.png')

# Compare with old hero-desk-crop.jpg
old_crop = Image.open('public/welcome/hero-desk-crop.jpg')
print('Old crop size:', old_crop.size)

# Inspect left edge of new crop
left_sample = [crop_cand.getpixel((x, y))[:3] for x in range(0, 20, 5) for y in range(0, 870, 100)]
print('New crop left edge sample:', left_sample[:8])
