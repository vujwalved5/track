from PIL import Image

im = Image.open('design-reference/home.png')

# Field note title 'Begin where you are.'
# In home.png, it sits around x=810..980, y=600..710
title_crop = im.crop((810, 600, 990, 715))
title_crop.save('design-reference/crops/ref_fn_title_crop.png')
print('Saved ref_fn_title_crop.png')
