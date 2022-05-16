const express = require('express');
const passport = require('../configs/passport');
const userHelper = require('../utils/userStatus');

const router = express.Router();

router.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('index');
    }
});

router.get('/logout', (req, res) => {
    if (userHelper.isActiveSessionUser(req) && !userHelper.isLocalUser(req)) {
        req.logout();
    }
    req.session.destroy();
    res.render('signIn');
});

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { successRedirect: '/users/google/oauthUser', failureRedirect: '/' }));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', { successRedirect: '/users/facebook/oauthUser', failureRedirect: '/' }));

module.exports = router;
