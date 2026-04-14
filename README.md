
# BRICE Sentinel v7

World-class, open-source AI orchestration stack for secure, modular, and production-grade applications.

# BRICE Sentinel v7

Production-grade, open-source modular AI pipeline with robust GitHub App integration, Decision Passport, and full audit discipline.

## Features
- Docker Compose orchestration (Postgres, Redis, Otel, backend, dashboard)
- Modular AI pipeline: optimizer, policy engine, evidence
- Real GitHub App integration: webhook, PR analysis, Checks API, passport-gated actions
- Decision Passport: material action proof, audit receipts
- RBAC, JWT, session, passport auth
- OpenTelemetry tracing, metrics, logs
- CI/CD ready, test coverage, security audit discipline

## Quickstart

```sh
# 1. Clone and enter repo
git clone https://github.com/brigalss-a/brice-v7.git
cd brice-v7

# 2. Copy and edit environment variables
cd backend
cp .env.example .env
# Edit .env as needed (see docs/architecture/README.md)

# 3. Start all services
cd ..
docker compose up --build

# 4. Run backend tests
cd backend
npm install
npm run migrate
npm test

# 5. Access dashboard
# http://localhost:5173
```

## Documentation
- See [docs/README.md](./docs/README.md) for architecture, integrations, and security

## License
Apache-2.0 (see LICENSE)
