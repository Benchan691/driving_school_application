const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);


// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/change-password', authenticateToken, validateChangePassword, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;


