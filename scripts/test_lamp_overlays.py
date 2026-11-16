from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's inspect the entire hero photo in focus-room.png
# Let's save a crop with a grid drawn on it or print pixel values so we can see everything in it!
crop = ref.crop((780, 91, 1366, 953))

# Let's draw the candidate circles onto a copy and see where they lie relative to the lamp!
from PIL import ImageDraw

# Image 1: candidate 1: centered at lamp high-brightness center (page x=1101, y=231 -> rel x=321, y=140)
c1 = crop.copy()
d1 = ImageDraw.Draw(c1)
# Lamp center
d1.ellipse((321 - 5, 140 - 5, 321 + 5, 140 + 5), fill='red')
d1.ellipse((321 - 80, 140 - 80, 321 + 80, 140 + 80), outline='yellow', width=2)
d1.ellipse((321 - 140, 140 - 140, 321 + 140, 140 + 140), outline='cyan', width=2)
c1.save('design-reference/compare/test_lamp_rel_321_140.png')

# Image 2: candidate 2: centered at (page x=1240, y=430 -> rel x=460, y=339)
c2 = crop.copy()
d2 = ImageDraw.Draw(c2)
d2.ellipse((460 - 5, 339 - 5, 460 + 5, 339 + 5), fill='red')
d2.ellipse((460 - 146, 339 - 146, 460 + 146, 339 + 146), outline='yellow', width=2)
c2.save('design-reference/compare/test_candidate_460_339.png')

print("Saved test_lamp_rel_321_140.png and test_candidate_460_339.png")
