from PIL import Image

fn = Image.open('design-reference/crops/ref_field_note_raw.png')
# fn is cropped from (750, 420, 1150, 850)
w, h = fn.size

# Search for the title 'Begin where you are.'
# In home.png, title is in Instrument Serif or Fraunces
# Let's find dark text inside the paper note
# Paper note is roughly in x: 30..350, y: 30..380 rel to fn
for y in range(40, h, 10):
    dark_in_row = [x for x in range(30, 350) if fn.getpixel((x, y))[0] < 60 and fn.getpixel((x, y))[1] < 60]
    if dark_in_row:
        print(f'rel y={y} (page y={420+y}): min_x={min(dark_in_row)+750}, max_x={max(dark_in_row)+750}')
