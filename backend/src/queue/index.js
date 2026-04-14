// Queue abstraction for BRICE Sentinel
// TODO: Integrate BullMQ/Redis for production queueing
// For now, this is a stub interface.

const env = require('../config/env');

function enqueueJob(job) {
  // TODO: Implement with BullMQ/Redis
  throw new Error('Queue not implemented: BullMQ/Redis planned');
}

function getJobStatus(jobId) {
  // TODO: Implement with BullMQ/Redis
  throw new Error('Queue not implemented: BullMQ/Redis planned');
}

module.exports = {
  enqueueJob,
  getJobStatus,
};
