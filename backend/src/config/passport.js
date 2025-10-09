const passport = require('passport');
const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;


