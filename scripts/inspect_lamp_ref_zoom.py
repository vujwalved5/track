from PIL import Image

ref = Image.open('design-reference/focus-room.png')
hero_ref = ref.crop((780, 91, 1366, 953))

# Let's save a zoomed-in slice of the lamp in focus-room.png
lamp = hero_ref.crop((200, 100, 500, 500))
lamp.save('design-reference/compare/lamp_ref_zoom.png')

# In FocusHero.tsx:
# There was:
# <div className="absolute inset-0 pointer-events-none opacity-45 z-[6]">
#   <svg viewBox="0 0 574 860" ...>
#     <g transform="rotate(-22 287 430)">
#       <ellipse cx="287" cy="430" rx="220" ry="125" stroke="currentColor" strokeWidth="1" />
#       <ellipse cx="287" cy="430" rx="160" ry="85" stroke="#F4EFE4" strokeWidth="0.8" opacity="0.6" />
#       <circle cx="450" cy="390" r="3" fill="#D2A75D" />
#       <circle cx="150" cy="470" r="2.5" fill="#BD634A" />
#       <circle cx="360" cy="510" r="2" fill="#F4EFE4" />
#     </g>
#   </svg>
# </div>
# But the task says:
# "3. Hero orbit overlay: circles centred on the lamp as in the design, not a large tilted ellipse."
# "Measure the lamp centre from focus-room.png pixels before placing the orbit circles, and show the numbers."

# Let's look at lamp_ref_zoom.png: does the reference have orbit circles?
# Let's check if the reference image has circles around the lamp, and where their center is!
print("Checking pixels in lamp_ref_zoom...")
