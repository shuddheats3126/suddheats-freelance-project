#!/usr/bin/env python3
"""
Crop product images to square format, zoomed in on product
"""
from PIL import Image
import os
import glob

products_dir = r'C:\Users\RANJIT PATRA\Downloads\New folder\naya 2.0\freelance-project-main\frontend\public\images\products'

print("=" * 60)
print("Cropping Product Images - Zoomed Format")
print("=" * 60)

for img_path in sorted(glob.glob(os.path.join(products_dir, '*.jpeg'))):
    try:
        img = Image.open(img_path)
        filename = os.path.basename(img_path)

        # Convert RGBA to RGB
        if img.mode in ('RGBA', 'LA', 'P'):
            bg = Image.new('RGB', img.size, (240, 244, 237))  # ShuddhEats light green
            if img.mode == 'P':
                img = img.convert('RGBA')
            bg.paste(img, mask=img.split()[3] if img.mode == 'RGBA' else None)
            img = bg

        w, h = img.size
        print(f"\n[{filename}]")
        print(f"  Original: {w}x{h}")

        # Crop to square from center
        size = min(w, h)
        left = (w - size) // 2
        top = (h - size) // 2
        img_cropped = img.crop((left, top, left + size, top + size))

        # Resize to 800x800 for detail page
        img_cropped = img_cropped.resize((800, 800), Image.Resampling.LANCZOS)

        # Save
        img_cropped.save(img_path, 'JPEG', quality=95, optimize=True)
        file_size = os.path.getsize(img_path) / 1024

        print(f"  Cropped: 800x800")
        print(f"  Size: {file_size:.0f}KB ✓")

    except Exception as e:
        print(f"  ERROR: {e}")

print("\n" + "=" * 60)
print("Done! All product images cropped and optimized.")
print("=" * 60)

