import json
from PIL import Image

# Let's inspect the pixels in home-16c-sec03-390.png around y of KEEP GOING
img = Image.open('design-reference/compare/home-16c-sec03-390.png')
print("Image size:", img.size)

# KEEP GOING is around y=770 in home-16c-sec03-390.png
# Let's crop x=150..390, y=700..850
crop = img.crop((150, 700, 390, 850))
crop.save('design-reference/compare/compass_area.png')
print("Saved compass_area.png")
