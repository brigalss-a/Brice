const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const repo = require('./repository');
const { id, now, sha256 } = require('./utils');

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtAccessTtl });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshTtl });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

async function register({ email, password, fullName, workspaceId }) {
  const existing = await repo.findUserByEmail(email);
  if (existing) throw new Error('user_exists');
  await repo.ensureWorkspace(workspaceId);
  const user = await repo.createUser({ email, password, fullName });
  await repo.createMembership({ workspaceId, userId: user.id, role: 'owner' });
  return issueSession({ user, workspaceId, role: 'owner' });
}

async function login({ email, password, workspaceId }) {
  const user = await repo.findUserByEmail(email);
  if (!user) throw new Error('invalid_credentials');
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new Error('invalid_credentials');
  const membership = await repo.getMembership(workspaceId, user.id);
  if (!membership) throw new Error('workspace_access_denied');
  return issueSession({ user, workspaceId, role: membership.role });
}

async function issueSession({ user, workspaceId, role }) {
  const payload = { sub: user.id, email: user.email, workspaceId, role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await repo.saveSession({
    id: id('SES'),
    user_id: user.id,
    workspace_id: workspaceId,
    refresh_token_hash: sha256(refreshToken),
    created_at: now(),
  });
  return { accessToken, refreshToken, user: { id: user.id, email: user.email, full_name: user.full_name || user.fullName }, workspaceId, role };
}

async function refresh(refreshToken) {
  const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret);
  const session = await repo.findSessionByRefreshTokenHash(sha256(refreshToken));
  if (!session) throw new Error('invalid_session');
  const user = await repo.findUserByEmail(decoded.email);
  return issueSession({ user, workspaceId: decoded.workspaceId, role: decoded.role });
}

async function issueSessionForOAuth({ user }) {
  // Find a workspace for the user, or create one
  let workspaceId = 'default';
  let role = 'owner';
  // Try to find an existing membership
  const memberships = await repo.getMembershipsByUserId(user.id);
  if (memberships && memberships.length > 0) {
    workspaceId = memberships[0].workspace_id;
    role = memberships[0].role;
  } else {
    // Create default workspace and membership
    await repo.ensureWorkspace(workspaceId);
    await repo.createMembership({ workspaceId, userId: user.id, role });
  }
  return issueSession({ user, workspaceId, role });
}

module.exports = { register, login, refresh, verifyAccessToken };
module.exports.issueSessionForOAuth = issueSessionForOAuth;
