from PIL import Image

ref = Image.open('design-reference/focus-room.png')

for y in range(940, 980):
    r, g, b = ref.getpixel((100, y))[:3]
    if (r, g, b) != (23, 37, 54):
        print(f"y={y}: rgb=({r},{g},{b})")
