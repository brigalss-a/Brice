const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

function env(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === '') return fallback;
  return value;
}

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const config = {
  port: Number(env('PORT', 3001)),
  nodeEnv: env('NODE_ENV', 'development'),
  storageMode: env('STORAGE_MODE', 'auto'),
  databaseUrl: env('DATABASE_URL', ''),
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  jwtAccessTtl: env('JWT_ACCESS_TTL', '15m'),
  jwtRefreshTtl: env('JWT_REFRESH_TTL', '7d'),
  sessionCookieName: env('SESSION_COOKIE_NAME', 'brice_session'),
  dashboardOrigin: env('DASHBOARD_ORIGIN', 'http://localhost:5173'),
  serverApiKeys: String(env('BRICE_SERVER_API_KEYS', '')).split(',').map(v => v.trim()).filter(Boolean),
  otelServiceName: env('OTEL_SERVICE_NAME', 'brice-sentinel-backend'),
  otelExporterOtlpEndpoint: env('OTEL_EXPORTER_OTLP_ENDPOINT', 'http://localhost:4318'),
  redisUrl: env('REDIS_URL', 'redis://localhost:6380'),
  providers: {
    openai: { apiKey: env('OPENAI_API_KEY', ''), model: env('OPENAI_MODEL', '') },
    anthropic: { apiKey: env('ANTHROPIC_API_KEY', ''), model: env('ANTHROPIC_MODEL', '') },
    gemini: { apiKey: env('GEMINI_API_KEY', ''), model: env('GEMINI_MODEL', '') }
  },
  auth0: {
    domain: env('AUTH0_DOMAIN', ''),
    audience: env('AUTH0_AUDIENCE', ''),
    clientId: env('AUTH0_CLIENT_ID', ''),
    clientSecret: env('AUTH0_CLIENT_SECRET', ''),
    issuerBaseUrl: env('AUTH0_ISSUER_BASE_URL', ''),
    secret: env('AUTH0_SECRET', '')
  },
  googleClientId: env('GOOGLE_CLIENT_ID', ''),
  googleClientSecret: env('GOOGLE_CLIENT_SECRET', ''),
  googleCallbackUrl: env('GOOGLE_CALLBACK_URL', ''),
  githubClientId: env('GITHUB_CLIENT_ID', ''),
  githubClientSecret: env('GITHUB_CLIENT_SECRET', ''),
  githubCallbackUrl: env('GITHUB_CALLBACK_URL', ''),
  githubAppId: env('GITHUB_APP_ID', ''),
  githubWebhookSecret: env('GITHUB_WEBHOOK_SECRET', ''),
  githubAppPrivateKey: env('GITHUB_APP_PRIVATE_KEY', ''),
  githubAppPrivateKeyPath: env('GITHUB_APP_PRIVATE_KEY_PATH', ''),
  decisionPassportSecret: env('DECISION_PASSPORT_SECRET', '')
};

module.exports = config;
