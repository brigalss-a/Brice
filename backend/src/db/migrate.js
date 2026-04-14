const fs = require('fs/promises');
const path = require('path');
const { Pool } = require('pg');
const env = require('../config/env');

async function main() {
  const pool = new Pool({ connectionString: env.databaseUrl });
  await pool.query('create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())');
  const dir = path.join(__dirname, 'migrations');
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const existing = await pool.query('select 1 from schema_migrations where id = $1', [file]);
    if (existing.rowCount > 0) continue;
    const sql = await fs.readFile(path.join(dir, file), 'utf8');
    await pool.query('begin');
    try {
      await pool.query(sql);
      await pool.query('insert into schema_migrations (id) values ($1)', [file]);
      await pool.query('commit');
      console.log('applied', file);
    } catch (error) {
      await pool.query('rollback');
      throw error;
    }
  }
  await pool.end();
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
