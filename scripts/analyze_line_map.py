from PIL import Image

lm = Image.open('design-reference/compare/line_map.png')
w, h = lm.size

# Let's see what curves or circles are in line_map:
# Let's count white pixels in vertical slices and horizontal slices:
v_proj = [0]*w
h_proj = [0]*h
for y in range(h):
    for x in range(w):
        if lm.getpixel((x, y))[0] > 128:
            v_proj[x] += 1
            h_proj[y] += 1

print("Top 10 x columns with most line pixels:")
top_x = sorted(enumerate(v_proj), key=lambda x: x[1], reverse=True)[:10]
for x, c in top_x:
    print(f"x={x}: count={c}")

print("Top 10 y rows with most line pixels:")
top_y = sorted(enumerate(h_proj), key=lambda x: x[1], reverse=True)[:10]
for y, c in top_y:
    print(f"y={y}: count={c}")
