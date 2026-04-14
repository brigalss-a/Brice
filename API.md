# BRICE Sentinel API Documentation

## Authentication
- All endpoints require a valid JWT (Bearer token) unless otherwise noted.
- SSE `/api/events` accepts token via `Authorization` header or `token` query param.

## Endpoints

### `POST /api/auth/login`
- Authenticate user, returns JWT.

### `GET /api/events`
- Server-Sent Events stream (SSE).
- Auth required (header or query param).

### `POST /api/jobs`
- Submit a new job (AI pipeline request).
- Body: `{ prompt: string, kind: string, ... }`

### `GET /api/jobs/:id`
- Get job status/result.

### `GET /api/personas`
- List available personas.

### `POST /api/personas`
- Create a new persona.

---

## Modular Pipeline
- Jobs submitted to `/api/jobs` are processed through the modular pipeline:
  1. **Optimizer**: Normalizes and enriches prompt.
  2. **Policy Engine**: Pre-checks for safety, compliance.
  3. **Evidence Engine**: Logs claims/events for audit.

See [backend/src/pipeline/README.md](backend/src/pipeline/README.md) for details.

---

## Error Handling
- Standard JSON error responses: `{ error: string, details?: object }`

## Example Usage
```sh
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/jobs/123
```
