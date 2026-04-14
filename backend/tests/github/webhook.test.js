// Test GitHub webhook signature verification and PR analysis
const assert = require('assert');
const express = require('express');
const request = require('supertest');
const { verifySignature } = require('../../src/github/github.webhook.verify');
const { appId, webhookSecret } = require('../../src/github/github.app.config');

function signPayload(payload) {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
  return digest;
}

describe('GitHub Webhook', () => {
  it('rejects invalid signature', async () => {
    const app = express();
    app.use(express.json());
    app.post('/webhook', require('../../src/github/github.webhook.controller'));
    const res = await request(app)
      .post('/webhook')
      .set('x-github-event', 'pull_request')
      .send({ action: 'opened', pull_request: {}, repository: {} });
    assert.equal(res.status, 401);
  });

  it('accepts valid signature and triggers PR analysis', async () => {
    const app = express();
    app.use(express.json());
    app.post('/webhook', require('../../src/github/github.webhook.controller'));
    const payload = { action: 'opened', pull_request: { number: 1, title: 'Test', user: { login: 'test' }, head: { ref: 'main', sha: 'abc' }, body: 'test' }, repository: { full_name: 'owner/repo', owner: { login: 'owner' }, name: 'repo' }, installation: { id: 1 } };
    const res = await request(app)
      .post('/webhook')
      .set('x-github-event', 'pull_request')
      .set('x-hub-signature-256', signPayload(payload))
      .send(payload);
    assert.equal(res.status, 200);
    assert.ok(res.body.status);
  });
});
