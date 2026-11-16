import os
from PIL import Image, ImageDraw, ImageFont

artifacts_dir = r"C:\Users\aruko\.gemini\antigravity\brain\ee6aeb57-f11f-456e-a239-9df767910937"
given_image_path = os.path.join(artifacts_dir, ".user_uploaded", "media_1794717847511_93bde018.jpg")
baseline_webpage_path = "design_baseline_webpage.png"

# Load fonts
font_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 26)
font_subtitle = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 15)
font_badge = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 13)
font_card_title = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 18)
font_card_sub = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 13)
font_body = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 14)
font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 14)

# Open baseline webpage
img_baseline = Image.open(baseline_webpage_path) # (1024, 571)

designs = [
    {
        "id": "design_a",
        "title": "DESIGN A: THE LEDGER",
        "branch": "feature/focus-timer-design-a",
        "shot": "screenshots/design_a_match_571.png",
        "dark_card_diff": "Replaces 3 pace tabs with structured 3-row setup form (study stepper + 25/50/90 chips, break 5/10 toggle, total time stepper + 1H-4H chips) & live preview line. Collapses to read-only block schedule upon Start.",
        "cream_card_diff": "Strict 5-part companion hierarchy: Checklist gate with 'Skip checklist' link -> task text input -> session progress bar ('BLOCK 2 OF 5') -> 4s box breathing guide (active only in breaks) -> procedural Web Audio sound controls."
    },
    {
        "id": "design_b",
        "title": "DESIGN B: DIAL-FIRST",
        "branch": "feature/focus-timer-design-b",
        "shot": "screenshots/design_b_match_571.png",
        "dark_card_diff": "Embeds session configuration directly on the dial. The SVG ring divides into proportional focus/break arcs redrawn live. Three interactive pills ('STUDY 25', 'BREAK 5', 'TOTAL 2H') with keyboard Up/Down control & 3 preset links.",
        "cream_card_diff": "Sound-first companion panel: Task input at top -> vertical list of 5 noise generators with custom SVG waveforms (0 emoji) -> checklist gate -> progress bar -> breathing guide animating exclusively during break intervals."
    },
    {
        "id": "design_c",
        "title": "DESIGN C: SESSION STRIP",
        "branch": "feature/focus-timer-design-c",
        "shot": "screenshots/design_c_match_571.png",
        "dark_card_diff": "Retains original dial and action buttons untouched, adding a proportional horizontal session timeline bar with moving needle and clock ticks ('START NOW', 'MID ~hh:mm', 'ENDS ~hh:mm').",
        "cream_card_diff": "Dual-mode side panel: Guided 3-step setup wizard ('Next'/'Back' flow with live preview) before start; flips smoothly to full companion mode (checklist gate, task input, progress bar, breathing guide, compact 2-row sound controls) once running."
    }
]

# Canvas configuration
canvas_w = 2128
pad_x = 32
pad_y = 24
header_h = 100
label_bar_h = 42
img_w = 1024
img_h = 571
footer_h = 150
canvas_h = pad_y + header_h + label_bar_h + img_h + 16 + footer_h + pad_y

c_bg = (15, 23, 36)          # #0F1724
c_card_bg = (23, 37, 54)     # #172536
c_gold = (182, 138, 83)      # #B68A53
c_cream = (244, 239, 228)    # #F4EFE4
c_cream_muted = (195, 190, 180)
c_border = (45, 62, 85)
c_badge_bg = (29, 44, 66)

