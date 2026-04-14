// Auth0 SSO integration stub for BRICE Sentinel
// TODO: Implement real Auth0 OIDC login flow and JWT validation

const env = require('../config/env');

function isAuth0Enabled() {
  return !!(env.auth0.domain && env.auth0.clientId && env.auth0.clientSecret);
}

function validateAuth0Jwt(token) {
  // TODO: Implement real Auth0 JWT validation
  throw new Error('Auth0 SSO not yet implemented');
}

module.exports = {
  isAuth0Enabled,
  validateAuth0Jwt,
};
