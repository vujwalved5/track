from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In Section 01, Field Note card:
# Cream card starts around x=885, ends around x=1280.
# Check where the cream card is in ref:
for x in range(850, 1300, 10):
    r, g, b = ref.getpixel((x, 1500))[:3]
    if r > 230 and g > 220:
        print(f"Cream card at x={x}")
        break

# Let's find cream card horizontal bounds at y=1500:
cream_xs = []
for x in range(850, 1350):
    r, g, b = ref.getpixel((x, 1500))[:3]
    if r > 230 and g > 220 and b > 200:
        cream_xs.append(x)
print(f"Cream card x bounds: {min(cream_xs)} .. {max(cream_xs)} (w = {max(cream_xs) - min(cream_xs)})")

# Vertical bounds:
cream_ys = []
for y in range(1000, 2100):
    r, g, b = ref.getpixel((1050, y))[:3]
    if r > 230 and g > 220 and b > 200:
        cream_ys.append(y)
print(f"Cream card y bounds: {min(cream_ys)} .. {max(cream_ys)} (h = {max(cream_ys) - min(cream_ys)})")

# Let's crop the entire cream Field Note card:
field_note = ref.crop((min(cream_xs) - 5, min(cream_ys) - 5, max(cream_xs) + 5, max(cream_ys) + 5))
field_note.save('design-reference/compare/ref_field_note_full.png')
print("Saved ref_field_note_full.png")
