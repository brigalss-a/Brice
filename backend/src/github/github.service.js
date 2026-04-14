// Core GitHub App logic: event normalization, PR/issue/commit fetch, policy pipeline, claim/audit
const { analyzePullRequest, analyzeIssue, analyzeComment } = require('./github.analysis');
const { createClaim, createAudit } = require('./github.evidence');

async function handleGitHubEvent(payload, headers) {
  // Normalize event type
  const eventType = headers['x-github-event'];
  if (eventType === 'pull_request') {
    await analyzePullRequest(payload);
  } else if (eventType === 'issues') {
    await analyzeIssue(payload);
  } else if (eventType === 'issue_comment') {
    await analyzeComment(payload);
  } else {
    // For MVP, ignore other events
    return;
  }
}

module.exports = { handleGitHubEvent };
