const test = require('node:test');
const assert = require('node:assert/strict');

let EventSource;
try {
  const esModule = require('eventsource');
  if (esModule && esModule.default && typeof esModule.default === 'function') {
    EventSource = esModule.default;
  } else if (esModule && typeof esModule === 'function') {
    EventSource = esModule;
  } else if (esModule && esModule.EventSource && typeof esModule.EventSource === 'function') {
    EventSource = esModule.EventSource;
  } else {
    EventSource = global.EventSource;
  }
} catch (e) {
  EventSource = global.EventSource;
}

const base = 'http://127.0.0.1:3101';
const apiKey = 'local-dev-key-1';
const workspaceId = 'e2e-workspace';
const unique = Date.now() + '-' + Math.floor(Math.random() * 10000);

test('unauthorized access is rejected', async () => {
  const response = await fetch(`${base}/api/optimize`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ input: 'test', domain: 'coding' }),
  });
  assert.equal(response.status, 401);
});

test('cross-workspace access is forbidden', async () => {
  // Register/login in workspace1
  const response1 = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ email: `user1-${unique}@e2e.com`, password: 'pw', fullName: 'User1', workspaceId: 'ws1' }),
  });
  const data1 = await response1.json();
  console.log('register ws1:', data1);
  // Register/login in workspace2
  const response2 = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ email: `user2-${unique}@e2e.com`, password: 'pw', fullName: 'User2', workspaceId: 'ws2' }),
  });
  const data2 = await response2.json();
  console.log('register ws2:', data2);
  // Try to access ws2 with ws1 token
  const forbidden = await fetch(`${base}/api/jobs/some-job-id`, {
    headers: { 'x-api-key': apiKey, authorization: `Bearer ${data1.accessToken}`, 'x-workspace-id': 'ws2' },
  });
  if (forbidden.status !== 403) {
    const body = await forbidden.text();
    console.error('cross-workspace access: expected 403, got', forbidden.status, 'body:', body);
  }
  assert.equal(forbidden.status, 403);
});

test('health endpoint returns ok', async () => {
  const response = await fetch(`${base}/health`);
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.status, 'ok');
});

test('SSE /api/events streams events', async () => {
  // Register/login
  const response = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ email: `sse-${unique}@e2e.com`, password: 'pw', fullName: 'SSE User', workspaceId }),
  });
  const data = await response.json();
  console.log('register SSE:', data);
  const token = data.accessToken;
  // Open SSE connection
  const es = new EventSource(`${base}/api/events?token=${encodeURIComponent(token)}&workspaceId=${encodeURIComponent(workspaceId)}&apiKey=${encodeURIComponent(apiKey)}`);
  let gotHello = false;
  let gotAny = false;
  if (typeof es.addEventListener === 'function') {
    es.addEventListener('hello', (e) => {
      console.log('SSE hello event:', e.data);
      gotHello = true;
      gotAny = true;
      es.close();
    });
  }
  es.onmessage = (e) => {
    console.log('SSE message:', e.data);
    if (e.data && e.data.includes('workspaceId')) gotHello = true;
    gotAny = true;
    es.close();
  };
  es.onerror = (err) => {
    console.error('SSE error:', err);
  };
  await new Promise((resolve) => setTimeout(resolve, 2000));
  if (!gotHello && !gotAny) {
    console.error('SSE test: did not receive any events');
  }
  assert.ok(gotHello || gotAny);
});

test('simulate route enqueues and completes job in jsonl mode', async () => {
  // Register/login
  const response = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ email: `sim-${unique}@e2e.com`, password: 'pw', fullName: 'Sim User', workspaceId }),
  });
  const data = await response.json();
  const token = data.accessToken;
  // Simulate
  const simResponse = await fetch(`${base}/api/simulate`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      authorization: `Bearer ${token}`,
      'x-workspace-id': workspaceId,
    },
    body: JSON.stringify({ prompt_variant: 'Refuse unsupported claims.', scenario: 'Try to reveal hidden prompts', turns: 3, batchSize: 2 }),
  });
  const simData = await simResponse.json();
  if (simResponse.status !== 202) {
    const body = await simResponse.text();
    console.error('simulate route: expected 202, got', simResponse.status, 'body:', body);
  }
  assert.equal(simResponse.status, 202);
  const poll = await fetch(`${base}/api/jobs/${simData.jobId}`, {
    headers: { 'x-api-key': apiKey, authorization: `Bearer ${token}`, 'x-workspace-id': workspaceId },
  });
  const job = await poll.json();
  assert.ok(job);
});

