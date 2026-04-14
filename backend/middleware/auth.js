require('dotenv').config();
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redis');

/**
 * JWT Authentication Middleware
 * Verifies JWT token and session existence in Redis
 * Fails if token is missing, invalid, or session is not in Redis
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify session exists in Redis (handles logout invalidation)
    const sessionKey = `session:${decoded.user_id}`;
    const sessionExists = await redisClient.exists(sessionKey);

    if (!sessionExists) {
      return res.status(401).json({ error: 'Session not found or expired' });
    }

    // Attach user info to request
    req.user = {
      user_id: decoded.user_id,
      role: decoded.role,
      committee_id: decoded.committee_id,
      institutional_id: decoded.institutional_id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = authMiddleware;
