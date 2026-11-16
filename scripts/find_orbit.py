from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# The hero section is from y = 95 to y = 965 roughly.
# Let's inspect the right side of hero: x from 780 to 1366, y from 95 to 965.
# Let's crop it and find any circles or rings!
crop = ref.crop((780, 95, 1366, 965))
crop.save('design-reference/compare/hero_right_95_965.png')

# In hero_right_95_965, let's find the lamp shade / head.
# Let's sample a grid of coordinates and colors, or search for circle edges.
# The orbit lines in the design: what color are they?
# Are they gold / cream circles?
# Let's inspect pixels in hero_right:
print("Hero right cropped: 586 x 870")
