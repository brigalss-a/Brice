// API endpoint to trigger passport-gated review comment action
const express = require('express');
const router = express.Router();
const { postReviewComment } = require('./github.review-comment.action');

// POST /api/github/review-comment
router.post('/review-comment', async (req, res) => {
  const { installationId, owner, repo, pullNumber, body, actor, approved } = req.body;
  try {
    const result = await postReviewComment({ installationId, owner, repo, pullNumber, body, actor, approved });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
