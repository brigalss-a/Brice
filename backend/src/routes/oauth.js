// OAuth routes for Google and GitHub
const express = require('express');
const passport = require('../auth/oauth');
const router = express.Router();
const authService = require('../services/authService');

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login', session: false }), async (req, res) => {
  // On success, issue JWT, set cookie, redirect to dashboard
  const session = await authService.issueSessionForOAuth({ user: req.user });
  res.cookie('brice_session', session.refreshToken, { httpOnly: true, sameSite: 'lax' });
  // Optionally, pass accessToken to frontend (for SPA)
  res.redirect(`/?accessToken=${session.accessToken}`);
});

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: '/login', session: false }), async (req, res) => {
  // On success, issue JWT, set cookie, redirect to dashboard
  const session = await authService.issueSessionForOAuth({ user: req.user });
  res.cookie('brice_session', session.refreshToken, { httpOnly: true, sameSite: 'lax' });
  res.redirect(`/?accessToken=${session.accessToken}`);
});

module.exports = router;
