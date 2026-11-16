from PIL import Image, ImageChops

im1 = Image.open('design-reference/baseline/home-1366.png').convert('RGB')
im2 = Image.open('scripts/output/home-1366.png').convert('RGB')

for sec_name, (y1, y2) in [
    ("Nav (y=0..95)", (0, 95)),
    ("Hero (16D) (y=95..965)", (95, 965)),
    ("Sec 01 Idea (16D) (y=965..1602)", (965, 1602)),
    ("Sec 02 Tools (y=1602..2600)", (1602, 2600)),
    ("Sec 03 Long View (y=2600..3600)", (2600, 3600)),
    ("Sec 04 Note (y=3600..4600)", (3600, 4600)),
    ("Sec 05 Next Page (y=4600..5000)", (4600, 5000)),
    ("Footer (y=5000..5283)", (5000, 5283)),
]:
    c1 = im1.crop((0, y1, im1.width, y2))
    c2 = im2.crop((0, y1, im2.width, y2))
    diff = ImageChops.difference(c1, c2)
    large_diff_count = 0
    for y in range(c1.height):
        for x in range(0, c1.width, 5):
            p = diff.getpixel((x, y))
            if max(p) > 30:
                large_diff_count += 1
    total_sampled = (c1.height * (c1.width // 5))
    pct = (large_diff_count / total_sampled) * 100
    print(f"{sec_name}: large diff (>30) = {large_diff_count} / {total_sampled} ({pct:.2f}%)")
