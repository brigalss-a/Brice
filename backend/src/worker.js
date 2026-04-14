const { initStorage, claimNextQueuedSimulationJob } = require('./storage');
const { processSimulationJob } = require('./services/jobService');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


(async () => {
  const storage = await initStorage();
  console.log('BRICE worker started');

  while (true) {
    try {
      const job = await claimNextQueuedSimulationJob();
      if (!job) {
        await sleep(2000);
        continue;
      }
      await processSimulationJob(storage, job);
    } catch (error) {
      console.error('Worker error:', error);
      await sleep(3000);
    }
  }
})();
