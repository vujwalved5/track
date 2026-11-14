from PIL import Image

desk = Image.open('public/welcome/hero-desk.jpg')

# We determined the optimal crop: x=640, y=140, w=1847, h=2450 resized to (656, 870)
# This brings more teal magazine at the left, makes the amber cup smaller at the right,
# and eliminates any pink glow at the left edge!
new_crop = desk.crop((640, 140, 640 + 1847, 140 + 2450)).resize((656, 870), Image.Resampling.LANCZOS)
new_crop.save('public/welcome/hero-desk-crop.jpg', quality=95)
print('Saved updated public/welcome/hero-desk-crop.jpg successfully')
