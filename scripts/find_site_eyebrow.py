from PIL import Image

site = Image.open('design-reference/compare/current_site_1366.png')

# Search for terracotta rule (r > 160, g < 120, b < 100) or text (r < 120, g < 100, b < 80)
# in x: 70..480, y: 95..250
rule_pts = []
text_pts = []
for y in range(95, 250):
    for x in range(70, 480):
        c = site.getpixel((x, y))[:3]
        if c[0] > 160 and c[1] < 120 and c[2] < 100:
            rule_pts.append((x, y))
        elif c[0] < 120 and c[1] < 100 and c[2] < 80:
            text_pts.append((x, y))

if rule_pts:
    print(f"Site Eyebrow rule: x={min(p[0] for p in rule_pts)}..{max(p[0] for p in rule_pts)}, y={min(p[1] for p in rule_pts)}..{max(p[1] for p in rule_pts)}")
    print(f"Site Eyebrow rule rel y: {min(p[1] for p in rule_pts) - 95}..{max(p[1] for p in rule_pts) - 95}")

if text_pts:
    print(f"Site Eyebrow text: x={min(p[0] for p in text_pts)}..{max(p[0] for p in text_pts)}, y={min(p[1] for p in text_pts)}..{max(p[1] for p in text_pts)}")
    print(f"Site Eyebrow text rel y: {min(p[1] for p in text_pts) - 95}..{max(p[1] for p in text_pts) - 95}")
