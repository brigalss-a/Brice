# BRICE Sentinel

Institutional-grade prompt hardening and simulation platform for secure, multi-tenant, auditable LLM prompt workflows. Built for developers, platform engineers, and security/observability teams.

## Key Capabilities

- Secure, multi-tenant prompt hardening and simulation workbench
- PostgreSQL primary storage (with JSONL fallback for dev)
- Local JWT authentication, session cookies, workspace isolation, RBAC
- Server-Sent Events (SSE) for dashboard live updates
- Docker Compose stack with Postgres and OTel Collector
- E2E backend tests, CI for backend
- OpenAPI 3.0 spec for all backend routes

## Architecture Overview

BRICE Sentinel is composed of a Node.js/Express backend, a React/Vite dashboard, and supporting infrastructure for observability and storage.

### Component Diagram

```mermaid
graph TD
  subgraph User
    A[Browser/Dashboard]
  end
  subgraph Backend
    B[Express API]
    C[Worker]
  end
  D[PostgreSQL]
  E[JSONL Storage]
  F[OpenTelemetry Collector]
  G[Redis (planned)]
  A -- REST/SSE --> B
  B -- DB --> D
  B -- fallback --> E
  B -- Telemetry --> F
  C -- DB --> D
  C -- fallback --> E
  B -- SSE --> A
  C -- Telemetry --> F
```

## Quick Start (Docker Compose)

```bash
docker-compose up --build
```

## Local Development

Backend:
```bash
cd backend
cp .env.example .env
npm install
npm run migrate
npm run dev
```

Worker:
```bash
cd backend
npm run worker
```

Dashboard:
```bash
cd dashboard
cp .env.example .env
npm install
npm run dev
```

## Configuration / Environment Variables

See `backend/.env.example` and `dashboard/.env.example` for all required variables. Key vars:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` - JWT signing keys
- `BRICE_SERVER_API_KEYS` - API key(s) for backend
- `OTEL_EXPORTER_OTLP_ENDPOINT` - OTel collector endpoint
- `DASHBOARD_ORIGIN` - Allowed dashboard origin
- `LEGAL_OWNER`, `LEGAL_CONTACT` - Legal/branding

## Auth Flow

- Local JWT auth only (no Auth0 yet)
- Register/login returns JWT access/refresh tokens
- All protected routes require `Authorization: Bearer <token>` and `x-workspace-id` header

## PostgreSQL Migrations and Seed

Run migrations:
```bash
cd backend
npm run migrate
```

## SSE Live Updates

SSE endpoint: `/api/events` (requires JWT token)

## OpenTelemetry Setup

OpenTelemetry Node SDK, OTLP exporter, OTel Collector. See `otel-collector-config.yaml`.

## OpenAPI

See [`docs/openapi.yaml`](docs/openapi.yaml) for the full OpenAPI 3.0 spec.

## Testing Instructions

Backend E2E:
```bash
cd backend
npm run test:e2e
```

## Project Structure

```
brice-v7/
  backend/
    src/
      server.js
      routes/api.js
      middleware/
      services/
      storage/
      db/
      telemetry/
      utils/
      workers/
    test/
    tests/
    Dockerfile
    package.json
  dashboard/
    src/
    tests/
    Dockerfile
    package.json
  docker-compose.yml
  otel-collector-config.yaml
  docs/
    openapi.yaml
```

## Security Notes

- All JWTs are validated server-side
- Workspace membership and RBAC enforced on all protected routes
- API keys required for backend access

## Known Limitations

- No Auth0 SSO (planned)
- No BullMQ/Redis queue (planned)
- No Playwright dashboard tests (planned)
- No job status API or dead-letter queue (planned)

## Roadmap

- Auth0 SSO integration
- BullMQ/Redis job queue
- Playwright dashboard tests
- Job lifecycle observability and dead-letter queue

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache License 2.0. See [LICENSE](LICENSE).

---

### Example API Usage (curl)

#### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H 'content-type: application/json' \
  -H 'x-api-key: local-dev-key-1' \
  -d '{"email":"user@demo.com","password":"pw","fullName":"User","workspaceId":"demo"}'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'content-type: application/json' \
  -H 'x-api-key: local-dev-key-1' \
  -d '{"email":"user@demo.com","password":"pw","workspaceId":"demo"}'
```

#### Optimize Prompt
```bash
curl -X POST http://localhost:3001/api/optimize \
  -H 'content-type: application/json' \
  -H 'x-api-key: local-dev-key-1' \
  -H 'authorization: Bearer <accessToken>' \
  -H 'x-workspace-id: demo' \
  -d '{"input":"Make a safer prompt.","domain":"coding"}'
```

#### Simulate
```bash
curl -X POST http://localhost:3001/api/simulate \
  -H 'content-type: application/json' \
  -H 'x-api-key: local-dev-key-1' \
  -H 'authorization: Bearer <accessToken>' \
  -H 'x-workspace-id: demo' \
  -d '{"prompt_variant":"Refuse unsupported claims.","scenario":"Test","turns":2,"batchSize":2}'
```

#### Get Job Status
```bash
curl -X GET http://localhost:3001/api/jobs/<jobId> \
  -H 'x-api-key: local-dev-key-1' \
  -H 'authorization: Bearer <accessToken>' \
  -H 'x-workspace-id: demo'
```

#### SSE Events
```bash
curl -N http://localhost:3001/api/events?token=<accessToken>&workspaceId=demo
```
