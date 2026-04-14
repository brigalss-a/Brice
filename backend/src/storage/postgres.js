const { Pool } = require('pg');
const env = require('../config/env');

let pool;

async function init() {
  pool = new Pool({ connectionString: env.databaseUrl });
  await pool.query('select 1');
}

function getPool() {
  if (!pool) throw new Error('postgres_not_initialized');
  return pool;
}

async function insert(table, row) {
  const keys = Object.keys(row);
  const values = Object.values(row);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const
  sql = `insert into ${table} (${keys.join(',')}) values (${placeholders})`;
  await getPool().query(sql, values);
}

async function query(sql, params = []) {
  return getPool().query(sql, params);
}

// Atomically claim the next queued simulation job
async function claimNextQueuedSimulationJob() {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    // Find and lock the next queued simulation job
    const { rows } = await client.query(
      `SELECT * FROM jobs WHERE status = 'queued' AND kind = 'simulation' ORDER BY created_at ASC LIMIT 1 FOR UPDATE SKIP LOCKED`
    );
    if (!rows.length) {
      await client.query('ROLLBACK');
      return null;
    }
    const job = rows[0];
    // Mark as in_progress
    await client.query(
      `UPDATE jobs SET status = 'in_progress' WHERE job_id = $1`,
      [job.job_id]
    );
    await client.query('COMMIT');
    return { ...job, status: 'in_progress' };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { init, insert, query, getPool, claimNextQueuedSimulationJob, type: 'postgres' };
