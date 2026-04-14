const express = require('express');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requirePrincipalOrAdmin } = require('../middleware/rbac');
const DashboardController = require('../controllers/dashboardController');

const router = express.Router();

/**
 * GET /api/dashboard/student
 * Student dashboard
 */
router.get('/student', authMiddleware, DashboardController.getStudentDashboard);

/**
 * GET /api/dashboard/authority
 * Authority (committee) inbox
 */
router.get('/authority', authMiddleware, DashboardController.getAuthorityDashboard);

/**
 * GET /api/dashboard/admin
 * Admin analytics dashboard
 */
router.get('/admin', authMiddleware, requireAdmin, DashboardController.getAdminDashboard);

/**
 * GET /api/dashboard/principal
 * Principal read-only overview
 */
router.get('/principal', authMiddleware, requirePrincipalOrAdmin, DashboardController.getPrincipalDashboard);

module.exports = router;
