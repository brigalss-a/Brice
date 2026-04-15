// Decision Passport integration for GitHub actions (MVP: stub, ready for real integration)
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

async function createClaim({ type, meta, verdict }) {
  // TODO: persist claim to DB
  const receipt = await createPassportReceipt({
    action: type,
    meta,
    verdict,
    timestamp: Date.now(),
  });
  // TODO: store receipt reference
  console.log('[CLAIM]', { type, meta, verdict, receipt });
}

async function createAudit({ action, meta, verdict }) {
  // TODO: persist audit to DB
  console.log('[AUDIT]', { action, meta, verdict });
}

module.exports = { createClaim, createAudit };
