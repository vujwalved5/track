from PIL import Image

f = Image.open('design-reference/compare/ref_footer_complete.png')

# Let's crop the right side of the footer top:
# x: 900..1300, y: 50..180
nav_crop = f.crop((900, 50, 1300, 180))
nav_crop.save('design-reference/compare/ref_footer_nav_crop.png')
print("Saved ref_footer_nav_crop.png")

# Also crop the heading "Until then, take your time.":
# x: 80..960, y: 100..180
h_crop = f.crop((80, 100, 960, 180))
h_crop.save('design-reference/compare/ref_footer_heading_crop.png')
print("Saved ref_footer_heading_crop.png")
