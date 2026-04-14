const { buildStorage } = require('../storage');
const { seedDefaultAdmin } = require('../services/authService');

(async () => {
  const storage = await buildStorage();
  const user = await seedDefaultAdmin(storage);
  console.log('Seeded:', user.email);
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
