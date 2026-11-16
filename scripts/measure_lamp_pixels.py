from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In focus-room.png, let's find the exact lamp shade and bulb glow.
# In the hero photo region (x: 780..1366, y: 91..953):
# Let's save a zoomed image with coordinates marked every 10 pixels:
lamp_box = (1000, 150, 1200, 350)
crop = ref.crop(lamp_box)
crop.save('design-reference/compare/lamp_pixel_measured.png')

# Let's find the center of the lamp shade / bulb glow:
# The lamp shade in focus-room.png:
# Let's find the warm glow pixels (where the bulb shines light onto the desk/books):
# In focus-room.png:
# Let's print the bounding box of the lamp shade:
shade_pixels = []
for y in range(150, 350):
    for x in range(1000, 1200):
        r, g, b = ref.getpixel((x, y))[:3]
        # Lamp shade / bulb has warm glow: r > 120, g > 115, r > b + 10
        if r > 125 and g > 110 and r > b + 5:
            shade_pixels.append((x, y))

if shade_pixels:
    xs = [p[0] for p in shade_pixels]
    ys = [p[1] for p in shade_pixels]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    center_x = (min_x + max_x) / 2
    center_y = (min_y + max_y) / 2
    print(f"Lamp shade in focus-room.png (1366 wide screenshot):")
    print(f"Page X: {min_x} .. {max_x} -> Center X = {center_x:.1f}")
    print(f"Page Y: {min_y} .. {max_y} -> Center Y = {center_y:.1f}")
    
    # Relative to hero container (780, 91):
    rel_center_x = center_x - 780
    rel_center_y = center_y - 91
    print(f"Relative to Right Column (586x862):")
    print(f"Rel Center X = {rel_center_x:.1f}")
    print(f"Rel Center Y = {rel_center_y:.1f}")

    # Relative to photo frame (792, 117):
    frame_center_x = center_x - 792
    frame_center_y = center_y - 117
    print(f"Relative to Photo Frame (548x810):")
    print(f"Frame Center X = {frame_center_x:.1f}")
    print(f"Frame Center Y = {frame_center_y:.1f}")
