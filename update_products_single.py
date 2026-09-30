import json
import re

products = [
    # --- Flavoured Makhanas ---
    {
        "name": "Himalayan Salt Makhana",
        "slug": "himalayan-salt-makhana",
        "description": "Light, airy fox nuts air-popped and seasoned with pure Himalayan pink salt. High in protein, low in fat, and completely guilt-free. Perfect for evening snacking.",
        "shortDescription": "Air-popped fox nuts with Himalayan pink salt.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "/images/products/himalayan-salt-makhana.jpeg",
        "images": ["/images/products/himalayan-salt-makhana.jpeg"],
        "stock": 150,
        "weight": "100g",
        "ingredients": ["Fox Nuts (Makhana)", "Himalayan Pink Salt", "Cold Pressed Coconut Oil"],
        "nutritionFacts": { "calories": 347, "protein": 9.7, "carbs": 76.9, "fat": 0.1, "fiber": 0.5 },
        "tags": ["makhana", "healthy", "low-fat", "himalayan-salt"],
        "isFeatured": True,
        "isBestSeller": True,
        "ratings": 4.8,
        "numReviews": 124
    },
    {
        "name": "Black Pepper & Himalayan Salt Makhana",
        "slug": "black-pepper-makhana",
        "description": "Boldly seasoned with black pepper and Himalayan pink salt. Air-popped, never fried.",
        "shortDescription": "Spicy black pepper flavoured fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "/images/products/black-pepper-makhana.jpeg",
        "images": ["/images/products/black-pepper-makhana.jpeg"],
        "stock": 120,
        "weight": "100g",
        "ingredients": ["Fox Nuts (Makhana)", "Black Pepper Seasoning", "Sunflower Oil", "Salt"],
        "nutritionFacts": { "calories": 355, "protein": 9.5, "carbs": 74.2, "fat": 2.1, "fiber": 0.5 },
        "tags": ["makhana", "spicy", "black-pepper"],
        "isFeatured": False,
        "isBestSeller": False,
        "ratings": 4.6,
        "numReviews": 89
    },
    {
        "name": "Pudina Makhana",
        "slug": "pudina-makhana",
        "description": "Refreshing mint flavored makhana with aromatic pudina seasoning. Light, cooling, and perfect as an afternoon snack.",
        "shortDescription": "Refreshing mint flavored fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "/images/products/pudina-makhana.jpeg",
        "images": ["/images/products/pudina-makhana.jpeg"],
        "stock": 100,
        "weight": "100g",
        "ingredients": ["Fox Nuts (Makhana)", "Pudina (Mint) Seasoning", "Salt", "Cold Pressed Oil"],
        "nutritionFacts": { "calories": 347, "protein": 9.7, "carbs": 76.9, "fat": 0.13, "fiber": 0.5 },
        "tags": ["makhana", "pudina", "mint"],
        "isFeatured": False,
        "isBestSeller": False,
        "ratings": 4.5,
        "numReviews": 65
    },
    {
        "name": "Peri Peri Makhana",
        "slug": "peri-peri-makhana",
        "description": "Spicy and tangy peri peri flavoured makhana. Boldly seasoned with African spices for those who love a kick. Air-popped, never fried.",
        "shortDescription": "Spicy peri peri flavoured fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "/images/products/peri-peri-makhana.jpeg",
        "images": ["/images/products/peri-peri-makhana.jpeg"],
        "stock": 110,
        "weight": "100g",
        "ingredients": ["Fox Nuts (Makhana)", "Peri Peri Seasoning", "Salt", "Sunflower Oil"],
        "nutritionFacts": { "calories": 347, "protein": 10, "carbs": 76.9, "fat": 0.28, "fiber": 0.5 },
        "tags": ["makhana", "peri-peri", "savory"],
        "isFeatured": False,
        "isBestSeller": True,
        "ratings": 4.7,
        "numReviews": 92
    },
    {
        "name": "Cream & Onion Makhana",
        "slug": "cream-onion-makhana",
        "description": "Decadent cream and onion flavor meets light, crispy makhana. A sophisticated snack for those who prefer refined taste.",
        "shortDescription": "Rich cream and onion flavored fox nuts.",
        "price": 249,
        "originalPrice": 299,
        "category": "Flavoured Makhanas",
        "thumbnail": "/images/products/cream-onion-makhana.jpeg",
        "images": ["/images/products/cream-onion-makhana.jpeg"],
        "stock": 95,
        "weight": "100g",
        "ingredients": ["Fox Nuts (Makhana)", "Cream and Onion Flavoring", "Salt", "Sunflower Oil"],
        "nutritionFacts": { "calories": 347, "protein": 9.7, "carbs": 76.9, "fat": 0.23, "fiber": 0.5 },
        "tags": ["makhana", "cream-onion", "premium"],
        "isFeatured": False,
        "isBestSeller": False,
        "ratings": 4.6,
        "numReviews": 75
    },

    # --- Air Fried Chips ---
    {
        "name": "Beetroot Chips",
        "slug": "beetroot-chips",
        "description": "Crispy air-fried beetroot chips with just the right amount of salt. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
        "shortDescription": "Air fried beetroot chips with minimal oil.",
        "price": 129,
        "originalPrice": 169,
        "category": "Air Fried Chips",
        "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267216/WhatsApp_Image_2026-09-21_at_2.51.41_PM.jpg",
        "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267216/WhatsApp_Image_2026-09-21_at_2.51.41_PM.jpg"],
        "stock": 145,
        "weight": "100g",
        "ingredients": ["Beetroot", "Salt", "Sunflower Oil (minimal)"],
        "nutritionFacts": { "calories": 130, "protein": 2.1, "carbs": 27.8, "fat": 2.0, "fiber": 2.2 },
        "tags": ["chips", "beetroot", "air-fried", "healthy", "low-fat"],
        "isFeatured": True,
        "isBestSeller": True,
        "ratings": 4.7,
        "numReviews": 112
    },
    {
        "name": "Broccoli Chips",
        "slug": "broccoli-chips",
        "description": "Flavorful broccoli air-fried chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
        "shortDescription": "Broccoli air-fried chips with minimal oil.",
        "price": 129,
        "originalPrice": 169,
        "category": "Air Fried Chips",
        "thumbnail": "/images/products/broccoli-chips.jpeg",
        "images": ["/images/products/broccoli-chips.jpeg"],
        "stock": 135,
        "weight": "100g",
        "ingredients": ["Broccoli", "Spices", "Salt", "Sunflower Oil (minimal)"],
        "nutritionFacts": { "calories": 140, "protein": 2.3, "carbs": 28.5, "fat": 2.2, "fiber": 2.4 },
        "tags": ["chips", "broccoli", "air-fried", "healthy", "low-fat"],
        "isFeatured": False,
        "isBestSeller": True,
        "ratings": 4.8,
        "numReviews": 98
    },
    {
        "name": "Ragi Chips",
        "slug": "ragi-chips",
        "description": "Perfectly salted and crispy air-fried ragi chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
        "shortDescription": "Salted air-fried ragi chips with minimal oil.",
        "price": 129,
        "originalPrice": 169,
        "category": "Air Fried Chips",
        "thumbnail": "/images/products/ragi-chips.jpeg",
        "images": ["/images/products/ragi-chips.jpeg"],
        "stock": 125,
        "weight": "100g",
        "ingredients": ["Ragi", "Sea Salt", "Sunflower Oil (minimal)"],
        "nutritionFacts": { "calories": 130, "protein": 2.1, "carbs": 27.8, "fat": 2.0, "fiber": 2.2 },
        "tags": ["chips", "ragi", "air-fried", "healthy", "low-fat"],
        "isFeatured": False,
        "isBestSeller": False,
        "ratings": 4.6,
        "numReviews": 87
    },

    # --- No Sugar No Palm Oil Millet Cookies ---
    {
        "name": "Honey & Oats Cookies",
        "slug": "honey-oats-cookies",
        "description": "Delicious and nutritious honey and oats cookies with absolutely no added sugar or palm oil.",
        "shortDescription": "Nutritious honey oats cookies, zero sugar, no palm oil.",
        "price": 149,
        "originalPrice": 199,
        "category": "No Sugar No Palm Oil Millet Cookies",
        "thumbnail": "/images/products/honey-oats-cookies.jpeg",
        "images": ["/images/products/honey-oats-cookies.jpeg"],
        "stock": 120,
        "weight": "100g",
        "ingredients": ["Oats", "Honey", "Coconut Oil", "Sea Salt", "Baking Powder"],
        "nutritionFacts": { "calories": 410, "protein": 8.2, "carbs": 62.3, "fat": 14.5, "fiber": 3.1 },
        "tags": ["cookies", "oats", "honey", "no-sugar", "no-palm-oil", "healthy"],
        "isFeatured": True,
        "isBestSeller": True,
        "ratings": 4.9,
        "numReviews": 134
    },
    {
        "name": "Jowar & Nuts Cookies",
        "slug": "jowar-nuts-cookies",
        "description": "Delicious and nutritious jowar and nuts cookies with absolutely no added sugar or palm oil.",
        "shortDescription": "Nutritious jowar and nuts cookies, zero sugar, no palm oil.",
        "price": 149,
        "originalPrice": 199,
        "category": "No Sugar No Palm Oil Millet Cookies",
        "thumbnail": "/images/products/jowar-nuts-cookies.jpeg",
        "images": ["/images/products/jowar-nuts-cookies.jpeg"],
        "stock": 115,
        "weight": "100g",
        "ingredients": ["Jowar Flour", "Nuts", "Natural Sweetener (Stevia)", "Coconut Oil", "Sea Salt", "Baking Powder"],
        "nutritionFacts": { "calories": 410, "protein": 8.2, "carbs": 62.3, "fat": 14.5, "fiber": 3.1 },
        "tags": ["cookies", "jowar", "nuts", "no-sugar", "no-palm-oil", "healthy"],
        "isFeatured": False,
        "isBestSeller": True,
        "ratings": 4.8,
        "numReviews": 110
    },
    {
        "name": "Ragi & Elaichi Cookies",
        "slug": "ragi-elaichi-cookies",
        "description": "Delicious and nutritious ragi and elaichi cookies with absolutely no added sugar or palm oil.",
        "shortDescription": "Nutritious ragi and elaichi cookies, zero sugar, no palm oil.",
        "price": 149,
        "originalPrice": 199,
        "category": "No Sugar No Palm Oil Millet Cookies",
        "thumbnail": "/images/products/ragi-elaichi-cookies.jpeg",
        "images": ["/images/products/ragi-elaichi-cookies.jpeg"],
        "stock": 125,
        "weight": "100g",
        "ingredients": ["Ragi Flour", "Elaichi", "Natural Sweetener (Stevia)", "Coconut Oil", "Sea Salt", "Baking Powder"],
        "nutritionFacts": { "calories": 410, "protein": 8.2, "carbs": 62.3, "fat": 14.5, "fiber": 3.1 },
        "tags": ["cookies", "ragi", "elaichi", "no-sugar", "no-palm-oil", "healthy"],
        "isFeatured": False,
        "isBestSeller": True,
        "ratings": 4.7,
        "numReviews": 98
    }
]

