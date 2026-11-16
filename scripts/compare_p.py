from PIL import Image

ref = Image.open('design-reference/focus-room.png')
site = Image.open('design-reference/compare/focus_1366_before.png')

# Hero paragraph:
# In ref: y ~ 538
ref_p = ref.crop((80, 525, 550, 600))
ref_p.save('design-reference/compare/p_ref.png')

# In site: y ~ 538
site_p = site.crop((80, 525, 550, 600))
site_p.save('design-reference/compare/p_site.png')

print("Saved p_ref.png and p_site.png")
