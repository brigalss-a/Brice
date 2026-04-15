
const env = require('../config/env');
const { verifyAccessToken } = require('../services/authService');
const repo = require('../services/repository');
const { isAuth0Enabled, validateAuth0Jwt } = require('../auth/auth0');

function apiKeyMiddleware(req, res, next) {
  let key = req.header('x-api-key');
  // SSE clients (EventSource) often cannot set custom headers; allow query key for /api/events.
  if (!key && req.path === '/events' && req.method === 'GET' && typeof req.query.apiKey === 'string') {
    key = req.query.apiKey;
  }
  if (!env.serverApiKeys.includes(key)) {
    return res.status(401).json({ error: 'invalid_api_key' });
  }
  next();
}

async function jwtMiddleware(req, res, next) {
  try {
    const token = (req.header('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      console.warn('jwtMiddleware: missing bearer token', { headers: req.headers });
      return res.status(401).json({ error: 'missing_bearer_token' });
    }
    let decoded;
    if (isAuth0Enabled()) {
      // TODO: Use Auth0 JWT validation
      decoded = validateAuth0Jwt(token); // will throw (stub)
    } else {
      decoded = verifyAccessToken(token);
    }
    const workspaceId = req.header('x-workspace-id') || decoded.workspaceId;
    const membership = await repo.getMembership(workspaceId, decoded.sub);
    if (!membership) {
      console.warn('jwtMiddleware: workspace access denied', { workspaceId, userId: decoded.sub, membership });
      return res.status(403).json({ error: 'workspace_access_denied', workspaceId, userId: decoded.sub, membership });
    }
    req.auth = { userId: decoded.sub, email: decoded.email, workspaceId, role: membership.role };
    next();
  } catch (error) {
    console.warn('jwtMiddleware: invalid token', { error: error.message });
    res.status(401).json({ error: 'invalid_token', detail: error.message, workspaceId: req.header('x-workspace-id'), authorization: req.header('authorization') });
  }
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'forbidden', required_roles: roles });
    }
    next();
  };
}

module.exports = { apiKeyMiddleware, jwtMiddleware, requireRole };
