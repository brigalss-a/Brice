const bcrypt = require('bcryptjs');
const { getStorage } = require('../storage');
const { id, now } = require('./utils');

async function ensureWorkspace(workspaceId, name = 'Default Workspace') {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    await storage.query(
      'insert into workspaces (id, name, created_at) values ($1,$2,$3) on conflict (id) do nothing',
      [workspaceId, name, now()]
    );
    return { id: workspaceId, name };
  }

  const existing = await storage.findLatest('workspaces', row => row.id === workspaceId);
  if (!existing) await storage.append('workspaces', { id: workspaceId, name, created_at: now() });
  return existing || { id: workspaceId, name };
}

async function createUser({ email, password, fullName }) {
  const storage = getStorage();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: id('USR'), email: email.toLowerCase(), password_hash: passwordHash, full_name: fullName, created_at: now() };

  if (storage.type === 'postgres') {
    await storage.insert('users', user);
    return user;
  }

  await storage.append('users', user);
  return user;
}

async function findUserByEmail(email) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query('select * from users where email = $1 order by created_at desc limit 1', [email.toLowerCase()]);
    return result.rows[0] || null;
  }
  return storage.findLatest('users', row => row.email === email.toLowerCase());
}

async function createMembership({ workspaceId, userId, role }) {
  const storage = getStorage();
  const row = { id: id('MEM'), workspace_id: workspaceId, user_id: userId, role, created_at: now() };
  if (storage.type === 'postgres') {
    await storage.insert('memberships', row);
    return row;
  }
  await storage.append('memberships', row);
  return row;
}

async function getMembership(workspaceId, userId) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query(
      'select * from memberships where workspace_id = $1 and user_id = $2 order by created_at desc limit 1',
      [workspaceId, userId]
    );
    return result.rows[0] || null;
  }
  return storage.findLatest('memberships', row => row.workspace_id === workspaceId && row.user_id === userId);
}

async function saveSession(session) {
  const storage = getStorage();
  if (storage.type === 'postgres') return storage.insert('sessions', session);
  return storage.append('sessions', session);
}

async function findSessionByRefreshTokenHash(refreshHash) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query('select * from sessions where refresh_token_hash = $1 order by created_at desc limit 1', [refreshHash]);
    return result.rows[0] || null;
  }
  return storage.findLatest('sessions', row => row.refresh_token_hash === refreshHash);
}

async function saveClaim(row) {
  const storage = getStorage();
  if (storage.type === 'postgres') return storage.insert('claims', row);
  return storage.append('claims', row);
}

async function saveFeedback(row) {
  const storage = getStorage();
  if (storage.type === 'postgres') return storage.insert('feedback', row);
  return storage.append('feedback', row);
}

async function saveAudit(row) {
  const storage = getStorage();
  if (storage.type === 'postgres') return storage.insert('audits', row);
  return storage.append('audits', row);
}

async function saveJob(row) {
  const storage = getStorage();
  if (storage.type === 'postgres') return storage.insert('jobs', row);
  return storage.append('jobs', row);
}

async function updateJobStatus(jobId, status, resultPayload) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    await storage.query('update jobs set status = $2, result_payload = $3, updated_at = $4 where id = $1', [jobId, status, JSON.stringify(resultPayload), now()]);
    return;
  }
  await storage.append('jobs', { id: jobId, status, result_payload: resultPayload, updated_at: now(), mutation: true });
}

async function getJob(jobId) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query('select * from jobs where id = $1 order by created_at desc limit 1', [jobId]);
    return result.rows[0] || null;
  }
  return storage.findLatest('jobs', row => row.id === jobId);
}

async function listRecentClaims(workspaceId, limit = 20) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query('select * from claims where workspace_id = $1 order by created_at desc limit $2', [workspaceId, limit]);
    return result.rows;
  }
  const rows = await storage.readAll('claims');
  return rows.filter(r => r.workspace_id === workspaceId).slice(-limit).reverse();
}

async function listRecentAudits(workspaceId, limit = 50) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query('select * from audits where workspace_id = $1 order by ts desc limit $2', [workspaceId, limit]);
    return result.rows;
  }
  const rows = await storage.readAll('audits');
  return rows.filter(r => r.workspace_id === workspaceId).slice(-limit).reverse();
}

async function upsertUserByOAuth({ provider, providerId, email, fullName }) {
  const storage = getStorage();
  let user = await findUserByEmail(email);
  if (!user) {
    user = { id: id('USR'), email: email.toLowerCase(), full_name: fullName, oauth_provider: provider, oauth_id: providerId, created_at: now() };
    if (storage.type === 'postgres') {
      await storage.insert('users', user);
    } else {
      await storage.append('users', user);
    }
  }
  return user;
}

async function getMembershipsByUserId(userId) {
  const storage = getStorage();
  if (storage.type === 'postgres') {
    const result = await storage.query('select * from memberships where user_id = $1 order by created_at desc', [userId]);
    return result.rows;
  }
  const rows = await storage.readAll('memberships');
  return rows.filter(r => r.user_id === userId);
}

module.exports = {
  ensureWorkspace,
  createUser,
  findUserByEmail,
  createMembership,
  getMembership,
  saveSession,
  findSessionByRefreshTokenHash,
  saveClaim,
  saveFeedback,
  saveAudit,
  saveJob,
  updateJobStatus,
  getJob,
  listRecentClaims,
  listRecentAudits,
  upsertUserByOAuth,
  getMembershipsByUserId,
};
