const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const { initStorage } = require('./storage');
const { startTelemetry, stopTelemetry } = require('./telemetry/otel');
const apiRoutes = require('./routes/api');
const passport = require('passport');
const session = require('express-session');
const oauthRoutes = require('./routes/oauth');

async function main() {
  await startTelemetry();
  await initStorage();

  // DB healthcheck: only if not in jsonl mode
  if (env.storageMode !== 'jsonl') {
    try {
      const { getPool } = require('./storage/postgres');
      await getPool().query('select 1');
    } catch (err) {
      console.error('Database unavailable:', err.message);
      process.exit(1);
    }
  }

  const app = express();
  app.use(cors({ origin: env.dashboardOrigin, credentials: true }));
  app.use(helmet());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));
  app.use(rateLimit({ windowMs: 60000, max: 120 }));
  app.use(session({ secret: env.sessionSecret || 'brice-secret', resave: false, saveUninitialized: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api/auth', oauthRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', version: '7.0.0', storageMode: env.storageMode, nodeEnv: env.nodeEnv });
  });

  app.use('/api', apiRoutes);

  const server = app.listen(env.port, () => {
    console.log(`BRICE Sentinel v7 listening on ${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await stopTelemetry();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
