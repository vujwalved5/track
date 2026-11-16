from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In ref, let's find the circle lines or arcs!
# In the design, circles are thin strokes (often cream/gold, e.g. #D2A75D or #F4EFE4 or similar).
# Let's inspect along several horizontal and vertical lines to detect the orbit circles.
# What are the circles centred on?
# "circles centred on the lamp as in the design, not a large tilted ellipse."
# Let's search for circular arcs in the photo area:
# Photo area: x in [792, 1340], y in [117, 927]

# Let's search around the lamp head.
# Where is the lamp head?
# Let's save a detailed crop of the lamp head:
# In the photo, there is an incandescent/warm desk lamp with a curved arm and shade.
# Let's find the shade / bulb coordinates by inspecting the image around x=1050..1200, y=250..400.
lamp_shade = ref.crop((1000, 200, 1250, 450))
lamp_shade.save('design-reference/compare/lamp_shade_detail.png')
print("Saved lamp_shade_detail.png")
