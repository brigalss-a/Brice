// OAuth strategy setup for Google and GitHub
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const env = require('../config/env');
const repo = require('../services/repository');

// User serialization (for session)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google OAuth
passport.use(new GoogleStrategy({
  clientID: env.googleClientId,
  clientSecret: env.googleClientSecret,
  callbackURL: env.googleCallbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await repo.upsertUserByOAuth({
      provider: 'google',
      providerId: profile.id,
      email: profile.emails[0].value,
      fullName: profile.displayName || profile.emails[0].value
    });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// GitHub OAuth
passport.use(new GitHubStrategy({
  clientID: env.githubClientId,
  clientSecret: env.githubClientSecret,
  callbackURL: env.githubCallbackUrl,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await repo.upsertUserByOAuth({
      provider: 'github',
      providerId: profile.id,
      email: profile.emails[0].value,
      fullName: profile.displayName || profile.username || profile.emails[0].value
    });
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

module.exports = passport;
