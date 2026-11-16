from PIL import Image, ImageChops

def compare_images(base_path, test_path, name):
    im_base = Image.open(base_path).convert('RGB')
    im_test = Image.open(test_path).convert('RGB')
    print(f"\n--- Comparing {name} ---")
    print(f"Base size: {im_base.size}, Test size: {im_test.size}")
    
    w = min(im_base.width, im_test.width)
    h = min(im_base.height, im_test.height)
    
    crop_base = im_base.crop((0, 0, w, h))
    crop_test = im_test.crop((0, 0, w, h))
    
    diff = ImageChops.difference(crop_base, crop_test)
    bbox = diff.getbbox()
    if not bbox:
        print("Images are pixel-identical!")
    else:
        print(f"Difference bounding box: {bbox}")
        # Count non-zero diff pixels
        hist = diff.histogram()
        r_zeros = hist[0]
        g_zeros = hist[256]
        b_zeros = hist[512]
        exact_match_pixels = min(r_zeros, g_zeros, b_zeros)
        total = w * h
        diff_count = total - exact_match_pixels
        print(f"Diff pixel count: {diff_count} / {total} ({(diff_count/total)*100:.3f}%)")

compare_images('design-reference/baseline/home-1366.png', 'scripts/output/home-1366.png', 'Home 1366')
compare_images('design-reference/baseline/home-768.png', 'scripts/output/home-768.png', 'Home 768')
compare_images('design-reference/baseline/home-390.png', 'scripts/output/home-390.png', 'Home 390')
