from PIL import Image

before = Image.open('design-reference/compare/focus_1366_before.png')
after = Image.open('design-reference/compare/focus_1366_after.png')

# In Section 01:
# Let's check where the bottom border of Section 01 is in before vs after:
# Section 01 starts at y=956
# Let's find bottom divider of section 01 around y in [2100..2200]:
for name, img in [('before', before), ('after', after)]:
    for y in range(2000, 2200):
        c = img.getpixel((100, y))[:3]
        if c != (23, 37, 54):
            print(f"{name}: y={y}, c={c}")
