from PIL import Image

ref = Image.open('design-reference/focus-room.png')

# In ref, let's look at the photo area: x in [780, 1366], y in [91, 953].
# In FocusHero.tsx:
# Right Column is:
# <div className="w-full lg:w-[586px] lg:shrink-0 relative min-h-[420px] lg:min-h-full border-t lg:border-t-0">
#   <Image src="/welcome/focus-desk.jpg" fill ... />
# ...
#   <svg viewBox="0 0 574 860" ...>
#     <g transform="rotate(-22 287 430)">
#       <ellipse cx="287" cy="430" rx="220" ry="125" ... />
# ...
# Notice in previous implementation of FocusHero.tsx, someone put a tilted ellipse at cx=287, cy=430 (which was the center of the 574x860 box!)
# But the prompt says:
# "3. Hero orbit overlay: circles centred on the lamp as in the design, not a large tilted ellipse."
# "Measure the lamp centre from focus-room.png pixels before placing the orbit circles, and show the numbers."

# Let's inspect where the lamp is in focus-room.png!
# Let's find the lamp in focus-room.png:
# Where is the lamp head/hood/neck/bulb in focus-room.png?
# Let's write a script to find all edges or save a color representation of the desk photo in focus-room.png.
