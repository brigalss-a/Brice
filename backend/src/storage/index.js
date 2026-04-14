const env = require('../config/env');
const jsonl = require('./jsonl');
const postgres = require('./postgres');

let adapter;

async function initStorage() {
  if (env.storageMode === 'jsonl') {
    await jsonl.init();
    adapter = jsonl;
    return adapter;
  }
  if (env.storageMode === 'postgres') {
    await postgres.init();
    adapter = postgres;
    return adapter;
  }
  try {
    await postgres.init();
    adapter = postgres;
  } catch (error) {
    await jsonl.init();
    adapter = jsonl;
  }
  return adapter;
}

function getStorage() {
  if (!adapter) throw new Error('storage_not_initialized');
  return adapter;
}

function claimNextQueuedSimulationJob() {
  if (!adapter || typeof adapter.claimNextQueuedSimulationJob !== 'function') {
    throw new Error('claimNextQueuedSimulationJob_not_implemented');
  }
  return adapter.claimNextQueuedSimulationJob();
}

module.exports = { initStorage, getStorage, claimNextQueuedSimulationJob };
