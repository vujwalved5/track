from PIL import Image

ref = Image.open('design-reference/focus-room.png')
hero_ref = ref.crop((780, 91, 1366, 953))

# Let's save hero_ref directly to compare/ref_hero_photo_full.png if not already
hero_ref.save('design-reference/compare/ref_hero_photo_full.png')

# Let's check: in hero_ref, are there circles?
# Let's inspect the SVG overlay lines in focus-room.png!
# What circles are visible?
# Let's find any circle or arc in hero_ref by looking at circles around (rel_x, rel_y)
# Let's test centers (rel_x in [250..450], rel_y in [50..450]):
# But wait, what if we just visually inspect or draw crops across hero_ref?
# Let's crop hero_ref into 4 quadrants and save them:
hero_ref.crop((0, 0, 300, 450)).save('design-reference/compare/ref_q1_topleft.png')
hero_ref.crop((300, 0, 586, 450)).save('design-reference/compare/ref_q2_topright.png')
hero_ref.crop((0, 450, 300, 862)).save('design-reference/compare/ref_q3_botleft.png')
hero_ref.crop((300, 450, 586, 862)).save('design-reference/compare/ref_q4_botright.png')

print("Saved 4 quadrants of ref hero photo")
