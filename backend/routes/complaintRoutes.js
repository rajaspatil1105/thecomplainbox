const express = require('express');
const { body } = require('express-validator');
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/auth');
const { requireStudent, requireAuthority } = require('../middleware/rbac');
const { checkSubmissionRateLimit } = require('../middleware/rateLimit');
const { fileValidationMiddleware } = require('../middleware/fileValidation');

const router = express.Router();

/**
 * POST /api/complaints
 * Submit new complaint
 */
router.post('/',
  authMiddleware,
  requireStudent,
  checkSubmissionRateLimit,
  fileValidationMiddleware,
  [
    body('title').notEmpty().trim(),
    body('description').isLength({ min: 30 }),
    body('isAnonymous').optional().isBoolean().toBoolean()
  ],
  complaintController.submitComplaint
);

/**
 * GET /api/complaints/:id
 * Get complaint details
 */
router.get('/:id',
  authMiddleware,
  complaintController.getComplaintById
);

/**
 * GET /api/complaints/track/:token
 * Track anonymous complaint (public)
 */
router.get('/track/:token',
  complaintController.trackAnonymousComplaint
);

/**
 * PATCH /api/complaints/:id/status
 * Update complaint status
 */
router.patch('/:id/status',
  authMiddleware,
  requireAuthority,
  [
    body('newStatus').notEmpty(),
    body('note').notEmpty()
  ],
  complaintController.updateStatus
);

/**
 * POST /api/complaints/:id/escalate
 * Escalate complaint
 */
router.post('/:id/escalate',
  authMiddleware,
  requireAuthority,
  complaintController.escalateComplaint
);

/**
 * GET /api/complaints/:id/messages
 * Get complaint messages
 */
router.get('/:id/messages',
  authMiddleware,
  complaintController.getMessages
);

/**
 * POST /api/complaints/:id/messages
 * Add message to complaint
 */
router.post('/:id/messages',
  authMiddleware,
  [body('message').notEmpty()],
  complaintController.addMessage
);

module.exports = router;
