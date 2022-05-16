const express = require('express');
const userController = require('../controllers/users');

const router = express.Router();

router.get('/', userController.signUp);

router.post('/login', userController.login);

router.get('/signUp', userController.signUp);

router.get('/signIn', userController.signIn);

router.post('/reg', userController.registerNew);

router.get('/:provider/oauthUser', userController.oauthUser);

router.get('/resendEmail', userController.resend);

router.get('/verify-email', userController.verifyEmail);

router.get('/resetPassword', userController.resetPassword);

router.post('/updatePassword', userController.updatePassword);

router.get('/profile', userController.profile);

router.post('/updateProfile', userController.updateProfile);

module.exports = router;
