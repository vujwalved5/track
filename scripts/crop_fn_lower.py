from PIL import Image

fn = Image.open('design-reference/crops/ref_field_note_raw.png')
# Lower half of field note
# fn is (400, 430)
lower_fn = fn.crop((30, 200, 360, 420))
lower_fn.save('design-reference/crops/ref_fn_lower.png')
print('Saved ref_fn_lower.png')
