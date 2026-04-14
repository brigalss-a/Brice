// GitHub App installation mapping and token logic
const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const { appId, privateKey } = require('./github.app.config');

const installations = new Map(); // in-memory for MVP

function getOctokitForInstallation(installationId) {
  if (!appId || !privateKey) throw new Error('GitHub App config missing');
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId,
    },
  });
}

function saveInstallation(installation) {
  installations.set(installation.id, installation);
}

function getInstallation(installationId) {
  return installations.get(installationId);
}

module.exports = { getOctokitForInstallation, saveInstallation, getInstallation };
