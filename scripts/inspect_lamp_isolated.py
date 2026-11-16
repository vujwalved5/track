from PIL import Image

ref = Image.open('design-reference/focus-room.png')
hero_ref = ref.crop((780, 91, 1366, 953))

# Let's inspect what is in focus-room.png around the lamp!
# Where is the lamp in focus-room.png?
# Let's find the lamp shade in focus-room.png.
# In the photo, there is a green shade or brass shade of a desk lamp.
# Where is its bulb or shade center?
# Let's examine coordinates in hero_ref (which is 586 x 862).
# Page coordinates: x_page = 780 + x_rel, y_page = 91 + y_rel.
# Let's inspect the pixels of the lamp in hero_ref.
# Let's find the exact center of the lamp shade / bulb.
# Let's save a clear crop of the lamp and surrounding area with pixel coordinates printed on it.
crop = hero_ref.crop((150, 100, 450, 400)) # relative x: 150..450, y: 100..400
crop.save('design-reference/compare/ref_lamp_isolated.png')

# Let's find the circles in this crop:
# Are there concentric circles?
# Let's check pixel colors along radial lines from (280, 230) or nearby.
print("Saved ref_lamp_isolated.png (rel x: 150..450, y: 100..400)")
