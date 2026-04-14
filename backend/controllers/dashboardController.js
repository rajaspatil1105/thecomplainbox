const Complaint = require('../models/Complaint');
const Committee = require('../models/Committee');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Dashboard Controller
 * Handles dashboard data retrieval for all roles with role-based filtering
 */

class DashboardController {
  /**
   * GET /api/dashboard/student
   * Student's own complaints with SLA deadline for countdown
   */
  static async getStudentDashboard(req, res) {
    try {
      const { user_id } = req.user;

      const complaints = await Complaint.findAll({
        where: {
          student_id: user_id
        },
        include: [
          {
            model: Committee,
            attributes: ['name', 'category_tag']
          }
        ],
        attributes: [
          'complaint_id',
          'title',
          'status',
          'priority',
          'sla_deadline',
          'submitted_at',
          'severity',
          'category'
        ],
        order: [['submitted_at', 'DESC']]
      });

      res.status(200).json({
        total: complaints.length,
        complaints
      });
    } catch (error) {
      console.error('Student dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/dashboard/authority
   * Committee inbox with filtering by severity, category, sla_status, date range
   * Query params: severity, category, sla_status (overdue/breached), date_from, date_to
   */
  static async getAuthorityDashboard(req, res) {
    try {
      const { user_id, committee_id } = req.user;
      const { severity, category, sla_status, date_from, date_to } = req.query;

      // Build where clause
      const whereClause = {
        committee_id: committee_id,
        status: {
          [Op.notIn]: ['resolved', 'closed']
        }
      };

      // Filter by severity
      if (severity) {
        whereClause.severity = severity;
      }

      // Filter by category
      if (category) {
        whereClause.category = category;
      }

      // Filter by SLA status (overdue = NOW() > sla_deadline)
      if (sla_status === 'overdue') {
        whereClause.sla_deadline = {
          [Op.lt]: new Date()
        };
      } else if (sla_status === 'breached') {
        whereClause.status = 'escalated';
      }

      // Filter by date range
      if (date_from || date_to) {
        whereClause.submitted_at = {};
        if (date_from) {
          whereClause.submitted_at[Op.gte] = new Date(date_from);
        }
        if (date_to) {
          whereClause.submitted_at[Op.lte] = new Date(date_to);
        }
      }

      const complaints = await Complaint.findAll({
        where: whereClause,
        attributes: [
          'complaint_id',
          'title',
          'status',
          'severity',
          'priority',
          'category',
          'sla_deadline',
          'submitted_at',
          'assigned_to',
          'is_anonymous',
          'ai_confidence'
        ],
        order: [['submitted_at', 'DESC']]
      });

      res.status(200).json({
        total: complaints.length,
        complaints
      });
    } catch (error) {
      console.error('Authority dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/dashboard/admin
   * Admin analytics: total, open/closed, resolution times, daily trends, satisfaction
   */
  static async getAdminDashboard(req, res) {
    try {
      // Total complaints count
      const totalComplaints = await Complaint.count();

      // Open vs Closed counts
      const openComplaints = await Complaint.count({
        where: {
          status: {
            [Op.notIn]: ['resolved', 'closed']
          }
        }
      });

      const closedComplaints = await Complaint.count({
        where: {
          status: {
            [Op.in]: ['resolved', 'closed']
          }
        }
      });

      // Average resolution time overall
      const resolutionTimeOverall = await Complaint.findOne({
        attributes: [
          [
            sequelize.fn(
              'AVG',
              sequelize.literal('TIMESTAMPDIFF(HOUR, submitted_at, resolved_at)')
            ),
            'avg_resolution_hours'
          ]
        ],
        where: {
          resolved_at: {
            [Op.not]: null
          }
        },
        raw: true
      });

      // Resolution time per committee
      const resolutionTimeByCommittee = await Complaint.findAll({
        attributes: [
          'committee_id',
          [
            sequelize.fn(
              'AVG',
              sequelize.literal('TIMESTAMPDIFF(HOUR, submitted_at, resolved_at)')
            ),
            'avg_resolution_hours'
          ],
          [sequelize.fn('COUNT', sequelize.col('complaint_id')), 'complaint_count']
        ],
        where: {
          resolved_at: {
            [Op.not]: null
          }
        },
        include: [
          {
            model: Committee,
            attributes: ['name'],
            required: false
          }
        ],
        group: ['committee_id'],
        raw: true,
        subQuery: false
      });

      // Complaint counts per day for last 30/60/90 days
      const today = new Date();
      const complaints30Days = await Complaint.count({
        where: {
          submitted_at: {
            [Op.gte]: new Date(today.setDate(today.getDate() - 30))
          }
        }
      });

      const complaints60Days = await Complaint.count({
        where: {
          submitted_at: {
            [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 60))
          }
        }
      });

      const complaints90Days = await Complaint.count({
        where: {
          submitted_at: {
            [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 90))
          }
        }
      });

      // Average satisfaction (feedback rating)
      const avgSatisfaction = await Feedback.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
        ],
        raw: true
      });

      // Daily complaint trend for last 30 days
      const dailyTrend = await sequelize.query(`
        SELECT DATE(submitted_at) as date, COUNT(*) as count
        FROM complaints
        WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(submitted_at)
        ORDER BY date ASC
      `, { type: sequelize.QueryTypes.SELECT });

      res.status(200).json({
        summary: {
          total_complaints: totalComplaints,
          open_complaints: openComplaints,
          closed_complaints: closedComplaints,
          open_percentage: totalComplaints > 0 ? ((openComplaints / totalComplaints) * 100).toFixed(2) : 0
        },
        resolution_time: {
          overall_hours: resolutionTimeOverall.avg_resolution_hours || 0,
          by_committee: resolutionTimeByCommittee
        },
        complaint_trends: {
          last_30_days: complaints30Days,
          last_60_days: complaints60Days,
          last_90_days: complaints90Days,
          daily_trend: dailyTrend
        },
        satisfaction: {
          avg_rating: avgSatisfaction.avg_rating || 0
        }
      });
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /api/dashboard/principal
   * Principal read-only dashboard: escalated list, per-committee stats, satisfaction
   * CRITICAL: Principal has zero write access
   */
  static async getPrincipalDashboard(req, res) {
    try {
      // Escalated complaints list
      const escalatedComplaints = await Complaint.findAll({
        where: {
          status: 'escalated'
        },
        attributes: [
          'complaint_id',
          'title',
          'severity',
          'priority',
          'sla_deadline',
          'submitted_at',
          'student_id',
          'is_anonymous'
        ],
        include: [
          {
            model: Committee,
            attributes: ['name', 'category_tag']
          }
        ],
        order: [['submitted_at', 'DESC']]
      });

      // Per-committee open count
      const committeeStats = await Complaint.findAll({
        attributes: [
          'committee_id',
          [sequelize.fn('COUNT', sequelize.col('complaint_id')), 'open_count'],
          [
            sequelize.fn(
              'AVG',
              sequelize.literal('TIMESTAMPDIFF(HOUR, submitted_at, resolved_at)')
            ),
            'avg_resolution_hours'
          ]
        ],
        where: {
          status: {
            [Op.notIn]: ['resolved', 'closed']
          }
        },
        include: [
          {
            model: Committee,
            attributes: ['name', 'category_tag'],
            required: true
          }
        ],
        group: ['committee_id'],
        raw: true,
        subQuery: false
      });

      // Average satisfaction by committee
      const satisfactionByCommittee = await sequelize.query(`
        SELECT 
          c.committee_id,
          c.name,
          AVG(f.rating) as avg_rating,
          COUNT(f.feedback_id) as feedback_count
        FROM committees c
        LEFT JOIN complaints comp ON c.committee_id = comp.committee_id
        LEFT JOIN feedback f ON comp.complaint_id = f.complaint_id
        GROUP BY c.committee_id, c.name
      `, { type: sequelize.QueryTypes.SELECT });

      // Overall metrics
      const totalComplaints = await Complaint.count();
      const openComplaints = await Complaint.count({
        where: {
          status: {
            [Op.notIn]: ['resolved', 'closed']
          }
        }
      });

      res.status(200).json({
        summary: {
          total_complaints: totalComplaints,
          open_complaints: openComplaints,
          escalated_complaints: escalatedComplaints.length
        },
        escalated_list: escalatedComplaints,
        committee_stats: committeeStats,
        satisfaction_by_committee: satisfactionByCommittee
      });
    } catch (error) {
      console.error('Principal dashboard error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = DashboardController;
