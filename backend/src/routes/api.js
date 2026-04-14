const express = require('express');
const cookieParser = require('cookie-parser');
const authService = require('../services/authService');
const repo = require('../services/repository');
const env = require('../config/env');
const { apiKeyMiddleware, jwtMiddleware, requireRole } = require('../middleware/auth');
const { optimize, enqueueSimulation, feedback, PERSONA_LIBRARY } = require('../services/briceService');
const { addClient, removeClient, broadcast } = require('../services/eventBus');
const { getJob } = require('../services/repository');
const { getCounters } = require('../telemetry/otel');
const { id, now } = require('../services/utils');
const { getStorage } = require('../storage');
const githubWebhook = require('../github/github.webhook.controller');
const githubAnalyzePR = require('../github/github.analyze-pr.controller');
const githubReview = require('../github/github.review.controller');

const router = express.Router();
router.use(cookieParser());
router.use(apiKeyMiddleware);

router.post('/auth/register', async (req, res) => {
  try {
    const session = await authService.register(req.body);
    getCounters().authLogins.add(1, { type: 'register' });
    res.cookie(env.sessionCookieName, session.refreshToken, { httpOnly: true, sameSite: 'lax' });
    res.json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const session = await authService.login(req.body);
    getCounters().authLogins.add(1, { type: 'login' });
    res.cookie(env.sessionCookieName, session.refreshToken, { httpOnly: true, sameSite: 'lax' });
    res.json(session);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies[env.sessionCookieName] || req.body.refreshToken;
    const session = await authService.refresh(refreshToken);
    res.cookie(env.sessionCookieName, session.refreshToken, { httpOnly: true, sameSite: 'lax' });
    res.json(session);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/auth/sso/providers', (req, res) => {
  res.json({ providers: [{ code: 'oidc', name: 'Generic OIDC', status: 'config-driven extension point' }] });
});

router.get('/events', async (req, res) => {
  try {
    // Accept token from query param or Authorization header
    let token = null;
    if (typeof req.query.token === 'string' && req.query.token.length > 0) {
      token = req.query.token;
    } else {
      const authHeader = req.header('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.slice('Bearer '.length);
      }
    }
    if (!token) {
      console.warn('SSE /api/events missing token', { query: req.query, headers: req.headers });
      return res.status(401).json({ error: 'missing_event_token' });
    }
    const { verifyAccessToken } = require('../services/authService');
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      console.warn('SSE /api/events invalid token', { token, err });
      return res.status(401).json({ error: 'invalid_event_token', detail: err.message });
    }
    const workspaceId = req.query.workspaceId || decoded.workspaceId;
    const membership = await require('../services/repository').getMembership(workspaceId, decoded.sub);
    if (!membership) {
      console.warn('SSE /api/events workspace access denied', { workspaceId, userId: decoded.sub });
      return res.status(403).json({ error: 'workspace_access_denied' });
    }
    req.auth = { userId: decoded.sub, email: decoded.email, workspaceId, role: membership.role };
  } catch (error) {
    console.error('SSE /api/events unexpected error', error);
    return res.status(401).json({ error: 'invalid_event_token', detail: error.message });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  const workspaceId = req.auth.workspaceId;
  addClient(workspaceId, res);
  // Initial hello event
  res.write(`event: hello\ndata: ${JSON.stringify({ workspaceId, ts: now() })}\n\n`);
  // Periodic ping
  const timer = setInterval(() => res.write(`event: ping\ndata: ${JSON.stringify({ ts: now() })}\n\n`), 15000);
  // Listen for job/claim/feedback events
  res._briceEventHandler = (event) => {
    if (event.workspace_id !== workspaceId) return;
    res.write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`);
  };
  broadcast.on('event', res._briceEventHandler);
  req.on('close', () => {
    clearInterval(timer);
    removeClient(workspaceId, res);
    broadcast.off('event', res._briceEventHandler);
  });
});
// Job status endpoint
router.get('/jobs/:id', jwtMiddleware, async (req, res) => {
  try {
    const job = await getJob(req.params.id);
    if (!job) {
      console.warn('Job not found', { jobId: req.params.id });
      return res.status(404).json({ error: 'job_not_found' });
    }
    // Enforce workspace and RBAC
    if (!req.auth || !req.auth.workspaceId) {
      console.warn('Missing auth or workspaceId', { auth: req.auth });
      return res.status(403).json({ error: 'workspace_access_denied' });
    }
    if (job.workspace_id !== req.auth.workspaceId) {
      console.warn('Workspace access denied', { jobWorkspace: job.workspace_id, userWorkspace: req.auth.workspaceId });
      return res.status(403).json({ error: 'forbidden' });
    }
    res.json({ job });
  } catch (error) {
    console.error('Error in /jobs/:id', error);
    res.status(400).json({ error: error.message });
  }
});

router.use(jwtMiddleware);

router.get('/personas', (req, res) => {
  res.json({ personas: PERSONA_LIBRARY });
});

router.post('/optimize', async (req, res) => {
  try {
    const result = await optimize(req.auth.workspaceId, req.auth, req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Patch: Ensure simulate returns 403 for workspace access issues
router.post('/simulate', requireRole(['owner', 'admin', 'analyst']), async (req, res) => {
  try {
    if (!req.auth || !req.auth.workspaceId) {
      console.warn('Simulate: missing auth or workspaceId', { auth: req.auth });
      return res.status(403).json({ error: 'workspace_access_denied' });
    }
    const job = await enqueueSimulation(req.auth.workspaceId, req.auth, req.body);
    const storage = getStorage();
    if (storage.type !== 'postgres') {
      // JSONL mode fallback executes inline.
      const { processSimulationJob } = require('../services/briceService');
      await processSimulationJob(job);
    }
    res.status(202).json({ jobId: job.id, status: job.status });
  } catch (error) {
    if (error && error.message && error.message.includes('workspace_access_denied')) {
      console.warn('Simulate: workspace access denied', { error });
      return res.status(403).json({ error: 'workspace_access_denied' });
    }
    if (error && error.message && (error.message.includes('invalid_token') || error.message.includes('missing_bearer_token'))) {
      console.warn('Simulate: invalid or missing token', { error });
      return res.status(401).json({ error: 'invalid_token', detail: error.message });
    }
    console.error('Simulate: error', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/jobs/:id', async (req, res) => {
  const job = await getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'job_not_found' });
  res.json(job);
});

router.post('/feedback', async (req, res) => {
  try {
    const row = await feedback(req.auth.workspaceId, req.auth, req.body);
    res.json(row);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/dashboard/summary', async (req, res) => {
  const claims = await repo.listRecentClaims(req.auth.workspaceId, 20);
  const audits = await repo.listRecentAudits(req.auth.workspaceId, 50);
  const summary = {
    claims,
    audits,
    counts: {
      pass: claims.filter(c => c.evaluation_status === 'PASS').length,
      warn: claims.filter(c => c.evaluation_status === 'WARN').length,
      fail: claims.filter(c => c.evaluation_status === 'FAIL').length,
    }
  };
  res.json(summary);
});

router.post('/workspace/memberships', requireRole(['owner', 'admin']), async (req, res) => {
  try {
    const row = await repo.createMembership({ workspaceId: req.auth.workspaceId, userId: req.body.userId, role: req.body.role || 'viewer' });
    await repo.saveAudit({ id: id('AUD'), workspace_id: req.auth.workspaceId, actor_user_id: req.auth.userId, action: 'membership_created', detail: row, ts: now() });
    res.status(201).json(row);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.use('/github', githubWebhook);
router.use('/github', githubAnalyzePR);
router.use('/github', githubReview);

module.exports = router;
