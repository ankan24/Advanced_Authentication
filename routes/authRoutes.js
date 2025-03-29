const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Auth routes
router.get('/signup', authController.getSignupPage);
router.post('/signup', authController.signup);
router.get('/verify', authController.getVerifyPage);
router.post('/verify', authController.verifyEmail);
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/forgot-password', authController.getForgotPasswordPage);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password', authController.getResetPasswordPage);
router.post('/reset-password', authController.verifyResetCode);
router.get('/logout', authController.logout);

module.exports = router;