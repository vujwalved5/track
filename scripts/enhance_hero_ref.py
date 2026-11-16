from PIL import Image, ImageEnhance

ref = Image.open('design-reference/focus-room.png')
hero_ref = ref.crop((780, 91, 1366, 953))

# Boost contrast to see all subtle overlays clearly
enh = ImageEnhance.Contrast(hero_ref)
enhanced = enh.enhance(2.5)
enhanced.save('design-reference/compare/hero_ref_high_contrast.png')
print("Saved hero_ref_high_contrast.png")
