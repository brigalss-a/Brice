# GitHub App Integration

## Overview
- Real GitHub App integration for PR analysis, Checks API, and passport-gated actions.
- Webhook endpoint with signature verification.
- Installation mapping and Octokit token logic.
- PR normalization and policy pipeline.
- Checks API for publishing results.
- Passport-gated review comment action for material proof.

## Key Modules
- github.app.config.js: Loads app config, secrets, private key.
- github.webhook.verify.js: Signature verification.
- github.installation.service.js: Installation mapping, Octokit token.
- github.webhook.controller.js: Webhook endpoint, event routing.
- github.analysis.js: PR normalization, policy pipeline, Checks API.
- github.checks.service.js: Publishes Check Runs.
- github.passport.service.js: Decision Passport integration.
- github.review-comment.action.js: Passport-gated review comment.
- github.review.controller.js: API for review comment action.

## Security
- All webhook events are signature-verified.
- Material actions require Decision Passport proof.

## References
- See docs/architecture/github-app-overview.md
- See docs/security/github-app-permissions.md
