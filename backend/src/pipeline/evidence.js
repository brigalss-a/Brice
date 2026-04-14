// BRICE Evidence Engine
// Responsible for: claims, events, hashes, audit trail
const crypto = require('crypto');

module.exports = {
  hash(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
  },
  logClaim(claim) {
    // TODO: persist claim to DB
    console.log('[CLAIM]', claim);
  },
  logEvent(event) {
    // TODO: persist event to DB or SSE
    console.log('[EVENT]', event);
  }
};
