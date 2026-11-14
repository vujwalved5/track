from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
# Test x=470, y=0, w=1954, h=2592
crop1 = desk.crop((470, 0, 470 + 1954, 2592)).resize((656, 870), Image.Resampling.LANCZOS)
crop1.save('design-reference/crops/test_crop_470.png')

# Also check left edge color of test_crop_470
left_samples = [crop1.getpixel((x, y))[:3] for x in range(0, 5) for y in range(0, 870, 50)]
print('Left edge samples in 470:', left_samples[:10])

# Compare with ref
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')
print('Ref size:', ref.size)
