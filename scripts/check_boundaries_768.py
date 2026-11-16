from PIL import Image

def find_boundaries(img_path):
    im = Image.open(img_path)
    # Check transitions along x=50
    transitions = []
    prev_color = None
    for y in range(0, im.height):
        c = im.getpixel((50, y))[:3]
        if prev_color is None:
            prev_color = c
            transitions.append((0, c))
        elif abs(c[0] - prev_color[0]) > 40 or abs(c[1] - prev_color[1]) > 40 or abs(c[2] - prev_color[2]) > 40:
            transitions.append((y, c))
            prev_color = c
    return transitions

print("Baseline transitions:")
for t in find_boundaries('design-reference/baseline/home-768.png'):
    print(t)

print("\nCurrent transitions:")
for t in find_boundaries('scripts/output/home-768.png'):
    print(t)
