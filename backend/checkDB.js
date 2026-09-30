const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:SkRXBWUaBAlOTNZznyeZpGVqBuiCpPMM@hayabusa.proxy.rlwy.net:43543/railway' });
async function checkDB() {
  try {
    await client.connect();
    const result = await client.query('SELECT thumbnail FROM "products" WHERE slug = \'ragi-chips\'');
    console.log('Thumbnail:', result.rows[0].thumbnail);
  } finally {
    await client.end();
  }
}
checkDB();
