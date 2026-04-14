require('dotenv').config();
const cron = require('node-cron');
const sequelize = require('../config/database');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Committee = require('../models/Committee');
const ComplaintStatusLog = require('../models/ComplaintStatusLog');
const EmailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

/**
 * Escalation Background Job
 * Runs every 30 minutes
 * Checks for SLA breaches and escalates complaints
 */

class EscalationJob {
  /**
   * Initialize and start the job
   */
  static start() {
    // Run every 30 minutes (0 and 30)
    const job = cron.schedule('0,30 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Running escalation job...`);
      await this.processEscalations();
    });

    console.log('✓ Escalation job scheduled (every 30 minutes)');
    return job;
  }

  /**
   * Process complaints that have breached SLA
   */
  static async processEscalations() {
    const transaction = await sequelize.transaction();

    try {
      // Find complaints that have breached SLA
      const now = new Date();
      
      const breachedComplaints = await Complaint.findAll({
        where: {
          status: ['under_review', 'assigned', 'in_progress'],
          resolved_at: null,
          // SLA deadline must be in the past
          sla_deadline: {
            [sequelize.Sequelize.Op.lt]: now
          }
        },
        transaction
      });

      console.log(`Found ${breachedComplaints.length} SLA-breached complaints`);

      for (const complaint of breachedComplaints) {
        // Don't re-escalate if already escalated
        if (complaint.status === 'escalated') {
          continue;
        }

        // Update status to escalated
        await complaint.update(
          { status: 'escalated' },
          { transaction }
        );

        // Create status log entry
        await ComplaintStatusLog.create({
          log_id: uuidv4(),
          complaint_id: complaint.complaint_id,
          changed_by: null, // System action
          old_status: complaint.status,
          new_status: 'escalated',
          note: 'Automatically escalated: SLA deadline breached',
          changed_at: now
        }, { transaction });

        // Identify recipients for escalation notification
        const recipients = [];

        // Get committee head
        if (complaint.committee_id) {
          const committee = await Committee.findByPk(
            complaint.committee_id,
            { transaction }
          );

          if (committee) {
            const head = await User.findByPk(committee.head_user_id, { transaction });
            if (head && head.email) {
              recipients.push(head.email);
            }
            
            if (committee.email_alias) {
              recipients.push(committee.email_alias);
            }
          }
        }

        // Get admin
        const admin = await User.findOne({
          where: { role: 'admin' },
          transaction
        });
        if (admin && admin.email) {
          recipients.push(admin.email);
        }

        // For P1 complaints, also notify principal
        if (complaint.priority === 'P1') {
          const principal = await User.findOne({
            where: { role: 'principal' },
            transaction
          });
          if (principal && principal.email) {
            recipients.push(principal.email);
          }
        }

        // Send escalation emails
        if (recipients.length > 0) {
          await EmailService.sendEscalationEmail(
            [...new Set(recipients)], // Remove duplicates
            complaint.title,
            complaint.priority
          );

          console.log(`Escalated complaint ${complaint.complaint_id} to ${recipients.length} recipients`);
        }
      }

      await transaction.commit();
      console.log('✓ Escalation job completed');
    } catch (error) {
      await transaction.rollback();
      console.error('Escalation job error:', error);
    }
  }
}

module.exports = EscalationJob;
