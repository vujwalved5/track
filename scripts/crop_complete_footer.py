from PIL import Image

ref = Image.open('design-reference/focus-room.png')
# Footer starts at y=3340
footer = ref.crop((0, 3340, 1366, 3727))
footer.save('design-reference/compare/ref_footer_complete.png')
print("Saved ref_footer_complete.png (1366 x 387)")
