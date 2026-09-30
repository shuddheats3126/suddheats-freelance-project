#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Crop product images to fit packaging/product focus
Converts landscape images to portrait (3:4) and square (1:1) for better display
"""

import os
from PIL import Image
import glob
import sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def crop_to_product_focus(input_path, output_width=600):
    """
    Crop image to focus on product, convert to portrait ratio
    """
    try:
        img = Image.open(input_path)
        filename = os.path.basename(input_path)

        # Convert to RGB if needed
        if img.mode != 'RGB':
            if img.mode == 'RGBA':
                rgb = Image.new('RGB', img.size, (255, 255, 255))
                rgb.paste(img, mask=img.split()[3])
                img = rgb
            else:
                img = img.convert('RGB')

        width, height = img.size
        print("[CROP] {}".format(filename))
        print("  Original: {}x{}".format(width, height))

        # For landscape images, crop to portrait (3:4 ratio)
        # Focus on center of image (where product is)
        if width > height:
            # Landscape - crop width
            target_width = int(height * 0.75)  # 3:4 ratio
            crop_left = (width - target_width) // 2
            crop_right = crop_left + target_width
            img = img.crop((crop_left, 0, crop_right, height))

        # Resize to consistent size
        img.thumbnail((output_width, int(output_width * 1.33)), Image.Resampling.LANCZOS)

        # Save optimized
        img.save(input_path, 'JPEG', quality=90, optimize=True)

        final_size = os.path.getsize(input_path)
        print("  Result: {}x{} ({:.0f}KB)".format(img.size[0], img.size[1], final_size/1024))

    except Exception as e:
        print("[ERROR] {}: {}".format(filename, e))

products_dir = r'C:\Users\RANJIT PATRA\Downloads\New folder\naya 2.0\freelance-project-main\frontend\public\images\products'

print("=" * 60)
print("Cropping Product Images for Better Display")
print("=" * 60)

images = sorted(glob.glob(os.path.join(products_dir, '*.jpeg')))

for img_path in images:
    crop_to_product_focus(img_path)

print("=" * 60)
print("Done! Images cropped and optimized for product display.")

