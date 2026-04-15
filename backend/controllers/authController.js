const AuthService = require('../services/authService');
const { validationResult } = require('express-validator');
const redisClient = require('../config/redis');

/**
 * Authentication Controller
 */

class AuthController {
  /**
   * POST /api/auth/register
   * Register new user
   */
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { institutional_id, name, email, password, role } = req.body;

      const user = await AuthService.register({
        institutional_id,
        name,
        email,
        password,
        role: role || 'student'
      });

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/login
   * Login user and issue JWT
   */
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      // Reset login rate-limit counter after a successful login.
      const ip = req.ip || req.connection.remoteAddress;
      const rateLimitKey = `rate_limit:login:${ip}`;
      try {
        await redisClient.del(rateLimitKey);
      } catch (rateLimitError) {
        console.warn('Failed to clear login rate-limit key:', rateLimitError.message);
      }

      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/logout
   * Logout user and invalidate session
   */
  static async logout(req, res) {
    try {
      const { user_id } = req.user;

      await AuthService.logout(user_id);

      res.status(200).json({
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  /**
   * POST /api/auth/forgot-password
   * Send password reset OTP to email
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // TODO: Implement OTP generation and email sending
      
      res.status(200).json({
        message: 'Password reset OTP sent to email'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Verify OTP and reset password
   */
  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword } = req.body;

      // TODO: Implement OTP verification and password reset

      res.status(200).json({
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
}

module.exports = AuthController;
