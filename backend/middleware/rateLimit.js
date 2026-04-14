require('dotenv').config();
const redisClient = require('../config/redis');

/**
 * Rate Limiting Middleware using Redis
 */

/**
 * Check login attempts rate limit: max 10 per IP per 15 minutes
 */
const checkLoginRateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limit:login:${ip}`;
    
    const attempts = await redisClient.incr(key);
    
    if (attempts === 1) {
      await redisClient.expire(key, 900); // 15 minutes
    }

    if (attempts > 10) {
      return res.status(429).json({
        error: 'Too many login attempts. Please try again in 15 minutes.'
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    next(); // Allow on error to not block users
  }
};

/**
 * Check complaint submission rate limit: max 5 per student per 24 hours
 */
const checkSubmissionRateLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `rate_limit:submit:${req.user.user_id}`;
    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, 86400); // 24 hours
    }

    if (count > 5) {
      return res.status(429).json({
        error: 'Complaint submission limit exceeded (5 per day)',
        remaining: 0,
        resetTime: await redisClient.ttl(key)
      });
    }

    req.submissionCount = count;
    req.submissionRemaining = 5 - count;

    next();
  } catch (error) {
    console.error('Submission rate limit error:', error);
    next(); // Allow on error
  }
};

module.exports = {
  checkLoginRateLimit,
  checkSubmissionRateLimit
};
