from PIL import Image

ref = Image.open('design-reference/focus-room.png')
# In page coordinates, hero photo is x: 780..1366, y: 91..953
# Let's inspect column x = 780 + 320 = 1100 in page coordinates from y=91 to 953
print("Scanning column x=1100 in page coordinates:")
for y in range(91, 500, 10):
    r, g, b = ref.getpixel((1100, y))[:3]
    print(f"y={y} (rel {y-91}): rgb=({r:3d},{g:3d},{b:3d})")
