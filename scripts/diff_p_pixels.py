from PIL import Image

ref_p = Image.open('design-reference/compare/p_ref.png')
site_p = Image.open('design-reference/compare/p_site.png')

# In ref_p:
# Find where line 1 starts and ends, and where line 2 starts and ends
for name, img in [('ref', ref_p), ('site', site_p)]:
    print(f"\n--- {name} ---")
    for y in range(img.height):
        xs = [x for x in range(img.width) if sum(img.getpixel((x, y))[:3])/3 > 140]
        if xs:
            print(f"y={y}: x=[{min(xs)}, {max(xs)}] (w={max(xs)-min(xs)})")
