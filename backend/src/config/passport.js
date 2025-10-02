const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ where: { google_id: profile.id } });
    
    if (user) {
      // User exists, generate tokens
      const tokens = generateTokens(user);
      return done(null, { user: user.toJSON(), ...tokens });
    }

    // Check if user exists with same email
    user = await User.findOne({ where: { email: profile.emails[0].value } });
    
    if (user) {
      // Link Google account to existing user
      await user.update({ 
        google_id: profile.id,
        is_verified: true 
      });
      const tokens = generateTokens(user);
      return done(null, { user: user.toJSON(), ...tokens });
    }

    // Create new user
    const newUser = await User.create({
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      email: profile.emails[0].value,
      password: 'google_oauth_user', // Will be hashed by model hook
      google_id: profile.id,
      is_verified: true,
      user_type: 'student' // Default to student, can be changed later
    });

    const tokens = generateTokens(newUser);
    return done(null, { user: newUser.toJSON(), ...tokens });
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;


