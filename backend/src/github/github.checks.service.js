// GitHub Checks API integration
const { getOctokitForInstallation } = require('./github.installation.service');

async function createOrUpdateCheck({ installationId, owner, repo, headSha, verdict, summary, details }) {
  const octokit = getOctokitForInstallation(installationId);
  await octokit.checks.create({
    owner,
    repo,
    name: 'BRICE PR Analysis',
    head_sha: headSha,
    status: 'completed',
    conclusion: verdict === 'BLOCK' ? 'failure' : 'success',
    output: {
      title: `BRICE Verdict: ${verdict}`,
      summary,
      text: details,
    },
  });
}

module.exports = { createOrUpdateCheck };
