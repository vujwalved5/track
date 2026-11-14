import os
from PIL import Image

ref = Image.open('design-reference/home.png')
site = Image.open('design-reference/compare/current_site_1366.png')

print(f"Ref size: {ref.size}, Site size: {site.size}")

def get_tight_box(im, x0, y0, x1, y1, is_ink):
    min_x, max_x, min_y, max_y = x1, x0, y1, y0
    found = False
    for y in range(y0, y1):
        for x in range(x0, x1):
            c = im.getpixel((x, y))[:3]
            if is_ink(c):
                found = True
                if x < min_x: min_x = x
                if x > max_x: max_x = x
                if y < min_y: min_y = y
                if y > max_y: max_y = y
    if not found:
        return None
    return {
        'x': min_x, 'y': min_y,
        'w': max_x - min_x + 1, 'h': max_y - min_y + 1,
        'right': max_x, 'bottom': max_y
    }

bg_cream = (244, 239, 228)
bg_navy = (23, 37, 54)

ink_dark = lambda c: (c[0] < 120 and c[1] < 120 and c[2] < 120 and sum(abs(a-b) for a, b in zip(c, bg_cream)) > 40)
ink_terracotta = lambda c: (c[0] > 140 and c[1] < 120 and c[2] < 100)
ink_cream = lambda c: (c[0] > 180 and c[1] > 175 and c[2] > 160 and sum(abs(a-b) for a, b in zip(c, bg_navy)) > 40)
ink_gold = lambda c: (c[0] > 160 and c[1] > 130 and c[2] < 120 and sum(abs(a-b) for a, b in zip(c, bg_navy)) > 40)

print("\n--- 1. NAV MEASUREMENTS ---")
ref_brand = get_tight_box(ref, 70, 15, 270, 85, ink_dark)
site_brand = get_tight_box(site, 70, 15, 270, 85, ink_dark)
print(f"Ref Nav Brand:  x={ref_brand['x']}..{ref_brand['right']} (w={ref_brand['w']}), y={ref_brand['y']}..{ref_brand['bottom']} (h={ref_brand['h']})")
print(f"Site Nav Brand: x={site_brand['x']}..{site_brand['right']} (w={site_brand['w']}), y={site_brand['y']}..{site_brand['bottom']} (h={site_brand['h']})")
print(f"Brand height delta: {abs(site_brand['h'] - ref_brand['h'])}px")

print("\n--- 2. HERO HEADLINE MEASUREMENTS ---")
# 'Make'
ref_make = get_tight_box(ref, 75, 280, 400, 405, ink_dark)
site_make = get_tight_box(site, 75, 280, 400, 405, ink_dark)
print(f"Ref Make:  x={ref_make['x']}, y={ref_make['y']} (rel y={ref_make['y']-95}), w={ref_make['w']}, h={ref_make['h']}")
print(f"Site Make: x={site_make['x']}, y={site_make['y']} (rel y={site_make['y']-95}), w={site_make['w']}, h={site_make['h']}")

# 'Every Day'
ref_ed = get_tight_box(ref, 75, 410, 560, 550, ink_dark)
site_ed = get_tight_box(site, 75, 410, 560, 550, ink_dark)
print(f"Ref Every Day:  x={ref_ed['x']}, y={ref_ed['y']} (rel y={ref_ed['y']-95}), w={ref_ed['w']}, h={ref_ed['h']}")
print(f"Site Every Day: x={site_ed['x']}, y={site_ed['y']} (rel y={site_ed['y']-95}), w={site_ed['w']}, h={site_ed['h']}")

# 'Count.'
ref_cnt = get_tight_box(ref, 75, 535, 520, 650, ink_terracotta)
site_cnt = get_tight_box(site, 75, 535, 520, 650, ink_terracotta)
print(f"Ref Count.:  x={ref_cnt['x']}, y={ref_cnt['y']} (rel y={ref_cnt['y']-95}), w={ref_cnt['w']}, h={ref_cnt['h']}")
print(f"Site Count.: x={site_cnt['x']}, y={site_cnt['y']} (rel y={site_cnt['y']-95}), w={site_cnt['w']}, h={site_cnt['h']}")

# Baselines / Pitch
print(f"Ref Pitch 1 (Make -> Every Day): {ref_ed['bottom'] - ref_make['bottom']}px")
print(f"Site Pitch 1 (Make -> Every Day): {site_ed['bottom'] - site_make['bottom']}px")
print(f"Ref Pitch 2 (Every Day -> Count.): {ref_cnt['bottom'] - ref_ed['bottom']}px")
print(f"Site Pitch 2 (Every Day -> Count.): {site_cnt['bottom'] - site_ed['bottom']}px")

print("\n--- 3. HERO VERTICAL LAYOUT ---")
ref_eye = get_tight_box(ref, 75, 205, 480, 230, ink_dark)
site_eye = get_tight_box(site, 75, 205, 480, 230, ink_dark)
if ref_eye and site_eye:
    print(f"Ref Eyebrow:  y={ref_eye['y']} (rel y={ref_eye['y']-95}), h={ref_eye['h']}")
    print(f"Site Eyebrow: y={site_eye['y']} (rel y={site_eye['y']-95}), h={site_eye['h']}")

