from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# Let's inspect the letters in ref around y=538..554:
# Height of capital letter or x-height:
# Let's find cap height of 'O' in 'One' (at x=110)
crop_letter = ref.crop((108, 535, 150, 560))
crop_letter.save('design-reference/compare/letter_O_ref.png')
print("Saved letter_O_ref.png")

# Line 1 in ref: y from 538 to 554 (height = 16px!)
# Line 2 in ref: y from 567 to 583 (height = 16px!)
# Gap between lines: 567 - 538 = 29px (line-height ~28px)
# Cap height: y=538 to y=550 is 12px, ascender/descender to 554 is 16px!
# That corresponds to a 16px font (text-base), NOT text-lg (18px)!
# In FocusHero.tsx:
# Currently: className="font-public-sans text-base sm:text-lg text-[#F4EFE4]/80 max-w-[415px] leading-relaxed mt-[8px]"
# Notice on desktop (sm: or lg:) it became `text-lg` (18px)!
# But in text-base (16px), what is the width of "One focused session at a time. Make space for deep"?
