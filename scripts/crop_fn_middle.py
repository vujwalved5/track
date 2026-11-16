from PIL import Image

fn = Image.open('design-reference/compare/ref_field_note_full.png')
# fn is 391 x 813.
# The radar chart is between the 3 checklist items and the breathing guide:
# In fn, let's crop y from 250 to 600:
middle = fn.crop((20, 260, 370, 600))
middle.save('design-reference/compare/ref_field_note_middle.png')
print("Saved ref_field_note_middle.png (350 x 340)")
