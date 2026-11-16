from PIL import Image

crop = Image.open('design-reference/compare/ref_radar_tight_measured.png')
# Let's inspect the ink color of the radar chart lines in ref:
ink_colors = []
for y in range(crop.height):
    for x in range(crop.width):
        r, g, b = crop.getpixel((x, y))[:3]
        if sum((r, g, b))/3 < 120:
            ink_colors.append((r, g, b))

print(f"Sampled {len(ink_colors)} ink pixels:")
r_avg = sum(c[0] for c in ink_colors)/len(ink_colors)
g_avg = sum(c[1] for c in ink_colors)/len(ink_colors)
b_avg = sum(c[2] for c in ink_colors)/len(ink_colors)
print(f"Average ink RGB: ({r_avg:.1f}, {g_avg:.1f}, {b_avg:.1f})")
# What hex is this close to?
# (96, 67, 47) is #60432F
# (23, 37, 54) is #172536
print(f"Hex equivalent: #{int(r_avg):02x}{int(g_avg):02x}{int(b_avg):02x}")
