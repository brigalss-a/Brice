// Automated tests for BRICE modular pipeline
const assert = require('assert');
const optimizer = require('./optimizer');
const policy = require('./policyEngine');
const evidence = require('./evidence');

describe('BRICE Optimizer', () => {
  it('should normalize whitespace and trim', () => {
    const input = '   Hello   world!   ';
    const result = optimizer.optimizePrompt(input);
    assert.equal(result.optimized, 'Hello world!');
    assert.ok(result.meta.notes.includes('normalized whitespace'));
  });
});

describe('BRICE Policy Engine', () => {
  it('should block forbidden keywords', () => {
    const input = 'This contains a secret token.';
    const res = policy.preCheck(input);
    assert.equal(res.action, 'block');
    assert.ok(res.reasons[0].includes('forbidden keywords'));
  });
  it('should allow safe input', () => {
    const input = 'This is safe.';
    const res = policy.preCheck(input);
    assert.equal(res.action, 'allow');
  });
  it('should redact sensitive output', () => {
    const output = 'Here is an api_key: 12345';
    const res = policy.postCheck(output);
    assert.equal(res.action, 'redact');
  });
});

describe('BRICE Evidence Engine', () => {
  it('should hash values correctly', () => {
    const hash1 = evidence.hash('test');
    const hash2 = evidence.hash('test');
    assert.equal(hash1, hash2);
    assert.equal(hash1.length, 64);
  });
});
