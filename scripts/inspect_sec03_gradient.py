from PIL import Image

ref_sec03 = Image.open('design-reference/compare/ref_sec03.png')
w, h = ref_sec03.size
print(f"Sec03 crop size: {w}x{h}")

# In ref_sec03, let's sample the background color across the section from left (x=50) to right (x=1300)
# at a few rows (e.g. y=100, y=250, y=400):
# Avoid stars, orbit lines, text, paper note
for x in [50, 200, 400, 600, 800, 1000, 1200, 1300]:
    # sample around y=200 where there is background
    r, g, b = ref_sec03.getpixel((x, 200))[:3]
    print(f"x={x}: rgb=({r}, {g}, {b})  hex=#{r:02x}{g:02x}{b:02x}")

# Let's also sample a 2D grid to see if it's a radial glow or linear gradient:
print("\nSampling across x at y=100, 250, 400:")
for y in [100, 250, 400]:
    row = []
    for x in range(100, 1350, 150):
        r, g, b = ref_sec03.getpixel((x, y))[:3]
        row.append(f"#{r:02x}{g:02x}{b:02x}")
    print(f"y={y}: " + " ".join(row))

# Let's also check our current site's FocusReflection.tsx:
# Currently:
# <section className="relative overflow-hidden bg-gradient-to-r from-[#172536] via-[#1a2d42] to-[#2e4760] ...>
