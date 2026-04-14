const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const baseDir = path.resolve(process.cwd(), 'data');
const files = {
  users: path.join(baseDir, 'users.jsonl'),
  workspaces: path.join(baseDir, 'workspaces.jsonl'),
  memberships: path.join(baseDir, 'memberships.jsonl'),
  claims: path.join(baseDir, 'claims.jsonl'),
  feedback: path.join(baseDir, 'feedback.jsonl'),
  audits: path.join(baseDir, 'audits.jsonl'),
  sessions: path.join(baseDir, 'sessions.jsonl'),
  jobs: path.join(baseDir, 'jobs.jsonl'),
};

async function init() {
  await fsp.mkdir(baseDir, { recursive: true });
  for (const file of Object.values(files)) {
    if (!fs.existsSync(file)) await fsp.writeFile(file, '', 'utf8');
  }
}

async function append(collection, row) {
  await fsp.appendFile(files[collection], JSON.stringify(row) + '\n', 'utf8');
}

async function readAll(collection) {
  const text = await fsp.readFile(files[collection], 'utf8');
  return text.split('\n').filter(Boolean).map(line => JSON.parse(line));
}

async function findLatest(collection, predicate) {
  const rows = await readAll(collection);
  for (let i = rows.length - 1; i >= 0; i -= 1) {
    if (predicate(rows[i])) return rows[i];
  }
  return null;
}

async function claimNextQueuedSimulationJob() {
  // Find the first queued simulation job
  const jobs = await readAll('jobs');
  const idx = jobs.findIndex(j => j.status === 'queued' && j.kind === 'simulation');
  if (idx === -1) return null;
  // Mark as in_progress and persist
  jobs[idx].status = 'in_progress';
  // Rewrite all jobs (simple but not scalable)
  await fsp.writeFile(files.jobs, jobs.map(j => JSON.stringify(j)).join('\n') + '\n', 'utf8');
  return jobs[idx];
}

module.exports = { init, append, readAll, findLatest, claimNextQueuedSimulationJob, type: 'jsonl' };