ref_sub = get_tight_box(ref, 75, 680, 520, 745, ink_dark)
site_sub = get_tight_box(site, 75, 680, 520, 755, ink_dark)
if ref_sub and site_sub:
    print(f"Ref Subpara:  y={ref_sub['y']} (rel y={ref_sub['y']-95}), h={ref_sub['h']}")
    print(f"Site Subpara: y={site_sub['y']} (rel y={site_sub['y']-95}), h={site_sub['h']}")

ref_cta = get_tight_box(ref, 75, 760, 520, 825, ink_dark)
site_cta = get_tight_box(site, 75, 760, 520, 830, ink_dark)
if ref_cta and site_cta:
    print(f"Ref CTAs:  y={ref_cta['y']} (rel y={ref_cta['y']-95}), h={ref_cta['h']}")
    print(f"Site CTAs: y={site_cta['y']} (rel y={site_cta['y']-95}), h={site_cta['h']}")

ref_scroll = get_tight_box(ref, 75, 865, 520, 900, ink_dark)
site_scroll = get_tight_box(site, 75, 865, 520, 900, ink_dark)
if ref_scroll and site_scroll:
    print(f"Ref Scroll:  y={ref_scroll['y']} (rel y={ref_scroll['y']-95}), h={ref_scroll['h']}")
    print(f"Site Scroll: y={site_scroll['y']} (rel y={site_scroll['y']-95}), h={site_scroll['h']}")

print("\n--- 4. POLAROID & FIELD NOTE ---")
col_1365_site = [site.getpixel((1365, y))[:3] for y in range(95, 400)]
has_polaroid_at_edge_site = any(c[0] > 220 and c[1] > 215 and c[2] > 200 for c in col_1365_site)
print(f"Site Polaroid clipped at x=1365: {has_polaroid_at_edge_site}")

ref_fn = get_tight_box(ref, 780, 530, 1140, 860, lambda c: c[0] > 220 and c[1] > 210 and c[2] > 200)
site_fn = get_tight_box(site, 780, 530, 1140, 860, lambda c: c[0] > 220 and c[1] > 210 and c[2] > 200)
print(f"Ref Field Note:  x={ref_fn['x']}..{ref_fn['right']} (w={ref_fn['w']}), y={ref_fn['y']}..{ref_fn['bottom']} (h={ref_fn['h']})")
print(f"Site Field Note: x={site_fn['x']}..{site_fn['right']} (w={site_fn['w']}), y={site_fn['y']}..{site_fn['bottom']} (h={site_fn['h']})")

print("\n--- 5. SECTION 01 MEASUREMENTS ---")
ref_s1_h = get_tight_box(ref, 100, 1160, 450, 1315, lambda c: ink_cream(c) or ink_gold(c))
site_s1_h = get_tight_box(site, 100, 1160, 450, 1315, lambda c: ink_cream(c) or ink_gold(c))
print(f"Ref Sec01 Heading:  x={ref_s1_h['x']}, y={ref_s1_h['y']}..{ref_s1_h['bottom']} (h={ref_s1_h['h']})")
print(f"Site Sec01 Heading: x={site_s1_h['x']}, y={site_s1_h['y']}..{site_s1_h['bottom']} (h={site_s1_h['h']})")

ref_s1_lp = get_tight_box(ref, 100, 1350, 620, 1470, ink_cream)
site_s1_lp = get_tight_box(site, 100, 1350, 620, 1480, ink_cream)
print(f"Ref Sec01 Left Para:  x={ref_s1_lp['x']}, y={ref_s1_lp['y']}..{ref_s1_lp['bottom']} (h={ref_s1_lp['h']}), w={ref_s1_lp['w']}")
print(f"Site Sec01 Left Para: x={site_s1_lp['x']}, y={site_s1_lp['y']}..{site_s1_lp['bottom']} (h={site_s1_lp['h']}), w={site_s1_lp['w']}")

ref_s1_rp = get_tight_box(ref, 850, 1180, 1260, 1360, ink_dark)
site_s1_rp = get_tight_box(site, 850, 1180, 1260, 1360, ink_dark)
print(f"Ref Sec01 Right Para:  x={ref_s1_rp['x']}, y={ref_s1_rp['y']}..{ref_s1_rp['bottom']} (h={ref_s1_rp['h']}), w={ref_s1_rp['w']}")
print(f"Site Sec01 Right Para: x={site_s1_rp['x']}, y={site_s1_rp['y']}..{site_s1_rp['bottom']} (h={site_s1_rp['h']}), w={site_s1_rp['w']}")

ref_bot = get_tight_box(ref, 540, 1350, 770, 1600, lambda c: (70 < c[0] < 165 and 100 < c[1] < 185 and 80 < c[2] < 165))
site_bot = get_tight_box(site, 540, 1350, 770, 1600, lambda c: (70 < c[0] < 165 and 100 < c[1] < 185 and 80 < c[2] < 165))
print(f"Ref Botanical:  x={ref_bot['x']}..{ref_bot['right']} (w={ref_bot['w']}), y={ref_bot['y']}..{ref_bot['bottom']} (h={ref_bot['h']})")
print(f"Site Botanical: x={site_bot['x']}..{site_bot['right']} (w={site_bot['w']}), y={site_bot['y']}..{site_bot['bottom']} (h={site_bot['h']})")
