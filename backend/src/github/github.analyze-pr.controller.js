// API endpoint for dashboard GitHubControl tab to analyze PRs by repo/PR number
const express = require('express');
const router = express.Router();
const { runPolicyPipeline } = require('./github.policy');

// POST /api/github/analyze-pr
router.post('/analyze-pr', async (req, res) => {
  const { repo, pr } = req.body;
  if (!repo || !pr) return res.status(400).json({ error: 'Missing repo or PR number' });
  // TODO: fetch PR body from GitHub API (MVP: stub)
  // For now, simulate with placeholder
  const meta = { repo, prNumber: pr };
  const body = 'Example PR body for analysis.';
  const verdict = await runPolicyPipeline({ type: 'pr', meta, body });
  res.json(verdict);
});

module.exports = router;
