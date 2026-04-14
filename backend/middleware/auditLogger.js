const AuditLog = require('../models/AuditLog');

/**
 * Audit Logging Middleware
 * Logs every successful mutating request (POST, PATCH, PUT, DELETE)
 */

const logAuditMiddleware = async (req, res, next) => {
  // Store original send to intercept response
  const originalSend = res.send;

  res.send = function (data) {
    // Only log audit if request was successful (status 2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      logAudit(req, res, data).catch(err => 
        console.error('Audit logging error:', err)
      );
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Function to log audit entry
 */
async function logAudit(req, res, responseData) {
  try {
    // Skip if not a mutating request
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      return;
    }

    // Determine action type and entity from request
    const { actionType, entityType, entityId } = extractAuditInfo(req, responseData);

    const auditEntry = {
      actor_id: req.user?.user_id || null,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: req.ip || req.connection?.remoteAddress,
      metadata: {
        method: req.method,
        path: req.path,
        userRole: req.user?.role,
        timestamp: new Date().toISOString()
      }
    };

    await AuditLog.create(auditEntry);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper to extract audit information from request
 */
function extractAuditInfo(req, responseData) {
  const path = req.path;
  let actionType = 'UNKNOWN';
  let entityType = 'unknown';
  let entityId = null;

  // Parse based on route pattern
  if (path.includes('/auth/login')) {
    actionType = 'LOGIN';
    entityType = 'user';
  } else if (path.includes('/auth/logout')) {
    actionType = 'LOGOUT';
    entityType = 'user';
  } else if (path.includes('/auth/register')) {
    actionType = 'USER_CREATED';
    entityType = 'user';
  } else if (path.includes('/complaints') && req.method === 'POST') {
    actionType = 'COMPLAINT_SUBMITTED';
    entityType = 'complaint';
    try {
      const data = typeof responseData === 'string' ? JSON.parse(responseData) : responseData;
      entityId = data?.complaint_id;
    } catch (e) {
      // Ignore parse errors
    }
  } else if (path.includes('/complaints') && path.includes('/status') && req.method === 'PATCH') {
    actionType = 'STATUS_CHANGED';
    entityType = 'complaint';
    const match = path.match(/complaints\/([^/]+)/);
    entityId = match?.[1];
  } else if (path.includes('/escalate') && req.method === 'POST') {
    actionType = 'ESCALATED';
    entityType = 'complaint';
    const match = path.match(/complaints\/([^/]+)/);
    entityId = match?.[1];
  } else if (path.includes('/feedback') && req.method === 'POST') {
    actionType = 'FEEDBACK_SUBMITTED';
    entityType = 'feedback';
  } else if (path.includes('/admin')) {
    if (path.includes('/users')) {
      entityType = 'user';
      actionType = req.method === 'POST' ? 'USER_CREATED' : 'USER_UPDATED';
    } else if (path.includes('/committees')) {
      entityType = 'committee';
      actionType = req.method === 'POST' ? 'COMMITTEE_CREATED' : 'COMMITTEE_UPDATED';
    }
  }

  return { actionType, entityType, entityId };
}

module.exports = logAuditMiddleware;
