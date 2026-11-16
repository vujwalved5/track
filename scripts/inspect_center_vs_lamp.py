from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In focus-room.png, let's crop a 200x200 area around (1242, 430) and around the lamp shade!
crop_center = ref.crop((1242 - 100, 430 - 100, 1242 + 100, 430 + 100))
crop_center.save('design-reference/compare/crop_circle_center.png')

# Now let's crop the lamp itself. Where is the lamp shade?
# In focus-desk.jpg, where is the lamp shade?
# Let's inspect where the lamp shade is in ref:
# Let's crop x in [950, 1250], y in [250, 550]
crop_lamp_area = ref.crop((950, 250, 1250, 550))
crop_lamp_area.save('design-reference/compare/crop_lamp_area.png')

print("Saved crop_circle_center.png and crop_lamp_area.png")
