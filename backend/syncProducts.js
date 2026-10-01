const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const requiredProducts = [
  { name: 'Broccoli Chips', price: 179, originalPrice: 199, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/broccoli-chips.jpg' },
  { name: 'Ragi Chips – Himalayan Flavour', price: 149, originalPrice: 179, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563588/shuddheats/products/ragi-chips.jpg' },
  { name: 'Crunchy Pepper Makhana', price: 249, originalPrice: 299, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg' },
  { name: 'Himalayan Salt Makhana', price: 249, originalPrice: 299, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.25_PM.jpg' },
  { name: 'Ragi & Elaichi Cookies', price: 169, originalPrice: 199, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563570/shuddheats/assets/ragi-cookies.jpg' },
  { name: 'Jowar & Nuts Cookies', price: 169, originalPrice: 199, image: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563568/shuddheats/assets/jowar-cookies.jpg' }
];

async function run() {
  for (const p of requiredProducts) {
    // Generate slug
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if exists
    let existing = await prisma.product.findFirst({
      where: {
        OR: [
          { name: p.name },
          { slug: slug },
        ]
      }
    });
    
    if (existing) {
      console.log(`Updating existing: ${p.name}`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          isFeatured: true,
          isBestSeller: true,
          stock: existing.stock > 0 ? existing.stock : 100,
          name: p.name, // Ensure exact name match
          slug: slug
        }
      });
    } else {
      console.log(`Creating new: ${p.name}`);
      await prisma.product.create({
        data: {
          name: p.name,
          slug: slug,
          description: `Delicious and healthy ${p.name}`,
          price: p.price,
          category: p.name.includes('Makhana') ? 'Makhana' : p.name.includes('Chips') ? 'Chips' : 'Cookies',
          images: JSON.stringify([p.image]),
          thumbnail: p.image,
          stock: 100,
          isFeatured: true,
          isBestSeller: true,
          ratings: 5,
          numReviews: 1
        }
      });
    }
  }
  console.log('Done syncing products');
}

run().catch(console.error).finally(() => prisma.$disconnect());

