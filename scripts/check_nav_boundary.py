from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's find nav bar bottom (where nav ends and hero starts)
# In PublicNav, height is typically ~95px or ~100px.
# Let's check colors down column x=100 from y=0 to y=150
for y in range(80, 130):
    r, g, b = ref.getpixel((100, y))[:3]
    # Check if there is a divider line
    print(f"y={y}: rgb=({r},{g},{b})")
