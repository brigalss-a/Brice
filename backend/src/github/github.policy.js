// Policy pipeline for GitHub events (MVP: use existing pipeline modules)
const optimizer = require('../pipeline/optimizer');
const policy = require('../pipeline/policyEngine');

async function runPolicyPipeline({ type, meta, body }) {
  // Normalize input
  const optimized = optimizer.optimizePrompt(body || '');
  // Pre-check
  const pre = policy.preCheck(optimized.optimized);
  // For MVP, skip provider call
  // Post-check (simulate output)
  const post = policy.postCheck(optimized.optimized);
  // Verdict
  return {
    verdict: pre.action === 'block' || post.action === 'redact' ? 'BLOCK' : 'ALLOW',
    reasons: [...(pre.reasons || []), ...(post.reasons || [])],
    meta,
    optimized,
  };
}

module.exports = { runPolicyPipeline };
