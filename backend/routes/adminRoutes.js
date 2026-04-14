const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { body } = require('express-validator');
const AdminController = require('../controllers/adminController');

const router = express.Router();

/**
 * GET /api/admin/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', authMiddleware, requireAdmin, AdminController.getAuditLogs);

/**
 * GET /api/admin/audit-logs/export
 * Export audit logs to CSV
 */
router.get('/audit-logs/export', authMiddleware, requireAdmin, AdminController.exportAuditLogs);

/**
 * GET /api/admin/routing-queue
 * Get complaints awaiting manual routing (AI confidence < 0.65)
 */
router.get('/routing-queue', authMiddleware, requireAdmin, AdminController.getRoutingQueue);

/**
 * PATCH /api/admin/complaints/:id/route
 * Manually assign committee to complaint
 */
router.patch('/complaints/:id/route', authMiddleware, requireAdmin, [
  body('committee_id').notEmpty()
], AdminController.manuallyRouteComplaint);

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', authMiddleware, requireAdmin, AdminController.listUsers);

/**
 * POST /api/admin/users
 * Create new user
 */
router.post('/users', authMiddleware, requireAdmin, [
  body('institutional_id').notEmpty(),
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('role').notEmpty()
], AdminController.createUser);

/**
 * PATCH /api/admin/users/:id
 * Update user
 */
router.patch('/users/:id', authMiddleware, requireAdmin, AdminController.updateUser);

/**
 * GET /api/admin/committees
 * List all committees
 */
router.get('/committees', authMiddleware, requireAdmin, AdminController.listCommittees);

/**
 * POST /api/admin/committees
 * Create new committee
 */
router.post('/committees', authMiddleware, requireAdmin, [
  body('name').notEmpty(),
  body('category_tag').notEmpty(),
  body('head_user_id').notEmpty()
], AdminController.createCommittee);

/**
 * PATCH /api/admin/committees/:id
 * Update committee
 */
router.patch('/committees/:id', authMiddleware, requireAdmin, AdminController.updateCommittee);

module.exports = router;
