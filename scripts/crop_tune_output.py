from PIL import Image

im = Image.open('design-reference/compare/tune_headline_screenshot.png')
# Output is at the bottom right or below the tests
# Let's crop x: 700..1366, y: 0..800
crop_out = im.crop((700, 0, 1366, 800))
crop_out.save('design-reference/crops/tune_output_crop.png')
print('Saved tune_output_crop.png')
