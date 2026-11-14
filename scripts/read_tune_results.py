from PIL import Image

# Let's inspect tune_headline_screenshot.png to find the text printed at the bottom in #output
im = Image.open('design-reference/compare/tune_headline_screenshot.png')
print('Screenshot size:', im.size)

# Let's write a small script that evaluates the JS in Chrome directly or outputs to file via file write