for d in designs:
    canvas = Image.new("RGB", (canvas_w, canvas_h), c_bg)
    draw = ImageDraw.Draw(canvas)

    # 1. Header Banner
    header_box = (pad_x, pad_y, canvas_w - pad_x, pad_y + header_h)
    draw.rectangle(header_box, fill=c_card_bg, outline=c_gold, width=1)
    
    # Top gold tracking label
    draw.text((pad_x + 24, pad_y + 16), "TRACK / FOCUS ROOM — DESIGN COMPARISON", font=font_badge, fill=c_gold)
    
    # Title
    title_text = f"ORIGINAL (GIVEN IMAGE)  vs.  {d['title']}"
    draw.text((pad_x + 24, pad_y + 36), title_text, font=font_title, fill=c_cream)
    
    # Branch pill
    branch_text = f"Branch: {d['branch']}"
    draw.text((pad_x + 24, pad_y + 70), branch_text, font=font_subtitle, fill=c_cream_muted)

    # 2. Left vs Right Column Labels
    y_labels = pad_y + header_h + 16
    left_x = pad_x
    right_x = pad_x + img_w + 16

    # Left Column Header: Given Image
    draw.rectangle((left_x, y_labels, left_x + img_w, y_labels + label_bar_h), fill=c_badge_bg, outline=c_border, width=1)
    draw.text((left_x + 16, y_labels + 11), "LEFT: GIVEN IMAGE (ORIGINAL BASELINE)", font=font_card_title, fill=c_gold)
    draw.text((left_x + 420, y_labels + 14), "Original 3 pace tabs, static ritual checklist, static breathing circles", font=font_card_sub, fill=c_cream_muted)

    # Right Column Header: New Design
    draw.rectangle((right_x, y_labels, right_x + img_w, y_labels + label_bar_h), fill=c_badge_bg, outline=c_gold, width=1)
    draw.text((right_x + 16, y_labels + 11), f"RIGHT: {d['title']}", font=font_card_title, fill=c_gold)
    draw.text((right_x + 360, y_labels + 14), f"Web Audio engine, procedural chimes, interactive companion panel", font=font_card_sub, fill=c_cream)

    # 3. Paste Images
    y_img = y_labels + label_bar_h + 4
    
    # Paste Baseline on Left
    canvas.paste(img_baseline, (left_x, y_img))
    draw.rectangle((left_x, y_img, left_x + img_w, y_img + img_h), outline=c_border, width=1)

    # Paste New Design on Right
    img_design = Image.open(d["shot"])
    canvas.paste(img_design, (right_x, y_img))
    draw.rectangle((right_x, y_img, right_x + img_w, y_img + img_h), outline=c_gold, width=1)

    # 4. Bottom Comparison Notes Card
    y_footer = y_img + img_h + 14
    footer_box = (pad_x, y_footer, canvas_w - pad_x, y_footer + footer_h)
    draw.rectangle(footer_box, fill=c_card_bg, outline=c_border, width=1)

    draw.text((pad_x + 24, y_footer + 14), "KEY ARCHITECTURAL & INTERFACE DIFFERENCES IN THIS VARIATION", font=font_bold, fill=c_gold)

    # Left note: Dark Card Changes
    draw.text((pad_x + 24, y_footer + 42), "Dark Timer Card:", font=font_bold, fill=c_cream)
    # wrap text if needed
    draw.text((pad_x + 24, y_footer + 64), d["dark_card_diff"], font=font_body, fill=c_cream_muted)

    # Right note: Cream Card Changes
    draw.text((pad_x + 24, y_footer + 92), "Cream Side Panel:", font=font_bold, fill=c_cream)
    draw.text((pad_x + 24, y_footer + 114), d["cream_card_diff"], font=font_body, fill=c_cream_muted)

    # Save to screenshots/ and artifacts directory
    out_local = f"screenshots/comparison_{d['id']}.png"
    out_artifact = os.path.join(artifacts_dir, f"comparison_{d['id']}.png")
    
    canvas.save(out_local, quality=95)
    canvas.save(out_artifact, quality=95)
    print(f"Generated {out_local} and {out_artifact} ({canvas_w}x{canvas_h})")

# 5. Generate Master 2x2 Overview
print("Generating master 2x2 overview...")
master_w = 2128
master_h = pad_y + header_h + 16 + (label_bar_h + img_h + 16) * 2 + pad_y
master_canvas = Image.new("RGB", (master_w, master_h), c_bg)
master_draw = ImageDraw.Draw(master_canvas)

# Master Header
m_header_box = (pad_x, pad_y, master_w - pad_x, pad_y + header_h)
master_draw.rectangle(m_header_box, fill=c_card_bg, outline=c_gold, width=1)
master_draw.text((pad_x + 24, pad_y + 16), "TRACK / FOCUS ROOM — MASTER DESIGN MATRIX", font=font_badge, fill=c_gold)
master_draw.text((pad_x + 24, pad_y + 36), "GIVEN IMAGE vs. DESIGNS A, B & C (4-WAY MATRIX)", font=font_title, fill=c_cream)
master_draw.text((pad_x + 24, pad_y + 70), "All 3 designs share the identical Web Audio engine & zero-drift scheduler; compared at exact 1024x571 framing", font=font_subtitle, fill=c_cream_muted)

cells = [
    {"title": "GIVEN IMAGE (ORIGINAL BASELINE)", "img": img_baseline, "x": left_x, "y": pad_y + header_h + 16, "border": c_border},
    {"title": "DESIGN A: THE LEDGER (FORM & COLLAPSIBLE LIST)", "img": Image.open(designs[0]["shot"]), "x": right_x, "y": pad_y + header_h + 16, "border": c_gold},
    {"title": "DESIGN B: DIAL-FIRST (PROPORTIONAL ARCS & PILLS)", "img": Image.open(designs[1]["shot"]), "x": left_x, "y": pad_y + header_h + 16 + label_bar_h + img_h + 16, "border": c_gold},
    {"title": "DESIGN C: SESSION STRIP (TIMELINE & 3-STEP WIZARD)", "img": Image.open(designs[2]["shot"]), "x": right_x, "y": pad_y + header_h + 16 + label_bar_h + img_h + 16, "border": c_gold},
]

for cell in cells:
    cx = cell["x"]
    cy = cell["y"]
    # Label bar
    master_draw.rectangle((cx, cy, cx + img_w, cy + label_bar_h), fill=c_badge_bg, outline=cell["border"], width=1)
    master_draw.text((cx + 16, cy + 11), cell["title"], font=font_card_title, fill=c_gold)
    # Paste image
    master_canvas.paste(cell["img"], (cx, cy + label_bar_h))
    master_draw.rectangle((cx, cy + label_bar_h, cx + img_w, cy + label_bar_h + img_h), outline=cell["border"], width=1)

master_local = "screenshots/comparison_master_matrix.png"
master_artifact = os.path.join(artifacts_dir, "comparison_master_matrix.png")
master_canvas.save(master_local, quality=95)
master_canvas.save(master_artifact, quality=95)
print(f"Generated {master_local} and {master_artifact}")
