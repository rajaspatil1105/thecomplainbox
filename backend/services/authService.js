require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const redisClient = require('../config/redis');

/**
 * Authentication Service
 * Handles user registration, login, password reset, etc.
 */

class AuthService {
  /**
   * Hash password with bcrypt cost factor 12
   */
  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create JWT token
   */
  static createJWT(user) {
    const payload = {
      user_id: user.user_id,
      institutional_id: user.institutional_id,
      role: user.role,
      committee_id: user.committee_id
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY || '8h'
    });
  }

  /**
   * Store JWT session in Redis
   */
  static async storeSession(user_id, token) {
    const sessionKey = `session:${user_id}`;
    const ttlSeconds = 8 * 60 * 60; // 8 hours
    
    await redisClient.setEx(sessionKey, ttlSeconds, token);
  }

  /**
   * Invalidate session (on logout)
   */
  static async invalidateSession(user_id) {
    const sessionKey = `session:${user_id}`;
    await redisClient.del(sessionKey);
  }

  /**
   * Register new user
   */
  static async register(userData) {
    const { institutional_id, name, email, password, role } = userData;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { 
        $or: [
          { email },
          { institutional_id }
        ]
      }
    });

    if (existingUser) {
      throw new Error('User with this email or institutional ID already exists');
    }

    // Hash password
    const password_hash = await this.hashPassword(password);

    // Create user
    const user = await User.create({
      user_id: uuidv4(),
      institutional_id,
      name,
      email,
      password_hash,
      role: role || 'student'
    });

    return {
      user_id: user.user_id,
      institutional_id: user.institutional_id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  /**
   * Login user
   */
  static async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const validPassword = await this.comparePassword(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Create JWT
    const token = this.createJWT(user);

    // Store session in Redis
    await this.storeSession(user.user_id, token);

    return {
      token,
      user: {
        user_id: user.user_id,
        institutional_id: user.institutional_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  /**
   * Logout user
   */
  static async logout(user_id) {
    await this.invalidateSession(user_id);
  }

  /**
   * Verify user exists and is active
   */
  static async verifyUser(user_id) {
    const user = await User.findOne({ where: { user_id } });
    
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    return user;
  }
}

module.exports = AuthService;
