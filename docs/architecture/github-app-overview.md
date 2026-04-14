# BRICE GitHub App Architecture Overview

## Key Flows
- GitHub App receives webhook events (pull_request, etc.)
- Webhook signature is verified
- PR events are normalized and analyzed
- Deterministic policy checks run on PR diff/metadata
- Verdict is published as a GitHub Check Run
- Passport-gated review comment action is available for material operations
- All actions are logged and auditable

## Modules
- github.app.config.js: Loads app id, secret, private key
- github.webhook.verify.js: Signature verification
- github.installation.service.js: Installation mapping, token logic
- github.analysis.js: PR normalization, policy pipeline
- github.checks.service.js: Checks API integration
- github.passport.service.js: Decision Passport integration
- github.review-comment.action.js: Passport-gated review comment
- github.review.controller.js: API for review comment action

## Modes
- shadow: analyze only
- advisory: propose comments
- enforce: require passport for material actions
