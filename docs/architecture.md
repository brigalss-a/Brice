# BRICE Sentinel Architecture

## Overview

BRICE Sentinel is a modular, institutional-grade prompt hardening and simulation platform. It is designed for secure, multi-tenant, auditable, and observable operation.

## Key Components
- **Backend API**: Node.js/Express, PostgreSQL primary storage, JWT auth, workspace isolation, RBAC, SSE for live updates.
- **Worker**: Batch simulation processor, currently DB-polling (queue upgrade planned).
- **Dashboard**: React/Vite frontend, live SSE feed, workspace-aware.
- **Storage**: PostgreSQL (primary), JSONL fallback for dev only.
- **Telemetry**: OpenTelemetry Node SDK, OTLP exporter, OTel Collector.

## Data Model
- Users, Workspaces, Memberships, Claims, Feedback, Audits, Jobs

## Security
- JWT auth, session cookies, RBAC enforced server-side, workspace membership checks.

## Observability
- OTel traces and metrics for API, jobs, feedback, auth.

## Gaps
- No BullMQ/Redis queue yet (planned)
- No Auth0 SSO yet (planned)
- No OpenAPI spec yet (planned)
- No Playwright/dashboard tests yet (planned)
