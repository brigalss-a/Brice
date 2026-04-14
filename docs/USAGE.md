# Usage Guide

## Running the Stack
- See project root README.md for quickstart
- All services run via Docker Compose
- Backend and dashboard can be run locally for development

## Environment Variables
- Copy backend/.env.example to backend/.env and edit as needed
- See docs/architecture/README.md for variable descriptions

## GitHub App Integration
- Install the GitHub App on your repo/org
- Configure secrets and private key in backend/.env
- See docs/integrations/github-app.md for details

## Decision Passport
- Used for material action proof (e.g., review comments)
- See docs/integrations/decision-passport.md

## Testing
- Run backend tests: npm test (in backend/)
- E2E and passport-gated action tests included

## Dashboard
- Access at http://localhost:5173
- UI for PR analysis, check status, passport status (in progress)
