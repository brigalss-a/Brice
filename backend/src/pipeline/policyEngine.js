// BRICE Policy Engine
// Responsible for: pre-check, post-check, allow/warn/block/rewrite/redact, explainability

module.exports = {
  preCheck(input) {
    // Example: block if prompt contains forbidden keywords
    const forbidden = ['secret', 'token', 'jailbreak'];
    const found = forbidden.filter(word => input.toLowerCase().includes(word));
    if (found.length > 0) {
      return { action: 'block', reasons: [`forbidden keywords: ${found.join(', ')}`], score: 0 };
    }
    return { action: 'allow', reasons: [], score: 100 };
  },
  postCheck(output) {
    // Example: redact if output contains sensitive info
    if (/api[_-]?key|password|secret/i.test(output)) {
      return { action: 'redact', reasons: ['output contains sensitive info'], score: 0 };
    }
    return { action: 'allow', reasons: [], score: 100 };
  }
};
