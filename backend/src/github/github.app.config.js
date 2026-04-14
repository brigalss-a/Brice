// GitHub App config and secrets loader
const fs = require('fs');
const path = require('path');
const env = require('../config/env');

let privateKey;
try {
  privateKey = env.githubAppPrivateKey || (env.githubAppPrivateKeyPath ? fs.readFileSync(path.resolve(env.githubAppPrivateKeyPath), 'utf8') : undefined);
} catch (err) {
  console.warn('[GitHub App] Private key not found, integration disabled for local dev.');
  privateKey = undefined;
}

module.exports = {
  appId: env.githubAppId,
  webhookSecret: env.githubWebhookSecret,
  privateKey,
};
