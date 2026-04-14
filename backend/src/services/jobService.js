const { makeId, nowIso } = require('../utils/common');
const { publish } = require('../utils/emitter');
const { PERSONA_LIBRARY } = require('../utils/personas');
const { callProvider } = require('../providers/clients');

function evaluateText(text) {
  const violations = [];
  if (/guaranteed|definitely true|should work|probably works/i.test(text)) violations.push('speculative_or_overstated');
  return {
    status: violations.length ? 'FAIL' : 'PASS',
    score: violations.length ? 60 : 95,
    violations
  };
}

function resolvePersonas(ids) {
  if (!ids?.length) return PERSONA_LIBRARY;
  return PERSONA_LIBRARY.filter((p) => ids.includes(p.id));
}

async function enqueueSimulationJob(storage, req, payload) {
  const job = {
    job_id: makeId('JOB'),
    workspace_id: req.auth.workspaceId,
    created_by: req.auth.userId,
    kind: 'simulation',
    status: 'queued',
    payload,
    created_at: nowIso()
  };
  await storage.enqueueJob(job);
  await storage.createAudit({
    audit_id: makeId('AUD'),
    workspace_id: req.auth.workspaceId,
    actor_user_id: req.auth.userId,
    event_type: 'job.queued',
    payload: { job_id: job.job_id, kind: 'simulation' },
    ts: nowIso()
  });
  publish({ type: 'job.queued', workspace_id: req.auth.workspaceId, job_id: job.job_id, ts: nowIso() });
  return job;
}

async function processSimulationJob(storage, job) {
  const payload = job.payload || {};
  const personas = resolvePersonas(payload.personas);
  const jobs = [];
  const turns = Math.min(Number(payload.turns || 3), 20);
  const batchSize = Math.min(Number(payload.batchSize || 10), 500);

  for (let batchIndex = 0; batchIndex < batchSize; batchIndex += 1) {
    for (let turn = 1; turn <= turns; turn += 1) {
      const persona = personas[(batchIndex + turn - 1) % personas.length];
      jobs.push({
        batch: batchIndex + 1,
        turn,
        persona: persona.id,
        userTurn: [
          `Scenario: ${payload.scenario}`,
          `Persona: ${persona.name}`,
          persona.prompt,
          `Domain=${payload.domain || 'general'}`
        ].join('\n')
      });
    }
  }

  const trajectory = [];
  for (const item of jobs) {
    const upstream = await callProvider(payload.provider || 'openai', {
      systemPrompt: payload.prompt_variant,
      userContent: item.userTurn
    });
    trajectory.push({
      batch: item.batch,
      turn: item.turn,
      persona: item.persona,
      evaluation: evaluateText(upstream.text)
    });
  }

  const averageScore = Math.round(trajectory.reduce((a, x) => a + x.evaluation.score, 0) / Math.max(trajectory.length, 1));
  const result = {
    simulation_id: makeId('SIM'),
    samples: trajectory.length,
    average_score: averageScore,
    failure_count: trajectory.filter((x) => x.evaluation.status !== 'PASS').length,
    status: averageScore >= 85 ? 'STABLE' : averageScore >= 65 ? 'DEGRADED' : 'UNSAFE'
  };

  await storage.completeJob(job.job_id, result);
  await storage.createAudit({
    audit_id: makeId('AUD'),
    workspace_id: job.workspace_id,
    actor_user_id: job.created_by,
    event_type: 'job.completed',
    payload: { job_id: job.job_id, result },
    ts: nowIso()
  });
  publish({ type: 'job.completed', workspace_id: job.workspace_id, job_id: job.job_id, result, ts: nowIso() });
  return result;
}

module.exports = { enqueueSimulationJob, processSimulationJob };
