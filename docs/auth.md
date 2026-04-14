# BRICE Sentinel Auth

## Current State
- Local JWT auth (register/login/refresh)
- Session cookies for refresh (httpOnly, secure in production)
- RBAC enforced via middleware (`requireRole`)
- Workspace membership enforced on all protected routes
- JWT validation is fail-closed; tokens must be valid and user must be a workspace member

## Planned
- Auth0 SSO integration (OIDC login, JWT validation)
- Role mapping from Auth0 claims to local RBAC roles
- Secure session/refresh flow for SSO
- Auth0 env vars:
	- AUTH0_DOMAIN
	- AUTH0_AUDIENCE
	- AUTH0_CLIENT_ID
	- AUTH0_CLIENT_SECRET
	- AUTH0_ISSUER_BASE_URL
	- AUTH0_SECRET

## RBAC and Workspace Enforcement
- All protected endpoints require valid JWT and workspace membership
- Roles: owner, admin, analyst, viewer, worker
- Role and workspace membership are checked server-side; client claims are never trusted

## Security Notes
- All tokens and cookies are httpOnly and secure (in production)
- No cross-workspace access is possible
- Rate limiting and CORS are enforced
