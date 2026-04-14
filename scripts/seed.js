// Seed script for BRICE Sentinel
// Usage: node scripts/seed.js

const { init, insert } = require('../backend/src/storage/postgres');


const { query } = require('../backend/src/storage/postgres');

async function main() {
  await init();
  // Check if demo workspace exists
  const ws = await query('select 1 from workspaces where id = $1', ['ws-demo']);
  if (ws.rowCount === 0) {
    await insert('workspaces', { id: 'ws-demo', name: 'Demo Workspace', created_at: new Date().toISOString() });
    console.log('Seeded workspace ws-demo');
  }
  const user = await query('select 1 from users where id = $1', ['user-demo']);
  if (user.rowCount === 0) {
    await insert('users', { id: 'user-demo', email: 'demo@brice.local', password_hash: 'demo', created_at: new Date().toISOString() });
    console.log('Seeded user user-demo');
  }
  const mem = await query('select 1 from memberships where id = $1', ['m-demo']);
  if (mem.rowCount === 0) {
    await insert('memberships', { id: 'm-demo', workspace_id: 'ws-demo', user_id: 'user-demo', role: 'owner', created_at: new Date().toISOString() });
    console.log('Seeded membership m-demo');
  }
  console.log('Seed complete.');
}

main().catch(e => { console.error(e); process.exit(1); });
