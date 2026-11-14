from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')
ref = Image.open('design-reference/crops/ref_hero_photo_actual.png')

# In ref, let's look at the unobscured bottom left patch:
# x=0..60, y=750..820
patch_ref = ref.crop((0, 750, 80, 820))
patch_ref.save('design-reference/crops/ref_bl_patch.png')

# Let's test x values from 600 to 1050 with step 50, and crop width 1954, height 2592
for x_start in [600, 700, 750, 800, 850, 900, 950, 1000, 1050]:
    crop = desk.crop((x_start, 0, x_start + 1954, 2592)).resize((656, 870), Image.Resampling.LANCZOS)
    cand_patch = crop.crop((0, 750, 80, 820))
    # compute difference
    diff = sum(abs(a-b) for p1, p2 in zip(cand_patch.getdata(), patch_ref.getdata()) for a, b in zip(p1[:3], p2[:3]))
    print(f'x_start={x_start}: diff={diff}')
