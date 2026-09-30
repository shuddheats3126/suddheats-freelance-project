from PIL import Image

src_path = r'C:\Users\RANJIT PATRA\.gemini\antigravity\brain\77518360-9aa3-4ec5-ac4e-e1753d622d13\media__1779482424834.png'
dest_path = r'c:\Users\RANJIT PATRA\OneDrive\Pictures\slides\freelance\SudhhEats-main\frontend\public\images\logo.png'

img = Image.open(src_path).convert("RGBA")
width, height = img.size

# Find bounding box of non-white pixels
min_x, min_y = width, height
max_x, max_y = 0, 0

pixels = img.load()
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # Not white
        if not (r > 245 and g > 245 and b > 245):
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

print(f"Non-white bounding box: x from {min_x} to {max_x}, y from {min_y} to {max_y}")

# Padding
padding = 15
crop_x1 = max(0, min_x - padding)
crop_y1 = max(0, min_y - padding)
crop_x2 = min(width, max_x + padding)
crop_y2 = min(height, max_y + padding)

cropped_img = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
cropped_width, cropped_height = cropped_img.size
print(f"Cropped dimensions: {cropped_width}x{cropped_height}")

# Transparency
new_data = []
for item in cropped_img.getdata():
    r, g, b, a = item
    if r > 245 and g > 245 and b > 245:
        new_data.append((255, 255, 255, 0))
    else:
        rgb_sum = r + g + b
        if rgb_sum > 700:
            alpha = int((765 - rgb_sum) / (765 - 700) * 255)
            alpha = max(0, min(255, alpha))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))

cropped_img.putdata(new_data)
cropped_img.save(dest_path, "PNG")
print("New logo saved successfully.")

