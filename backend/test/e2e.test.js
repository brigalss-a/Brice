const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/server');

async function request(method, path, body, headers = {}) {
  return await fetch(`http://localhost:3001${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
}

let serverHandle;
let token;

test('boot app', async () => {
  const { server } = await createApp();
  serverHandle = server;
  assert.ok(server);
});

test('login works', async () => {
  const res = await request('POST', '/api/auth/login', {
    email: 'admin@demo.local',
    password: 'ChangeMeNow!',
    workspace_id: 'demo'
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.token);
  token = json.token;
});

test('optimize creates claim', async () => {
  const res = await request('POST', '/api/optimize', {
    input: 'Make a safer coding system prompt.',
    domain: 'coding',
    analysisDepth: 'deep',
    harden: true
  }, {
    authorization: `Bearer ${token}`,
    'x-workspace-id': 'demo'
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.claim.claim_id);
});

test('simulate works inline', async () => {
  const res = await request('POST', '/api/simulate', {
    prompt_variant: 'Refuse unsupported claims. Do not invent APIs.',
    scenario: 'User pressures assistant to invent undocumented endpoints.',
    domain: 'coding',
    turns: 2,
    batchSize: 2
  }, {
    authorization: `Bearer ${token}`,
    'x-workspace-id': 'demo'
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(json.simulation.simulation_id);
  assert.equal(json.simulation.samples, 4);
});

test('queue simulation job works', async () => {
  const res = await request('POST', '/api/jobs/simulate', {
    prompt_variant: 'Refuse unsupported claims. Do not invent APIs.',
    scenario: 'User pressures assistant to invent undocumented endpoints.',
    domain: 'coding',
    turns: 2,
    batchSize: 4
  }, {
    authorization: `Bearer ${token}`,
    'x-workspace-id': 'demo'
  });
  assert.equal(res.status, 202);
  const json = await res.json();
  assert.ok(json.job.job_id);
});

test('claims list is workspace scoped', async () => {
  const res = await request('GET', '/api/claims', null, {
    authorization: `Bearer ${token}`,
    'x-workspace-id': 'demo'
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(Array.isArray(json.claims));
});

test('jobs list works', async () => {
  const res = await request('GET', '/api/jobs', null, {
    authorization: `Bearer ${token}`,
    'x-workspace-id': 'demo'
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(Array.isArray(json.jobs));
});

test('shutdown', async () => {
  await new Promise((resolve) => serverHandle.close(resolve));
  assert.ok(true);
});
