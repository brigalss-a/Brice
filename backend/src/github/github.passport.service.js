// Decision Passport integration for GitHub material actions
let createPassportReceipt;
try {
  ({ createPassportReceipt } = require('@decision-passport/core'));
} catch (error) {
  // Keep server startup resilient in CI when local file dependency is unavailable.
  createPassportReceipt = async (payload) => ({
    id: `mock-passport-${Date.now()}`,
    provider: 'mock',
    ...payload,
  });
}
const repo = require('../services/repository');

async function passportGateAction({ actionType, payload, actor, repoInfo }) {
  // Canonicalize and hash payload
  const payloadStr = JSON.stringify(payload);
  // In real use, show approval UI or require operator approval
  // For MVP, require explicit approval param
  if (!payload.approved) throw new Error('passport_approval_required');
  // Bind outcome
  const outcome = { status: 'executed', ts: Date.now() };
  const receipt = await createPassportReceipt({
    action: actionType,
    actor,
    repo: repoInfo,
    payloadHash: require('crypto').createHash('sha256').update(payloadStr).digest('hex'),
    outcomeHash: require('crypto').createHash('sha256').update(JSON.stringify(outcome)).digest('hex'),
    timestamp: Date.now(),
  });
  // Persist reference (MVP: log)
  await repo.saveAudit({ id: 'AUD-' + Date.now(), workspace_id: repoInfo.repo, actor_user_id: actor, action: actionType, detail: { receipt }, ts: Date.now() });
  return { outcome, receipt };
}

module.exports = { passportGateAction };
