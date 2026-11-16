from PIL import Image

ref = Image.open('design-reference/focus-room.png')

pixels = []
for y in range(180, 800):
    for x in range(850, 1280):
        r, g, b = ref.getpixel((x, y))[:3]
        pixels.append(((r + g + b) / 3, r, g, b, x, y))

pixels.sort(reverse=True)
print("Top 20 brightest pixels in interior photo:")
for p in pixels[:20]:
    print(f"bright={p[0]:.1f}, rgb=({p[1]},{p[2]},{p[3]}), x={p[4]}, y={p[5]}")
