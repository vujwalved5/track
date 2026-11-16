from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In ref, find the framing line of the photo:
# Let's search for the border lines around x=792..800, x=1330..1345, y=110..130, y=920..940
# Let's scan horizontally across y=120
for x in range(780, 810):
    r,g,b = ref.getpixel((x, 117))[:3]
    if r > 50 or g > 50 or b > 50:
        print(f"Top-left border near x={x}, y=117: rgb=({r},{g},{b})")

# Let's find exact photo frame border coordinates:
# top, bottom, left, right
# Let's scan along x=1000 from y=100 to y=150
for y in range(100, 140):
    r,g,b = ref.getpixel((1000, y))[:3]
    if r > 60:
        print(f"Top border at y={y}: rgb=({r},{g},{b})")

for y in range(910, 940):
    r,g,b = ref.getpixel((1000, y))[:3]
    if r > 60:
        print(f"Bottom border at y={y}: rgb=({r},{g},{b})")

for x in range(780, 810):
    r,g,b = ref.getpixel((x, 500))[:3]
    if r > 60:
        print(f"Left border at x={x}: rgb=({r},{g},{b})")

for x in range(1330, 1360):
    r,g,b = ref.getpixel((x, 500))[:3]
    if r > 60:
        print(f"Right border at x={x}: rgb=({r},{g},{b})")
