# BRICE GitHub App API (MVP)

## Endpoints

### POST /api/github/webhook
- Receives GitHub webhook events (PR, issue, comment)
- Triggers normalization, policy pipeline, claim/audit creation

## Event Flow
1. GitHub sends webhook event (pull_request, issues, issue_comment)
2. github.webhook.controller.js receives and dispatches to github.service.js
3. github.service.js normalizes and routes to github.analysis.js
4. github.analysis.js extracts metadata, runs policy pipeline, creates claim/audit
5. github.policy.js uses optimizer/policyEngine for verdict
6. github.evidence.js integrates Decision Passport Core for proof/receipt

## Integration Notes
- Decision Passport Core is used as a proof/receipt layer for material actions
- No overclaiming: runtime enforcement is not included by default
- All claims/audits are ready for DB persistence and UI surfacing

## Next Steps
- Add DB persistence for claims/audits
- Add UI tab for GitHub Control
- Add advisory comment/patch proposal flows
