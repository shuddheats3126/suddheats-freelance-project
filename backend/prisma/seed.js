const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockProducts = [
  {
    "name": "Himalayan Salt Makhana",
    "slug": "himalayan-salt-makhana",
    "description": "Lightly roasted makhanas seasoned with premium Himalayan pink salt for a clean and healthy snack.",
    "shortDescription": "Lightly roasted makhanas seasoned with premium Himalayan pink salt.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.25_PM.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.25_PM.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267290/WhatsApp_Image_2026-09-24_at_3.00.21_PM_1.jpg"
    ],
    "stock": 150,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Himalayan Pink Salt",
      "Cold Pressed Coconut Oil"
    ],
    "nutritionFacts": {
      "calories": 352,
      "protein": 9.6,
      "carbs": 76.4,
      "fat": 0.6,
      "fiber": 14.3
    },
    "tags": [
      "makhana",
      "healthy",
      "low-fat",
      "himalayan-salt"
    ],
    "isFeatured": true,
    "isBestSeller": true,
    "ratings": 4.8,
    "numReviews": 124
  },
  {
    "name": "Crunchy Pepper Makhana",
    "slug": "crunchy-pepper-makhana",
    "description": "Crunchy roasted makhanas seasoned with bold black pepper for a spicy, flavorful snack.",
    "shortDescription": "Crunchy roasted makhanas seasoned with bold black pepper.",
    "price": 249,
    "originalPrice": 299,
    "category": "Flavoured Makhanas",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267302/WhatsApp_Image_2026-09-24_at_3.00.22_PM_1.jpg"
    ],
    "stock": 120,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Black Pepper Seasoning",
      "Sunflower Oil",
      "Salt"
    ],
    "nutritionFacts": {
      "calories": 435,
      "protein": 8.3,
      "carbs": 62.4,
      "fat": 11.8,
      "fiber": 12.1
    },
    "tags": [
      "makhana",
      "spicy",
      "pepper",
      "crunchy-pepper"
    ],
    "isFeatured": false,
    "isBestSeller": false,
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
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267303/WhatsApp_Image_2026-09-24_at_3.00.23_PM_1.jpg"
    ],
    "stock": 100,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Pudina (Mint) Seasoning",
      "Salt",
      "Cold Pressed Oil"
    ],
    "nutritionFacts": {
      "calories": 439,
      "protein": 8.4,
      "carbs": 63.1,
      "fat": 12.2,
      "fiber": 12.3
    },
    "tags": [
      "makhana",
      "pudina",
      "mint"
    ],
    "isFeatured": false,
    "isBestSeller": false,
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
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.26_PM.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.26_PM.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1791550430/peri_peri_nutritional.jpg"
    ],
    "stock": 110,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Peri Peri Seasoning",
      "Salt",
      "Sunflower Oil"
    ],
    "nutritionFacts": {
      "calories": 443,
      "protein": 8.2,
      "carbs": 64.5,
      "fat": 12.4,
      "fiber": 11.5
    },
    "tags": [
      "makhana",
      "peri-peri",
      "savory"
    ],
    "isFeatured": false,
    "isBestSeller": true,
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
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267197/WhatsApp_Image_2026-09-21_at_2.23.28_PM_1.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267197/WhatsApp_Image_2026-09-21_at_2.23.28_PM_1.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267302/WhatsApp_Image_2026-09-24_at_3.00.22_PM.jpg"
    ],
    "stock": 95,
    "weight": "100g",
    "ingredients": [
      "Fox Nuts (Makhana)",
      "Cream and Onion Flavoring",
      "Salt",
      "Sunflower Oil"
    ],
    "nutritionFacts": {
      "calories": 475,
      "protein": 8.5,
      "carbs": 63.7,
      "fat": 12.8,
      "fiber": 11.6
    },
    "tags": [
      "makhana",
      "cream-onion",
      "premium"
    ],
    "isFeatured": false,
    "isBestSeller": false,
    "ratings": 4.6,
    "numReviews": 75
  },
  {
    "name": "Beetroot Chips",
    "slug": "beetroot-chips",
    "description": "Crispy air-fried beetroot chips with just the right amount of salt. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    "shortDescription": "Air fried beetroot chips with minimal oil.",
    "price": 179,
    "originalPrice": 199,
    "category": "Air Fried Chips",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267216/WhatsApp_Image_2026-09-21_at_2.51.41_PM.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267216/WhatsApp_Image_2026-09-21_at_2.51.41_PM.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267289/WhatsApp_Image_2026-09-24_at_3.00.20_PM_2.jpg"
    ],
    "stock": 145,
    "weight": "120g",
    "ingredients": [
      "Beetroot",
      "Salt",
      "Sunflower Oil (minimal)"
    ],
    "nutritionFacts": {
      "calories": 420,
      "protein": 11.0,
      "carbs": 73.1,
      "fat": 9.3,
      "fiber": 1.64
    },
    "tags": [
      "chips",
      "beetroot",
      "air-fried",
      "healthy",
      "low-fat"
    ],
    "isFeatured": true,
    "isBestSeller": true,
    "ratings": 4.7,
    "numReviews": 112
  },
  {
    "name": "Broccoli Chips",
    "slug": "broccoli-chips",
    "description": "Flavorful broccoli air-fried chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    "shortDescription": "Broccoli air-fried chips with minimal oil.",
    "price": 199,
    "originalPrice": 229,
    "category": "Air Fried Chips",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320176/broc_chips_front.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320176/broc_chips_front.jpg"
    ],
    "stock": 135,
    "weight": "120g",
    "ingredients": [
      "Broccoli",
      "Spices",
      "Salt",
      "Sunflower Oil (minimal)"
    ],
    "nutritionFacts": {
      "calories": 140,
      "protein": 2.3,
      "carbs": 28.5,
      "fat": 2.2,
      "fiber": 2.4
    },
    "tags": [
      "chips",
      "broccoli",
      "air-fried",
      "healthy",
      "low-fat"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.8,
    "numReviews": 98
  },
  {
    "name": "Ragi Chips",
    "slug": "ragi-chips",
    "description": "Perfectly salted and crispy air-fried ragi chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.",
    "shortDescription": "Salted air-fried ragi chips with minimal oil.",
    "price": 179,
    "originalPrice": 199,
    "category": "Air Fried Chips",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267289/WhatsApp_Image_2026-09-24_at_3.00.20_PM.jpg"
    ],
    "stock": 125,
    "weight": "120g",
    "ingredients": [
      "Ragi",
      "Sea Salt",
      "Sunflower Oil (minimal)"
    ],
    "nutritionFacts": {
      "calories": 434,
      "protein": 10.35,
      "carbs": 73.0,
      "fat": 11.0,
      "fiber": 4.5
    },
    "tags": [
      "chips",
      "ragi",
      "air-fried",
      "healthy",
      "low-fat"
    ],
    "isFeatured": false,
    "isBestSeller": false,
    "ratings": 4.6,
    "numReviews": 87
  },
  {
    "name": "Honey & Oats Cookies",
    "slug": "honey-oats-cookies",
    "description": "Delicious and nutritious honey and oats cookies with absolutely no added sugar or palm oil.",
    "shortDescription": "Nutritious honey oats cookies, zero sugar, no palm oil.",
    "price": 199,
    "originalPrice": 249,
    "category": "No Sugar No Palm Oil Millet Cookies",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319726/millet_honey_front.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319726/millet_honey_front.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267289/WhatsApp_Image_2026-09-24_at_3.00.20_PM_1.jpg"
    ],
    "stock": 120,
    "weight": "120g",
    "ingredients": [
      "Oats",
      "Honey",
      "Coconut Oil",
      "Sea Salt",
      "Baking Powder"
    ],
    "nutritionFacts": {
      "calories": 530,
      "protein": 5.7,
      "carbs": 62.4,
      "fat": 28.7,
      "fiber": 9.1
    },
    "tags": [
      "cookies",
      "oats",
      "honey",
      "no-sugar",
      "no-palm-oil",
      "healthy"
    ],
    "isFeatured": true,
    "isBestSeller": true,
    "ratings": 4.9,
    "numReviews": 134
  },
  {
    "name": "Jowar & Nuts Cookies",
    "slug": "jowar-nuts-cookies",
    "description": "Delicious and nutritious jowar and nuts cookies with absolutely no added sugar or palm oil.",
    "shortDescription": "Nutritious jowar and nuts cookies, zero sugar, no palm oil.",
    "price": 199,
    "originalPrice": 249,
    "category": "No Sugar No Palm Oil Millet Cookies",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320106/jowar_front.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320106/jowar_front.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267288/WhatsApp_Image_2026-09-24_at_3.00.19_PM.jpg"
    ],
    "stock": 115,
    "weight": "120g",
    "ingredients": [
      "Jowar Flour",
      "Nuts",
      "Natural Sweetener (Stevia)",
      "Coconut Oil",
      "Sea Salt",
      "Baking Powder"
    ],
    "nutritionFacts": {
      "calories": 519.6,
      "protein": 5.97,
      "carbs": 64.62,
      "fat": 26.36,
      "fiber": 9.65
    },
    "tags": [
      "cookies",
      "jowar",
      "nuts",
      "no-sugar",
      "no-palm-oil",
      "healthy"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.8,
    "numReviews": 110
  },
  {
    "name": "Ragi & Elaichi Cookies",
    "slug": "ragi-elaichi-cookies",
    "description": "Delicious and nutritious ragi and elaichi cookies with absolutely no added sugar or palm oil.",
    "shortDescription": "Nutritious ragi and elaichi cookies, zero sugar, no palm oil.",
    "price": 199,
    "originalPrice": 249,
    "category": "No Sugar No Palm Oil Millet Cookies",
    "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319848/raji_image_front.jpg",
    "images": [
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319848/raji_image_front.jpg",
      "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267287/WhatsApp_Image_2026-09-24_at_3.00.18_PM.jpg"
    ],
    "stock": 125,
    "weight": "120g",
    "ingredients": [
      "Ragi Flour",
      "Elaichi",
      "Natural Sweetener (Stevia)",
      "Coconut Oil",
      "Sea Salt",
      "Baking Powder"
    ],
    "nutritionFacts": {
      "calories": 503.4,
      "protein": 4.96,
      "carbs": 69.0,
      "fat": 23.0,
      "fiber": 9.5
    },
    "tags": [
      "cookies",
      "ragi",
      "elaichi",
      "no-sugar",
      "no-palm-oil",
      "healthy"
    ],
    "isFeatured": false,
    "isBestSeller": true,
    "ratings": 4.7,
    "numReviews": 98
  }
];

async function main() {
  console.log('Seeding database with mock products...');
  for (const product of mockProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
    console.log(`Created/Updated product: ${product.name}`);
  }

  console.log('Checking for admin user...');
  const bcrypt = require("bcryptjs");
  const adminEmail = "admin@shuddheats.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        is2FAEnabled: false,
      },
    });
    console.log("✅ Admin user created");
  } else {
    // Ensure existing admin has the correct role
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      });
      console.log("✅ Admin user role updated to ADMIN");
    } else {
      console.log("ℹ️ Admin already exists and has correct role");
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

