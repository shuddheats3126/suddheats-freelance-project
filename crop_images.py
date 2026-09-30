#!/usr/bin/env python3
"""
Image processing script to crop and optimize product images for the product cards.
Fits images to 500x500px product boxes with center crop.
"""

import os
from PIL import Image

def crop_and_resize_image(input_path, output_path, size=(500, 500)):
    """
    Crop image to square and resize to target size
    """
    try:
        img = Image.open(input_path)
        print(f"Processing: {input_path}")
        print(f"  Original size: {img.size}")

        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
            img = rgb_img

        # Get dimensions
        width, height = img.size

        # Crop to square (center crop)
        if width > height:
            left = (width - height) / 2
            img = img.crop((left, 0, left + height, height))
        else:
            top = (height - width) / 2
            img = img.crop((0, top, width, top + width))

        # Resize to target size
        img = img.resize(size, Image.Resampling.LANCZOS)

        # Save as PNG
        img.save(output_path, 'PNG', quality=95)
        print(f"  ✅ Saved: {output_path}")
        print(f"  Final size: {img.size}\n")

    except Exception as e:
        print(f"  ❌ Error: {e}\n")

# Source and destination paths
base_dir = os.path.dirname(os.path.abspath(__file__))
temp_dir = os.path.join(base_dir, 'temp_images')
output_dir = os.path.join(base_dir, 'frontend', 'public', 'images', 'products')

# Create output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Define image mappings
images = [
    ('ragi-chips.jpg', 'ragi-chips.png'),
    ('broccoli-chips.jpg', 'broccoli-chips.png'),
    ('beetroot-chips.jpg', 'beetroot-chips.png'),
]

print("🖼️  Crop & Resize Product Images")
print("=" * 50)

# Process each image
for input_name, output_name in images:
    input_path = os.path.join(temp_dir, input_name)
    output_path = os.path.join(output_dir, output_name)

    if os.path.exists(input_path):
        crop_and_resize_image(input_path, output_path)
    else:
        print(f"⚠️  Not found: {input_path}")
        print(f"   Please save your image here\n")

print("=" * 50)
print("✅ Image processing complete!")

