# BRICE GitHub Integration (Design)

## Overview
This directory is reserved for the GitHub App integration modules. The goal is to enable BRICE to:
- Ingest GitHub events (PR, Issue, Comment, Workflow, etc.) via webhook or App
- Normalize and analyze PRs, issues, comments, and workflow events
- Run policy/optimizer/evidence pipeline on GitHub content
- Produce claims, events, and audit trail
- Optionally propose comments, patches, or enforce actions (advisory/enforce modes)

## Recommended Architecture
- **github.webhook.controller.js** — Handles incoming GitHub webhooks
- **github.installation.service.js** — Manages GitHub App installations
- **github.repo.service.js** — Fetches repo/PR/issue data
- **github.pull-request.service.js** — PR diff, metadata, and review logic
- **github.action-gateway.service.js** — Gating for material actions (comment, label, merge, etc.)
- **github.policy.service.js** — Policy checks for GitHub events

## Modes
- **shadow**: Read-only, audit/claims only
- **advisory**: Propose comments, warnings
- **enforce**: Can block/act on PRs/issues

## MVP Roadmap
1. Read-only PR analysis: connect repo, fetch PR diff, run BRICE analysis, persist claim, show verdict in dashboard
2. Advisory: propose review comments, operator approves
3. Patch proposal: generate patch, operator approves
4. Decision Passport: require approval for material actions

## UI
- GitHub Control tab: connect repo, select PR, analyze, show verdict, propose actions

---

**Do not scrape the GitHub UI or depend on DOM selectors. Use the GitHub API and webhooks.**
