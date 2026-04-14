// Decision Passport integration for GitHub material actions
const { createPassportReceipt } = require('@decision-passport/core');
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
