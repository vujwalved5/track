# scripts/generate_all_compare_artifacts.py
import os
from PIL import Image, ImageDraw, ImageFont

COMPARE_DIR = 'design-reference/compare'
os.makedirs(COMPARE_DIR, exist_ok=True)

# 1. Generate Home 16D Hero 1920 Side-by-Side
ref_hero = Image.open('design-reference/home-1920-hero.png').convert('RGB')
now_home = Image.open('scripts/output/home-1920.png').convert('RGB')

# Crop hero from both: y=0..1045
h = 1045
w = 1920
crop_ref_hero = ref_hero.crop((0, 0, w, min(ref_hero.height, h)))
crop_now_hero = now_home.crop((0, 0, w, h))

# Scale to 960 width for clean side-by-side
scale = 0.5
thumb_w = int(w * scale)
thumb_h = int(h * scale)
t_ref = crop_ref_hero.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
t_now = crop_now_hero.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)

# Create canvas
banner_h = 40
canvas_hero = Image.new('RGB', (thumb_w * 2 + 20, thumb_h + banner_h), (23, 37, 54))
draw_hero = ImageDraw.Draw(canvas_hero)
draw_hero.text((20, 12), "REFERENCE: design-reference/home-1920-hero.png (y=0..1045)", fill=(244, 239, 228))
draw_hero.text((thumb_w + 30, 12), "CURRENT: overnight-fixes Home at 1920px (y=0..1045)", fill=(210, 167, 93))
canvas_hero.paste(t_ref, (10, banner_h))
canvas_hero.paste(t_now, (thumb_w + 10, banner_h))
canvas_hero.save(os.path.join(COMPARE_DIR, 'home-16d-hero-1920.png'))
print("Saved home-16d-hero-1920.png")

# 2. Generate Home 16D Section 01 1920 Side-by-Side
ref_sec01 = Image.open('design-reference/home-1920-section01.png').convert('RGB')
# ref_sec01 is 1920x1200, section runs y=156..848 (h=692)
# now_home Section 01 is at y=1045..1737 (h=692)
crop_ref_s1 = ref_sec01.crop((0, 156, 1920, 848))
crop_now_s1 = now_home.crop((0, 1045, 1920, 1737))

s1_thumb_w = int(1920 * scale)
s1_thumb_h = int(692 * scale)
t_ref_s1 = crop_ref_s1.resize((s1_thumb_w, s1_thumb_h), Image.Resampling.LANCZOS)
t_now_s1 = crop_now_s1.resize((s1_thumb_w, s1_thumb_h), Image.Resampling.LANCZOS)

canvas_s1 = Image.new('RGB', (s1_thumb_w * 2 + 20, s1_thumb_h + banner_h), (23, 37, 54))
draw_s1 = ImageDraw.Draw(canvas_s1)
draw_s1.text((20, 12), "REFERENCE: design-reference/home-1920-section01.png (y=156..848)", fill=(244, 239, 228))
draw_s1.text((s1_thumb_w + 30, 12), "CURRENT: overnight-fixes Section 01 at 1920px (y=1045..1737)", fill=(210, 167, 93))
canvas_s1.paste(t_ref_s1, (10, banner_h))
canvas_s1.paste(t_now_s1, (s1_thumb_w + 10, banner_h))
canvas_s1.save(os.path.join(COMPARE_DIR, 'home-16d-sec01-1920.png'))
print("Saved home-16d-sec01-1920.png")

# 3. Generate Home 16D Container Alignment Annotation
# Crop top nav + hero text: x=200..1700, y=0..600
cont_crop = now_home.crop((200, 0, 1720, 600)).copy()
draw_cont = ImageDraw.Draw(cont_crop)
# Annotate key x coordinates (offset by -200)
# Logo at x=340 -> 140
draw_cont.line([(140, 0), (140, 600)], fill=(189, 99, 74), width=2)
draw_cont.text((145, 15), "Logo & Text Left Edge (x=340)", fill=(189, 99, 74))
# Field notes at x=263 -> 63
draw_cont.line([(63, 100), (63, 600)], fill=(210, 167, 93), width=2)
draw_cont.text((68, 120), "Field Notes (x=263)", fill=(210, 167, 93))
# Panel at x=987 -> 787
draw_cont.line([(787, 0), (787, 600)], fill=(23, 37, 54), width=2)
draw_cont.text((792, 120), "Photo Panel Left (x=987)", fill=(23, 37, 54))
# CTA button end at x=1580 -> 1380
draw_cont.line([(1380, 0), (1380, 100)], fill=(189, 99, 74), width=2)
draw_cont.text((1200, 15), "Nav CTA End (x=1580)", fill=(189, 99, 74))
cont_crop.save(os.path.join(COMPARE_DIR, 'home-16d-container-alignment.png'))
print("Saved home-16d-container-alignment.png")

# 4. Generate Home 16D Photo Panel & Polaroid side-by-side
# Panel crop at 1920: x=987..1678, y=95..1045 (w=691, h=950)
panel_ref = crop_ref_hero.crop((987, 95, 1678, 1045))
panel_now = crop_now_hero.crop((987, 95, 1678, 1045))
p_thumb_w = int(691 * 0.6)
p_thumb_h = int(950 * 0.6)
tp_ref = panel_ref.resize((p_thumb_w, p_thumb_h), Image.Resampling.LANCZOS)
tp_now = panel_now.resize((p_thumb_w, p_thumb_h), Image.Resampling.LANCZOS)

canvas_panel = Image.new('RGB', (p_thumb_w * 2 + 20, p_thumb_h + banner_h), (23, 37, 54))
draw_p = ImageDraw.Draw(canvas_panel)
draw_p.text((20, 12), "REFERENCE: Photo Panel & Polaroid", fill=(244, 239, 228))
draw_p.text((p_thumb_w + 30, 12), "CURRENT: overnight-fixes Panel & Polaroid", fill=(210, 167, 93))
canvas_panel.paste(tp_ref, (10, banner_h))
canvas_panel.paste(tp_now, (p_thumb_w + 10, banner_h))
canvas_panel.save(os.path.join(COMPARE_DIR, 'home-16d-photo-panel.png'))
print("Saved home-16d-photo-panel.png")
