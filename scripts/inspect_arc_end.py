from PIL import Image

dial_crop = Image.open('design-reference/compare/ref_dial_full.png')
# Let's inspect where the bead or end of arc is in ref_dial_full:
# Dial text center is (328.4, 433.9)
# In ref_dial_full, let's crop the bottom half of the circle (around 6 o'clock, y in [550..650], x in [250..400]):
bottom_arc = dial_crop.crop((230, 530, 430, 670))
bottom_arc.save('design-reference/compare/ref_dial_bottom_arc.png')
print("Saved ref_dial_bottom_arc.png")

# Also let's check 3 o'clock in ref:
right_arc = dial_crop.crop((440, 330, 560, 530))
right_arc.save('design-reference/compare/ref_dial_right_arc.png')
print("Saved ref_dial_right_arc.png")
