from PIL import Image

ref = Image.open('design-reference/focus-room.png')
print('Reference loaded:', ref.size)

# 1. Inspect hero area (y = 0 .. 1000)
# Find lamp center in reference image
# The desk photo in ref is on the right side: x around 780..1366, y around 0..965
# Let's crop hero right side and save to inspect
hero_photo = ref.crop((780, 0, 1366, 965))
hero_photo.save('design-reference/compare/ref_hero_photo.png')
print('Saved ref_hero_photo.png')

# 2. Inspect Hero paragraph
# x around 50..600, y around 400..600
hero_para = ref.crop((50, 450, 650, 600))
hero_para.save('design-reference/compare/ref_hero_para.png')
print('Saved ref_hero_para.png')

# 3. Inspect Timer Arc (Section 01, y around 1000..2000)
# Let's search for timer dial
ref_sec01 = ref.crop((0, 965, 1366, 2100))
ref_sec01.save('design-reference/compare/ref_sec01.png')
print('Saved ref_sec01.png')

# 4. Inspect Field note radar chart
# Radar chart is inside field note card (right side of sec01)
ref_radar = ref.crop((850, 1400, 1300, 1850))
ref_radar.save('design-reference/compare/ref_radar.png')
print('Saved ref_radar.png')

# 5. Inspect Section 02 (The Journey / Ambient focus card)
# y around 2100..2800
ref_sec02 = ref.crop((0, 2100, 1366, 2800))
ref_sec02.save('design-reference/compare/ref_sec02.png')
print('Saved ref_sec02.png')

# 6. Inspect Section 03 (Reflection)
# y around 2800..3400
ref_sec03 = ref.crop((0, 2750, 1366, 3350))
ref_sec03.save('design-reference/compare/ref_sec03.png')
print('Saved ref_sec03.png')

# 7. Inspect Footer
# y around 3350..3727
ref_footer = ref.crop((0, 3300, 1366, 3727))
ref_footer.save('design-reference/compare/ref_footer.png')
print('Saved ref_footer.png')
