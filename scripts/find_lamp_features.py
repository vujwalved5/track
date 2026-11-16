from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In ref, let's look for vector graphics lines in x: 780..1366, y: 91..953.
# Let's find any pixels with the gold color (#D2A75D, #B68A53) or cream (#F4EFE4)
# that form circles or lines.
# Gold color #D2A75D in RGB is (210, 167, 93).
# Gold #B68A53 is (182, 138, 83).
# Let's search for pixels close to these colors or having high saturation/warm hue or standing out from the photo.

candidate_pixels = []
for y in range(95, 950):
    for x in range(780, 1340):
        r, g, b = ref.getpixel((x, y))[:3]
        # In the photo, background is dark/neutral desk.
        # But vector overlay lines might be gold or cream.
        # Let's check if there is an exact or near match for gold line pixels:
        # e.g. r > 150, g > 110, b in [50..120], and r > g > b:
        # Or if there are circles:
        # Let's check difference with surrounding pixels:
        pass

# Let's inspect the SVG in the design or look at the pixels in detail:
# Let's find the lamp in focus-desk.jpg vs focus-room.png:
# Where is the lamp in focus-room.png?
# Let's sample a grid across the photo and print what's in the photo:
# There is coffee cup, books, lamp, etc.
# Where is the lamp head?
# Let's find the books, lamp base, lamp neck, lamp head.
for y in range(150, 750, 30):
    for x in range(850, 1300, 30):
        r, g, b = ref.getpixel((x, y))[:3]
        if r > 130 or g > 130:
            print(f"Bright point at x={x}, y={y}: ({r},{g},{b})")
