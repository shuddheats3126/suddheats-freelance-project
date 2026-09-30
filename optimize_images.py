#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Optimize product images for web - compress and resize for better performance
"""

import os
from PIL import Image
import glob
import sys

# Fix encoding on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def optimize_image(input_path, max_width=800, quality=85):
    """Optimize image: resize and compress"""
    try:
        img = Image.open(input_path)
        filename = os.path.basename(input_path)

        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
            img = rgb_img
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        original_size = os.path.getsize(input_path)
        width, height = img.size

        # Resize if too large
        if width > max_width:
            ratio = max_width / width
            new_height = int(height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # Save optimized version
        img.save(input_path, 'JPEG', quality=quality, optimize=True)
        final_size = os.path.getsize(input_path)

        print("[OK] {}".format(filename))
        print("     {}x{} -> {}x{}".format(width, height, img.size[0], img.size[1]))
        print("     {:.1f}KB -> {:.1f}KB".format(original_size/1024, final_size/1024))

    except Exception as e:
        print("[ERROR] {}: {}".format(input_path, e))

# Get all JPEG images in products folder
products_dir = r'C:\Users\RANJIT PATRA\Downloads\New folder\naya 2.0\freelance-project-main\frontend\public\images\products'

print("Optimizing Product Images")
print("=" * 60)

images = glob.glob(os.path.join(products_dir, '*.jpeg'))

for image_path in sorted(images):
    optimize_image(image_path)

print("=" * 60)
print("Done! All images optimized.")

