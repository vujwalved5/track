from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
# Where is the teal magazine in hero-desk.jpg?
# Earlier we found: Teal magazine in hero-desk.jpg: x=280..3080, y=1240..2340
# Notice that y=0..1240 in hero-desk.jpg has the white magazine page and desk!
# But what is in ref_hero_photo_actual.png?
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')
# What are the colors along the left edge (x=0) of ref from y=0 to 870?
for y in range(0, 870, 40):
    print(f'ref y={y}: {ref.getpixel((0, y))[:3]}')
