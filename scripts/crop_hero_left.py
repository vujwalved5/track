from PIL import Image

ref = Image.open('design-reference/focus-room.png')
# Let's inspect the hero left column:
# Headline, paragraph, labels
# Crop hero left column: x: 0..780, y: 91..953
hero_left = ref.crop((0, 91, 780, 953))
hero_left.save('design-reference/compare/hero_left_ref.png')
print("Saved hero_left_ref.png")
