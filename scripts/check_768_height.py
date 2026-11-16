from PIL import Image

im1 = Image.open('design-reference/baseline/home-768.png')
im2 = Image.open('scripts/output/home-768.png')
print("768 base height:", im1.height, "768 test height:", im2.height)

# Check hero height in both at 768
# Hero starts below nav (nav height ~95-120 on tablet)
# Scan y at x=100 where section transitions occur
for y in range(0, im1.height, 50):
    c1 = im1.getpixel((100, y))[:3]
    c2 = im2.getpixel((100, min(y, im2.height - 1)))[:3]
    if c1 != c2:
        print(f"y={y}: base={c1}, test={c2}")
        break
