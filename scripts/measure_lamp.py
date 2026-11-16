from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In focus-room.png, let's find the circles/orbits or the brightest spot of the lamp
# The desk photo is roughly x in [750, 1366], y in [0, 965]
# Let's search for brightest pixels in this region
max_bright = 0
bright_x, bright_y = 0, 0

# Also let's inspect the circles: in the design, what color are the circles around the lamp?
# In FocusHero.tsx, it was:
# <svg viewBox="0 0 574 860" ...>
# Let's inspect the actual image around the lamp.
# Where is the lamp head/bulb?
# In focus-desk.jpg, there is a lamp with a warm shade and bulb.
for y in range(50, 900):
    for x in range(780, 1350):
        r, g, b = ref.getpixel((x, y))[:3]
        # brightness
        bright = (r + g + b) / 3
        if bright > max_bright:
            max_bright = bright
            bright_x, bright_y = x, y

print(f"Brightest pixel (lamp bulb/glow): x={bright_x}, y={bright_y}, rgb={ref.getpixel((bright_x, bright_y))}")

# Let's find the bounding box of the warm lamp shade/light
# Pixels with high brightness and warm tint (r > 200, g > 150)
warm_pixels = []
for y in range(100, 700):
    for x in range(800, 1300):
        r, g, b = ref.getpixel((x, y))[:3]
        if r > 200 and g > 180 and b > 100:
            warm_pixels.append((x, y))

if warm_pixels:
    min_x = min(p[0] for p in warm_pixels)
    max_x = max(p[0] for p in warm_pixels)
    min_y = min(p[1] for p in warm_pixels)
    max_y = max(p[1] for p in warm_pixels)
    center_x = (min_x + max_x) // 2
    center_y = (min_y + max_y) // 2
    print(f"Warm pixels count: {len(warm_pixels)}")
    print(f"Warm bulb bounding box: x=[{min_x}, {max_x}], y=[{min_y}, {max_y}]")
    print(f"Warm bulb center: x={center_x}, y={center_y}")
