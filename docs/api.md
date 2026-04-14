# BRICE Sentinel API

## Overview

RESTful API for prompt hardening, simulation, feedback, job management, and live updates.

## Main Endpoints
- `/api/auth/register` — Register new user
- `/api/auth/login` — Login, returns JWT and refresh token
- `/api/auth/refresh` — Refresh session
- `/api/optimize` — Optimize prompt (protected)
- `/api/simulate` — Enqueue simulation job (protected)
- `/api/feedback` — Submit feedback (protected)
- `/api/jobs/:id` — Get job status (protected, workspace enforced)
- `/api/events` — SSE live updates (protected, workspace enforced)
- `/health` — Healthcheck

## Auth
- JWT Bearer tokens, session cookies
- RBAC and workspace enforced server-side

## SSE Event Types
- `job.queued` — Job was queued
- `job.completed` — Job completed
- `claim.created` — Claim created
- `feedback.created` — Feedback recorded
- All events include `workspace_id` and `ts` (timestamp)

## Gaps
- No Auth0 SSO yet (planned)
- No BullMQ/Redis queue yet (planned)
