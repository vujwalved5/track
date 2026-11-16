from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Crop around the lamp area: x=1000..1300, y=150..550
lamp_crop = ref.crop((950, 150, 1300, 600))
lamp_crop.save('design-reference/compare/lamp_zoom.png')
print("Saved lamp_zoom.png")

# Also crop the whole hero photo area to see all orbit circles in the design
hero_photo_full = ref.crop((780, 95, 1366, 965))
hero_photo_full.save('design-reference/compare/ref_hero_photo_full.png')
print("Saved ref_hero_photo_full.png")
