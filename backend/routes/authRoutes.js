const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { checkLoginRateLimit } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', [
  body('institutional_id').notEmpty().trim(),
  body('name').notEmpty().trim(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], authController.register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], checkLoginRateLimit, authController.login);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authController.logout);

/**
 * POST /api/auth/forgot-password
 */
router.post('/forgot-password', [
  body('email').isEmail()
], authController.forgotPassword);

/**
 * POST /api/auth/reset-password
 */
router.post('/reset-password', [
  body('email').isEmail(),
  body('otp').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], authController.resetPassword);

module.exports = router;
