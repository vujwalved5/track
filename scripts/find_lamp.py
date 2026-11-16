from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's inspect where the lamp shade is in the photo
# Let's search in x: 850..1300, y: 150..700
# What colors are present? In the dark photo, the lamp is a visible object.
# Let's find the coordinates of the lamp by looking at slices.
# Let's save a downsampled or sliced ASCII/color map, or find local maxima of brightness
# within the photo frame (excluding border text/crosshairs):
photo_crop = ref.crop((820, 150, 1330, 850))

# Find the brightest region in photo_crop
pixels = []
for y in range(150, 850):
    for x in range(820, 1330):
        # ignore text or crosshairs if x > 1300 or y > 800
        r, g, b = ref.getpixel((x, y))[:3]
        pixels.append(((r + g + b) / 3, r, g, b, x, y))

pixels.sort(reverse=True)
print("Top 10 brightest pixels in photo:")
for p in pixels[:10]:
    print(f"bright={p[0]:.1f}, rgb=({p[1]},{p[2]},{p[3]}), x={p[4]}, y={p[5]}")

