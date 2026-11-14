from PIL import Image

im = Image.open('design-reference/home.png')

# In home.png, field note is around x=750..1150, y=400..850
# Let's crop it generously
fn_crop = im.crop((750, 420, 1150, 850))
fn_crop.save('design-reference/crops/ref_field_note_raw.png')

# Let's inspect washi tape and paper corners
# Field note paper is cream/translucent on top of desk photo
# Let's find the corners and dimensions of the tilted paper note
print('Saved ref_field_note_raw.png')
