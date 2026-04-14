# BRICE Sentinel Backend

This is the backend service for the BRICE Sentinel v7 stack. It provides secure, modular, and production-grade APIs, job processing, and AI pipeline orchestration.

## Features
- **Express.js API** with JWT/RBAC authentication
- **PostgreSQL** for persistent storage and migrations
- **Redis** for job queueing and caching
- **Modular AI pipeline** (optimizer, policy engine, evidence/audit)
- **OpenTelemetry** for observability
- **SSE** (Server-Sent Events) with robust authentication
- **Docker Compose** orchestration for local and cloud

## Directory Structure
- `src/` — Main backend source code
  - `routes/` — API endpoints
  - `middleware/` — Express middleware (auth, workspace)
  - `services/` — Business logic and integrations
  - `storage/` — Database and storage adapters
  - `pipeline/` — Modular AI pipeline engines
  - `workers/` — Background job processors
  - `utils/` — Common utilities
- `migrations/` — SQL migrations
- `test/`, `tests/` — Automated tests

## Development
- **Start locally:**
  ```sh
  docker-compose up --build
  ```
- **Run tests:**
  ```sh
  docker-compose exec backend npm test
  ```
- **Apply migrations:**
  ```sh
  docker-compose exec backend npm run migrate
  ```

## API
See [API.md](../API.md) for full documentation.

## Pipeline Architecture
See [src/pipeline/README.md](src/pipeline/README.md) for details on the modular AI pipeline.

## License
MIT
