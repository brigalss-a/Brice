# BRICE Sentinel v7 — Architecture Overview

## Overview
BRICE Sentinel is a modular, production-grade AI orchestration stack designed for open-source, enterprise, and research use. It features robust service orchestration, secure APIs, modular AI pipelines, and world-class documentation.

## Components
- **backend/**: Node.js/Express API, modular pipeline, job processing, Postgres/Redis integration
- **dashboard/**: React/Vite frontend for monitoring and control
- **PostgreSQL**: Persistent storage, migrations
- **Redis**: Queueing, caching
- **otel-collector**: OpenTelemetry collector for observability

## Service Orchestration
- **docker-compose.yml**: Orchestrates all services (backend, worker, dashboard, Postgres, Redis, otel-collector)
- **wait-for-it.sh**: Ensures service readiness (esp. Postgres)
- **Alpine-based images**: Lightweight, secure, production-ready

## Modular AI Pipeline
- **optimizer**: Prompt normalization, intent extraction, context enrichment
- **policyEngine**: Pre/post-checks, allow/block/redact, explainability
- **evidence**: Claims, events, audit trail, hash
- Pipeline is stateless, composable, and testable

## Security
- **JWT** authentication, RBAC
- **SSE** with robust token handling (header or query param)
- **Policy engine** for prompt/output safety

## Observability
- **OpenTelemetry** integrated in backend
- **otel-collector** for trace aggregation

## Testing
- **Automated tests** in backend/test/ and backend/tests/
- **End-to-end** and unit tests

## Best Practices
- All code is MIT-licensed, modular, and documented
- Follows world-class OSS and enterprise standards
- Ready for GitHub and open-source contribution

---

For details, see:
- [backend/README.md](backend/README.md)
- [API.md](API.md)
- [backend/src/pipeline/README.md](backend/src/pipeline/README.md)
