const User = require('../models/User');
const Committee = require('../models/Committee');
const AuditLog = require('../models/AuditLog');
const Complaint = require('../models/Complaint');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Admin Controller
 * Handles all admin CRUD operations for users, committees, audit logs, and routing
 */

class AdminController {
  /**
   * GET /api/admin/users
   * List all users with pagination
   */
  static async listUsers(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        attributes: [
          'user_id',
          'institutional_id',
          'name',
          'email',
          'role',
          'committee_id',
          'is_active',
          'created_at',
          'last_login'
        ],
        include: [
          {
            model: Committee,
            attributes: ['name', 'category_tag'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        users: rows
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/admin/users
   * Create new user with bcrypt hashed password
   */
  static async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { institutional_id, name, email, password, role, committee_id } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { institutional_id },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'User with this institutional_id or email already exists'
        });
      }

      // Hash password with bcrypt (cost 12 per spec)
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        institutional_id,
        name,
        email,
        password_hash: passwordHash,
        role,
        committee_id: committee_id || null,
        is_active: true
      });

      res.status(201).json({
        message: 'User created successfully',
        user: {
          user_id: user.user_id,
          institutional_id: user.institutional_id,
          name: user.name,
          email: user.email,
          role: user.role,
          committee_id: user.committee_id
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/admin/users/:id
   * Update user: role, committee_id, is_active (soft delete)
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, committee_id, is_active } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update allowed fields only
      if (role) user.role = role;
      if (committee_id !== undefined) user.committee_id = committee_id || null;
      if (is_active !== undefined) user.is_active = is_active;

      await user.save();

      res.status(200).json({
        message: 'User updated successfully',
        user: {
          user_id: user.user_id,
          institutional_id: user.institutional_id,
          name: user.name,
          email: user.email,
          role: user.role,
          committee_id: user.committee_id,
          is_active: user.is_active
        }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/committees
   * List all committees
   */
  static async listCommittees(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Committee.findAndCountAll({
        include: [
          {
            model: User,
            attributes: ['name', 'email'],
            as: 'headUser',
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        committees: rows
      });
    } catch (error) {
      console.error('List committees error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /api/admin/committees
   * Create new committee
   */
  static async createCommittee(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, category_tag, head_user_id, email_alias } = req.body;

      // Verify head user exists
      const headUser = await User.findByPk(head_user_id);
      if (!headUser) {
        return res.status(404).json({ error: 'Head user not found' });
      }

      // Check if committee name already exists
      const existingCommittee = await Committee.findOne({
        where: { name }
      });

      if (existingCommittee) {
        return res.status(400).json({
          error: 'Committee with this name already exists'
        });
      }

      const committee = await Committee.create({
        name,
        category_tag,
        head_user_id,
        email_alias: email_alias || null
      });

      res.status(201).json({
        message: 'Committee created successfully',
        committee
      });
    } catch (error) {
      console.error('Create committee error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/admin/committees/:id
   * Update committee
   */
  static async updateCommittee(req, res) {
    try {
      const { id } = req.params;
      const { name, category_tag, head_user_id, email_alias } = req.body;

      const committee = await Committee.findByPk(id);
      if (!committee) {
        return res.status(404).json({ error: 'Committee not found' });
      }

      // Update allowed fields
      if (name) committee.name = name;
      if (category_tag) committee.category_tag = category_tag;
      if (head_user_id) {
        // Verify head user exists
        const headUser = await User.findByPk(head_user_id);
        if (!headUser) {
          return res.status(404).json({ error: 'Head user not found' });
        }
        committee.head_user_id = head_user_id;
      }
      if (email_alias !== undefined) committee.email_alias = email_alias || null;

      await committee.save();

      res.status(200).json({
        message: 'Committee updated successfully',
        committee
      });
    } catch (error) {
      console.error('Update committee error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/audit-logs
   * Get audit logs with pagination and filtering
   * Query params: page, limit, actor_id, action_type, entity_type, date_from, date_to
   */
  static async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 50, actor_id, action_type, entity_type, date_from, date_to } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};

      if (actor_id) whereClause.actor_id = actor_id;
      if (action_type) whereClause.action_type = action_type;
      if (entity_type) whereClause.entity_type = entity_type;

      // Date range filtering
      if (date_from || date_to) {
        whereClause.logged_at = {};
        if (date_from) {
          whereClause.logged_at[Op.gte] = new Date(date_from);
        }
        if (date_to) {
          whereClause.logged_at[Op.lte] = new Date(date_to);
        }
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['name', 'email', 'role'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['logged_at', 'DESC']]
      });

      res.status(200).json({
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        logs: rows
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/admin/audit-logs/export
   * Export audit logs to CSV
   */
  static async exportAuditLogs(req, res) {
    try {
      const { actor_id, action_type, entity_type, date_from, date_to } = req.query;

      const whereClause = {};
      if (actor_id) whereClause.actor_id = actor_id;
      if (action_type) whereClause.action_type = action_type;
      if (entity_type) whereClause.entity_type = entity_type;

      if (date_from || date_to) {
        whereClause.logged_at = {};
        if (date_from) {
          whereClause.logged_at[Op.gte] = new Date(date_from);
        }
        if (date_to) {
          whereClause.logged_at[Op.lte] = new Date(date_to);
        }
      }

      const logs = await AuditLog.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['name', 'email'],
            required: false
          }
        ],
        order: [['logged_at', 'DESC']]
      });

      // Generate CSV
      const csv = this._generateCSV(logs);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
      res.send(csv);
    } catch (error) {
      console.error('Export audit logs error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Helper: Generate CSV from audit logs
   */
  static _generateCSV(logs) {
    const headers = ['Log ID', 'Actor', 'Email', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Timestamp'];
    const rows = logs.map(log => [
      log.log_id,
      log.User?.name || 'System',
      log.User?.email || 'N/A',
      log.action_type,
      log.entity_type,
      log.entity_id || 'N/A',
      log.ip_address || 'N/A',
      log.logged_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * GET /api/admin/routing-queue
   * Get complaints awaiting manual routing (AI confidence < 0.65)
   */
  static async getRoutingQueue(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows } = await Complaint.findAndCountAll({
        where: {
          [Op.or]: [
            { ai_confidence: { [Op.lt]: 0.65 } },
            { ai_confidence: null }
          ]
        },
        include: [
          {
            model: Committee,
            attributes: ['name', 'category_tag']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['submitted_at', 'DESC']]
      });

      res.status(200).json({
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        queue: rows
      });
    } catch (error) {
      console.error('Get routing queue error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/admin/complaints/:id/route
   * Manually assign committee to complaint
   */
  static async manuallyRouteComplaint(req, res) {
    try {
      const { id } = req.params;
      const { committee_id } = req.body;
      const { user_id } = req.user;

      if (!committee_id) {
        return res.status(400).json({ error: 'committee_id is required' });
      }

      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return res.status(404).json({ error: 'Complaint not found' });
      }

      // Verify committee exists
      const committee = await Committee.findByPk(committee_id);
      if (!committee) {
        return res.status(404).json({ error: 'Committee not found' });
      }

      complaint.committee_id = committee_id;
      complaint.status = 'assigned';
      await complaint.save();

      // Log action in audit log
      await AuditLog.create({
        actor_id: user_id,
        action_type: 'MANUAL_ROUTE',
        entity_type: 'complaint',
        entity_id: id,
        metadata: {
          previous_committee: null,
          new_committee: committee_id
        }
      });

      res.status(200).json({
        message: 'Complaint manually routed successfully',
        complaint
      });
    } catch (error) {
      console.error('Manual routing error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AdminController;
