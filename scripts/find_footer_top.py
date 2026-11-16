from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's find where the footer starts in ref:
# Let's scan y from 3100 to 3500 along x=100:
# The footer has a top divider line or eyebrow "TRACK / FOCUS ROOM"
for y in range(3150, 3450, 5):
    r, g, b = ref.getpixel((100, y))[:3]
    # Check if there is gold eyebrow text or divider
    print(f"y={y}: rgb=({r},{g},{b})")
