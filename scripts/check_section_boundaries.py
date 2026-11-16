from PIL import Image

ref = Image.open('design-reference/focus-room.png')
after = Image.open('design-reference/compare/focus_1366_after.png')

print(f"Ref size: {ref.size}")
print(f"After size: {after.size}")

# Let's find section boundaries in ref:
# Hero: 91..953 (h=862)
# Sec01: 953..2263 (or where does Sec02 start?)
# Let's find "02 / THE JOURNEY" in ref:
# Let's scan y for text at x=84 in ref:
for y in range(953, 3700, 10):
    r, g, b = ref.getpixel((84, y))[:3]
    if r > 160 and g > 120 and b < 100: # gold text
        print(f"Ref gold eyebrow at y={y}")

print("\n--- After ---")
for y in range(953, 3700, 10):
    r, g, b = after.getpixel((84, y))[:3]
    if r > 160 and g > 120 and b < 100:
        print(f"After gold eyebrow at y={y}")
