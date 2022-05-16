const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const GOOGLE_CLIENT_ID = '';
const GOOGLE_CLIENT_SECRET = '';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/google/callback'
}, ((accessToken, refreshToken, profile, done) => done(null, profile))));

const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_CLIENT_ID = '';
const FACEBOOK_CLIENT_SECRET = '';
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: '/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'name']
}, ((accessToken, refreshToken, profile, done) => done(null, profile))));

// put user data to session
passport.serializeUser((user, cb) => {
    cb(null, user);// 2
});

// get user info from session
passport.deserializeUser((obj, cb) => {
    cb(null, obj);// 4
});

module.exports = passport;
