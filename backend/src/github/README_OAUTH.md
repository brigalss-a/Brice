# OAuth Integration Plan (Google & GitHub)

## Requirements
- Add Google OAuth and GitHub OAuth login to the dashboard login screen
- Use Passport.js or similar for backend OAuth flows
- Add visible "Continue with Google" and "Continue with GitHub" buttons
- Fallback to email/password only if needed
- Ensure session persistence, logout, and protected endpoint enforcement

## Implementation Steps
1. Add passport-google-oauth20 and passport-github2 to backend dependencies
2. Implement /api/auth/google and /api/auth/github routes for OAuth login
3. Implement OAuth callback handlers
4. Store user session (JWT or session cookie)
5. Update dashboard UI to show OAuth buttons and handle login state
6. Add .env.example notes for required client IDs/secrets

## Security Notes
- Do not expose secrets in client code
- Document required environment variables
- Fail honestly if secrets are missing

## Next Steps
- Scaffold backend OAuth routes
- Add UI buttons and flows
- Add tests for OAuth login/callback
