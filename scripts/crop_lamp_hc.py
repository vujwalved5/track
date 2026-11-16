from PIL import Image

im = Image.open('design-reference/compare/hero_ref_high_contrast.png')
w, h = im.size

# Let's see what is around the lamp:
# In the lamp area, let's crop around (352, 158) in relative coordinates:
lamp_hc = im.crop((200, 50, 500, 350))
lamp_hc.save('design-reference/compare/lamp_hc_zoom.png')
print("Saved lamp_hc_zoom.png")
