// Handles incoming GitHub webhook events
const express = require('express');
const router = express.Router();
const { handleGitHubEvent } = require('./github.service');
const { verifySignature } = require('./github.webhook.verify');
const { saveInstallation } = require('./github.installation.service');
const { analyzePullRequest } = require('./github.analysis');

// POST /api/github/webhook
router.post('/webhook', express.json({ type: '*/*' }), async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'invalid_signature' });
  }
  const event = req.headers['x-github-event'];
  const payload = req.body;
  if (event === 'installation') {
    saveInstallation(payload.installation);
    return res.status(200).json({ status: 'installation_saved' });
  }
  if (event === 'pull_request' && ['opened', 'synchronize', 'reopened'].includes(payload.action)) {
    await analyzePullRequest(payload);
    return res.status(200).json({ status: 'pr_analyzed' });
  }
  // ...handle other events as needed
  res.status(200).json({ status: 'ignored' });
});

module.exports = router;
