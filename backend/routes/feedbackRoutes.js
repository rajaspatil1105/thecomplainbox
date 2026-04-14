const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireStudent } = require('../middleware/rbac');
const { body } = require('express-validator');

const router = express.Router();

/**
 * POST /api/feedback/:id
 * Submit feedback on resolved complaint
 */
router.post('/:id',
  authMiddleware,
  requireStudent,
  [
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim()
  ],
  (req, res) => {
    // TODO: Implement feedback submission
    res.json({ message: 'Feedback submitted' });
  }
);

module.exports = router;
