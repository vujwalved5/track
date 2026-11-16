from PIL import Image

ref_amb = Image.open('design-reference/compare/ref_ambient_card.png')
w, h = ref_amb.size

# Let's inspect the borders:
# In our site's FocusTheJourney.tsx, there is:
# an outer div with `p-3 sm:p-4`, and then an inner div with `border border-[#F4EFE4]/12`!
# So on our site there was a double border (outer border and an inner white border 12-16px inside)!
# In the design reference ref_ambient_card.png:
# Is there an inner border inside the card?
# Let's check!
print("Ref ambient card size:", ref_amb.size)
