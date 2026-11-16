import os
from PIL import Image, ImageDraw, ImageFont

ref = Image.open('design-reference/focus-room.png')
site = Image.open('design-reference/compare/focus_1366_after.png')

out_dir = 'design-reference/compare'
os.makedirs(out_dir, exist_ok=True)

def make_side_by_side(crop_ref, crop_site, title, filename):
    w1, h1 = crop_ref.size
    w2, h2 = crop_site.size
    w = max(w1, w2)
    h = max(h1, h2)
    header_h = 30
    comb = Image.new('RGB', (w * 2 + 20, h + header_h), (23, 37, 54))
    draw = ImageDraw.Draw(comb)
    draw.text((10, 8), f"DESIGN REFERENCE: {title}", fill=(210, 167, 93))
    draw.text((w + 30, 8), f"OUR BUILD (14E): {title}", fill=(244, 239, 228))
    comb.paste(crop_ref, (0, header_h))
    comb.paste(crop_site, (w + 20, header_h))
    out_path = os.path.join(out_dir, filename)
    comb.save(out_path)
    print(f"Saved {out_path} ({comb.size})")

# 1. Full Page
ref_full = ref.crop((0, 0, 1366, 3727))
site_full = site.crop((0, 0, 1366, 3727))
make_side_by_side(ref_full, site_full, "Full Page (1366x3727)", "focus-14e-full.png")

# 2. Fix 1: Footer
ref_footer = ref.crop((0, 3340, 1366, 3727))
site_footer = site.crop((0, 3340, 1366, 3727))
make_side_by_side(ref_footer, site_footer, "Footer (Heading & Right-Aligned Nav)", "focus-14e-fix1-footer.png")

# 3. Fix 2: Hero Paragraph
ref_para = ref.crop((80, 520, 580, 605))
site_para = site.crop((80, 520, 580, 605))
make_side_by_side(ref_para, site_para, "Hero Paragraph Natural Wrap", "focus-14e-fix2-hero-wrap.png")

# 4. Fix 3: Hero Orbit Overlay
ref_orbit = ref.crop((780, 91, 1366, 560))
site_orbit = site.crop((780, 91, 1366, 560))
make_side_by_side(ref_orbit, site_orbit, "Hero Orbit Circles Centred on Lamp", "focus-14e-fix3-hero-orbit.png")

# 5. Fix 4: Ambient Focus Card
ref_amb = ref.crop((600, 2280, 1320, 2700))
site_amb = site.crop((600, 2280, 1320, 2700))
make_side_by_side(ref_amb, site_amb, "Ambient Focus Card (White Inner Border Removed)", "focus-14e-fix4-ambient-card.png")

# 6. Fix 5: Radar Chart in Field Note
ref_radar = ref.crop((890, 1470, 1290, 1790))
site_radar = site.crop((890, 1470, 1290, 1790))
make_side_by_side(ref_radar, site_radar, "Radar Chart (Larger, Dark Lines, No Pink Fill)", "focus-14e-fix5-radar-chart.png")

# 7. Fix 6: Section 03 Background Glow
ref_sec03 = ref.crop((0, 2786, 1366, 3340))
site_sec03 = site.crop((0, 2786, 1366, 3340))
make_side_by_side(ref_sec03, site_sec03, "Section 03 Background Blue Glow", "focus-14e-fix6-reflection-glow.png")

# 8. Fix 7: Timer Arc
ref_arc = ref.crop((180, 1200, 660, 1760))
site_arc = site.crop((180, 1200, 660, 1760))
make_side_by_side(ref_arc, site_arc, "Timer Arc (Starts 12 o'clock, Ends ~6 o'clock 195°)", "focus-14e-fix7-timer-arc.png")
