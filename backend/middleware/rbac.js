/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role restrictions on endpoints
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Forbidden - insufficient permissions',
        userRole: req.user.role,
        allowedRoles
      });
    }

    next();
  };
};

/**
 * Ensure user is a student (for complaint submission)
 */
const requireStudent = requireRole('student');

/**
 * Ensure user is committee member, head, or admin
 */
const requireAuthority = requireRole('committee_member', 'committee_head', 'admin');

/**
 * Ensure user is committee head or admin
 */
const requireHeadOrAdmin = requireRole('committee_head', 'admin');

/**
 * Ensure user is admin only
 */
const requireAdmin = requireRole('admin');

/**
 * Ensure user is principal or admin (read-only for principal)
 */
const requirePrincipalOrAdmin = requireRole('principal', 'admin');

module.exports = {
  requireRole,
  requireStudent,
  requireAuthority,
  requireHeadOrAdmin,
  requireAdmin,
  requirePrincipalOrAdmin
};
