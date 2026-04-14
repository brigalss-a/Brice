// Migration runner for BRICE Sentinel
// Usage: node scripts/migrate.js

const { init, query } = require('../backend/src/storage/postgres');
const fs = require('fs');
const path = require('path');


async function main() {
  await init();
  const sql = fs.readFileSync(path.join(__dirname, '../backend/src/db/migrations/001_init.sql'), 'utf8');
  try {
    await query(sql);
    console.log('Migration applied.');
  } catch (e) {
    if (e.message && e.message.includes('already exists')) {
      console.log('Migration already applied.');
    } else {
      throw e;
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
