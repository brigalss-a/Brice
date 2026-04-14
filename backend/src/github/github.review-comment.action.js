// Passport-gated review comment action for PRs
const { getOctokitForInstallation } = require('./github.installation.service');
const { passportGateAction } = require('./github.passport.service');

async function postReviewComment({ installationId, owner, repo, pullNumber, body, actor, approved }) {
  // Gate with Decision Passport
  const { outcome, receipt } = await passportGateAction({
    actionType: 'post_review_comment',
    payload: { owner, repo, pullNumber, body, approved },
    actor,
    repoInfo: { repo: `${owner}/${repo}` },
  });
  // Only execute if approved
  if (!approved) throw new Error('passport_approval_required');
  const octokit = getOctokitForInstallation(installationId);
  const res = await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: pullNumber,
    body,
    event: 'COMMENT',
  });
  return { outcome, receipt, githubResult: res.data };
}

module.exports = { postReviewComment };
