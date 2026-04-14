// Analysis logic for PRs, issues, comments
const { runPolicyPipeline } = require('./github.policy');
const { createClaim, createAudit } = require('./github.evidence');
const { createOrUpdateCheck } = require('./github.checks.service');

async function analyzePullRequest(payload) {
  // Extract PR info
  const pr = payload.pull_request;
  const repo = payload.repository;
  const installationId = payload.installation?.id;
  const meta = {
    repo: repo.full_name,
    prNumber: pr.number,
    title: pr.title,
    author: pr.user.login,
    diffUrl: pr.diff_url,
    branch: pr.head.ref,
  };
  // Run policy pipeline
  const verdict = await runPolicyPipeline({ type: 'pr', meta, body: pr.body });
  // Persist claim/audit
  await createClaim({ type: 'pr', meta, verdict });
  await createAudit({ action: 'analyze_pr', meta, verdict });
  // Publish GitHub Check Run
  if (installationId) {
    await createOrUpdateCheck({
      installationId,
      owner: repo.owner.login,
      repo: repo.name,
      headSha: pr.head.sha,
      verdict: verdict.verdict,
      summary: verdict.verdict,
      details: (verdict.reasons || []).join('\n'),
    });
  }
}

async function analyzeIssue(payload) {
  const issue = payload.issue;
  const repo = payload.repository;
  const meta = {
    repo: repo.full_name,
    issueNumber: issue.number,
    title: issue.title,
    author: issue.user.login,
  };
  const verdict = await runPolicyPipeline({ type: 'issue', meta, body: issue.body });
  await createClaim({ type: 'issue', meta, verdict });
  await createAudit({ action: 'analyze_issue', meta, verdict });
}

async function analyzeComment(payload) {
  const comment = payload.comment;
  const repo = payload.repository;
  const meta = {
    repo: repo.full_name,
    commentId: comment.id,
    author: comment.user.login,
  };
  const verdict = await runPolicyPipeline({ type: 'comment', meta, body: comment.body });
  await createClaim({ type: 'comment', meta, verdict });
  await createAudit({ action: 'analyze_comment', meta, verdict });
}

module.exports = { analyzePullRequest, analyzeIssue, analyzeComment };
