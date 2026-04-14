const { initStorage, getStorage } = require('../storage');
const { processSimulationJob } = require('../services/briceService');

async function claimOneJob() {
  const storage = getStorage();
  if (storage.type !== 'postgres') return null;
  const result = await storage.query(`
    update jobs
    set status = 'processing', updated_at = now()
    where id = (
      select id from jobs where status = 'queued' and type = 'batch_simulation' order by created_at asc limit 1
      for update skip locked
    )
    returning *
  `);
  return result.rows[0] || null;
}

async function loop() {
  await initStorage();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const job = await claimOneJob();
    if (!job) {
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }
    try {
      await processSimulationJob(job);
    } catch (error) {
      await getStorage().query('update jobs set status = $2, result_payload = $3, updated_at = now() where id = $1', [job.id, 'failed', JSON.stringify({ error: error.message })]);
    }
  }
}

loop().catch(error => {
  console.error('simulation worker fatal', error);
  process.exit(1);
});
