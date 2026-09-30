const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:SkRXBWUaBAlOTNZznyeZpGVqBuiCpPMM@hayabusa.proxy.rlwy.net:43543/railway' });
async function updateDB() {
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected! Executing query...');
    const result = await client.query('UPDATE "products" SET thumbnail = $1, images = $2 WHERE slug = \'cream-onion-makhana\'', [
      'https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267197/WhatsApp_Image_2026-09-21_at_2.23.28_PM_1.jpg',
      JSON.stringify(['https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267197/WhatsApp_Image_2026-09-21_at_2.23.28_PM_1.jpg'])
    ]);
    console.log('Update result:', result.rowCount);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}
updateDB();

