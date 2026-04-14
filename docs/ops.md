# BRICE Sentinel Ops

## Running Locally
- Use Docker Compose: `docker-compose up --build`
- Or run backend and dashboard separately with local Postgres

## Healthchecks
- Backend: `/health` endpoint
- Dashboard: root URL
- Docker Compose healthchecks configured

## Migrations
- Run with `npm run migrate` in backend
- Or use `node scripts/migrate.js`

## Seeding
- Run with `node scripts/seed.js`

## Telemetry
- OTel Collector runs in Docker Compose
- Configure OTLP endpoint via env vars

## Planned
- Redis/BullMQ queue
- Auth0 SSO
- OpenAPI validation in CI
