// Test passport-gated review comment action
const assert = require('assert');
const { passportGateAction } = require('../../src/github/github.passport.service');

describe('Decision Passport Integration', () => {
  it('blocks action if not approved', async () => {
    await assert.rejects(() => passportGateAction({
      actionType: 'post_review_comment',
      payload: { owner: 'o', repo: 'r', pullNumber: 1, body: 'test', approved: false },
      actor: 'user1',
      repoInfo: { repo: 'o/r' },
    }), /passport_approval_required/);
  });

  it('allows action if approved', async () => {
    const result = await passportGateAction({
      actionType: 'post_review_comment',
      payload: { owner: 'o', repo: 'r', pullNumber: 1, body: 'test', approved: true },
      actor: 'user1',
      repoInfo: { repo: 'o/r' },
    });
    assert.equal(result.outcome.status, 'executed');
    assert.ok(result.receipt);
  });
});
