from PIL import Image

ref = Image.open('design-reference/focus-room.png')
# Section 02: The Journey
# In FocusTheJourney.tsx:
# Right Card: Sound Study / Preview
# In our FocusTheJourney.tsx:
# <div className="lg:col-span-7 bg-gradient-to-r from-[#1c3230] via-[#1a2c32] to-[#172536] border border-[#F4EFE4]/15 rounded-[2px] p-3 sm:p-4 relative overflow-hidden flex flex-col justify-between h-[359px]">
#   <div className="border border-[#F4EFE4]/12 rounded-[1px] p-6 sm:p-7 h-full flex flex-col justify-between">
#
# Let's crop Section 02 from focus-room.png:
# y around 2100..2800
# Let's find the exact bounds of the right card in ref:
sec02_ref = ref.crop((0, 2200, 1366, 2750))
sec02_ref.save('design-reference/compare/sec02_ref_full.png')
print("Saved sec02_ref_full.png")

# Let's inspect the Ambient focus card in ref:
# It's on the right side: x around 600..1300, y around 2300..2700
ambient_ref = ref.crop((650, 2300, 1300, 2700))
ambient_ref.save('design-reference/compare/ref_ambient_card.png')
print("Saved ref_ambient_card.png")