for i, p in enumerate(products):
    p['_id'] = str(i + 1)

array_str = json.dumps(products, indent=4)
obj_str = "{\n"
for p in products:
    obj_str += f'    "{p["slug"]}": {json.dumps(p)},\n'
obj_str += "}"

# Update backend/seed.js
with open("backend/seed.js", "r", encoding="utf-8") as f:
    content = f.read()
content = re.sub(r'const products = \[.*?\];', f'const products = {array_str};', content, flags=re.DOTALL)
with open("backend/seed.js", "w", encoding="utf-8") as f:
    f.write(content)

# Update frontend/app/shop/page.tsx
with open('frontend/app/shop/page.tsx', 'r', encoding='utf-8') as f:
    shop_content = f.read()
shop_content = re.sub(r'const mockProducts = \[.*?\];', f'const mockProducts = {array_str};', shop_content, flags=re.DOTALL)
with open('frontend/app/shop/page.tsx', 'w', encoding='utf-8') as f:
    f.write(shop_content)

# Update frontend/app/shop/[slug]/page.tsx
with open('frontend/app/shop/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    slug_content = f.read()
slug_content = re.sub(r'const mockProducts: any = \{.*?\};', f'const mockProducts: any = {obj_str};', slug_content, flags=re.DOTALL)
with open('frontend/app/shop/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(slug_content)

# Update frontend/app/page.tsx (mocks and featured products logic)
with open('frontend/app/page.tsx', 'r', encoding='utf-8') as f:
    page_content = f.read()
page_content = re.sub(r'const mock = \[.*?\];', f'const mock = {array_str};', page_content, flags=re.DOTALL)

# Modify setFeatured and setBestsellers
# The user wants "in the featured product sectio only singel product of each cat should display"
# Our 11 items already have exactly 1 isFeatured=True for each category! 
# (Himalayan Salt Makhana, Beetroot Chips, Honey & Oats Cookies)
# We can just use `mock.filter(p => p.isFeatured)` for featured.

# I will replace `setFeatured(mock.slice(0, 3));` with `setFeatured(mock.filter(p => p.isFeatured));`
page_content = re.sub(r'setFeatured\(mock\.slice\(0,\s*3\)\);', r'setFeatured(mock.filter(p => p.isFeatured));', page_content)

with open('frontend/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_content)

print("Updated everything to 11 products.")
