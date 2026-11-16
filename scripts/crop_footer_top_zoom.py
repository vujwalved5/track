from PIL import Image

ref = Image.open('design-reference/focus-room.png')
# Footer top area: x: 80..1300, y: 3340..3550
crop = ref.crop((80, 3340, 1300, 3550))
crop.save('design-reference/compare/ref_footer_top_zoom.png')
print("Saved ref_footer_top_zoom.png")
