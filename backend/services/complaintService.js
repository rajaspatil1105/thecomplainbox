require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const Complaint = require('../models/Complaint');
const ComplaintStatusLog = require('../models/ComplaintStatusLog');
const Committee = require('../models/Committee');
const User = require('../models/User');
const EvidenceFile = require('../models/EvidenceFile');
const redisClient = require('../config/redis');
const AIService = require('./aiService');
const EmailService = require('./emailService');
const sequelize = require('../config/database');

/**
 * Complaint Service
 * Handles complaint lifecycle: submission, routing, status updates, escalation
 */

class ComplaintService {
  /**
   * Submit new complaint with AI analysis
   * CRITICAL REQUIREMENTS:
   * - Anonymous: NEVER store student_id in DB, only SHA-256 hash of token
   * - Return raw token ONCE in response
   * - Run TF-IDF check BEFORE Gemini call
   * - Compute SLA deadline server-side
   */
  static async submitComplaint(studentId, complaintData, uploadedFiles = []) {
    const transaction = await sequelize.transaction();

    try {
      const {
        title,
        description,
        isAnonymous,
        category: manualCategory
      } = complaintData;

      // Validate description length
      if (description.length < parseInt(process.env.COMPLAINT_MIN_DESCRIPTION_LENGTH || 30)) {
        throw new Error(`Description must be at least ${process.env.COMPLAINT_MIN_DESCRIPTION_LENGTH || 30} characters`);
      }

      // Generate anonymous token if needed
      let anonToken = null;
      let anonTokenHash = null;

      if (isAnonymous) {
        anonToken = uuidv4();
        anonTokenHash = crypto.createHash('sha256').update(anonToken).digest('hex');
      }

      // 1. Run TF-IDF duplicate check BEFORE Gemini
      const duplicateCheck = await AIService.checkDuplicate(description);

      const hasManualCategory = typeof manualCategory === 'string' && manualCategory.trim().length > 0;
      let complaintCategory = hasManualCategory
        ? manualCategory.trim().toLowerCase()
        : 'other';
      let severity = 'medium';
      let priority = 'P3';
      let aiConfidence = 0;
      let IsDuplicate = duplicateCheck.is_duplicate;

      // 2. If NOT duplicate, call Gemini for analysis
      if (!IsDuplicate) {
        const aiAnalysis = await AIService.analyzeComplaint(
          description,
          uploadedFiles.map(f => f.path)
        );

        if (aiAnalysis) {
          if (!hasManualCategory && aiAnalysis.category) {
            complaintCategory = String(aiAnalysis.category).trim().toLowerCase();
          }
          severity = aiAnalysis.severity;
          aiConfidence = aiAnalysis.confidence;

          // Map severity to priority
          priority = this.mapSeverityToPriority(severity);
        }
      }

      // 3. Compute SLA deadline using the same submission timestamp to avoid timezone skew
      const submittedAt = new Date();
      const slaDeadline = await this.computeSLADeadline(severity, submittedAt);

      // 4. Create complaint record
      const complaintId = uuidv4();
      const complaint = await Complaint.create({
        complaint_id: complaintId,
        student_id: isAnonymous ? null : studentId, // CRITICAL: NULL for anonymous
        anon_token_hash: anonTokenHash, // Store only hash
        title,
        description,
        category: complaintCategory,
        severity,
        priority,
        status: 'submitted',
        is_anonymous: isAnonymous,
        ai_confidence: aiConfidence,
        is_duplicate: IsDuplicate,
        sla_deadline: slaDeadline,
        submitted_at: submittedAt
      }, { transaction });

      // 5. Store anonymous token in Redis (90 days TTL)
      if (isAnonymous && anonToken && anonTokenHash) {
        await redisClient.setEx(
          `anon_token:${anonTokenHash}`,
          90 * 24 * 60 * 60, // 90 days
          complaintId
        );
      }

      // 6. Upload evidence files
      const fileRecords = [];
      if (uploadedFiles && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          // Normalize file type (e.g., jpeg -> jpg, JSON -> lowercase, etc.)
          let fileType = file.mimetype.split('/')[1].toLowerCase();
          if (fileType === 'jpeg') fileType = 'jpg';
          
          const fileRecord = await EvidenceFile.create({
            file_id: uuidv4(),
            complaint_id: complaintId,
            uploaded_by: studentId,
            file_name: file.originalname,
            file_path: file.path,
            file_type: fileType,
            file_size_kb: Math.ceil(file.size / 1024)
          }, { transaction });

          fileRecords.push(fileRecord);
        }
      }

      // 7. Route complaint to committee based on complaint category
      const committee = await this.findCommitteeByCategory(complaintCategory);
      if (committee) {
        await complaint.update({
          committee_id: committee.committee_id
        }, { transaction });
      }

      // 8. Update TF-IDF cache
      await AIService.updateTFIDFCache(complaintId, description);

      await transaction.commit();

      // 9. Send notifications (best-effort)
      if (!isAnonymous) {
        const student = await User.findByPk(studentId);
        if (student) {
          try {
            await EmailService.sendComplaintSubmittedEmail(
              student.email,
              complaintId,
              false
            );
          } catch (notificationError) {
            console.error('Failed to send complaint submitted email:', notificationError.message);
          }
        }
      }

      // Send notification to committee
      if (complaint.committee_id) {
        const committee = await Committee.findByPk(complaint.committee_id);
        if (committee) {
          try {
            await EmailService.sendComplaintAssignedEmail(
              committee.email_alias || committee.name,
              title,
              committee.head_user_id
            );
          } catch (notificationError) {
            console.error('Failed to send complaint assignment email:', notificationError.message);
          }
        }
      }

      // Return response with token ONLY for anonymous complaints
      return {
        complaint_id: complaintId,
        status: 'submitted',
        anonymous_token: anonToken, // Return raw token ONCE
        anonymous_token_warning: anonToken ? 'SAVE THIS TOKEN. You will need it to track your complaint.' : null,
        message: 'Complaint submitted successfully'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Map severity to priority level
   */
  static mapSeverityToPriority(severity) {
    const mapping = {
      'critical': 'P1',
      'high': 'P2',
      'medium': 'P3',
      'low': 'P4'
    };
    return mapping[severity] || 'P3';
  }

  /**
   * Normalize category tags used for committee routing
   */
  static normalizeCategoryTag(category) {
    if (!category || typeof category !== 'string') {
      return null;
    }

    const normalized = category.trim().toLowerCase();
    const aliasMap = {
      infrastructure: 'hostel',
      harassment: 'ragging'
    };

    return aliasMap[normalized] || normalized;
  }

  /**
   * Compute SLA deadline via stored procedure
   */
  static async computeSLADeadline(severity, submittedAt) {
    try {
      const result = await sequelize.query(
        'CALL compute_sla_deadline(:severity, :submittedAt, @deadline)',
        {
          replacements: { severity, submittedAt },
          raw: true
        }
      );

      // Get the output parameter
      const deadlineResult = await sequelize.query('SELECT @deadline as deadline');
      return deadlineResult[0][0].deadline || new Date();
    } catch (error) {
      console.error('Error computing SLA deadline:', error);
      // Fallback: 48 hours
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 48);
      return deadline;
    }
  }

  /**
   * Find committee by category
   */
  static async findCommitteeByCategory(category) {
    const normalizedCategory = this.normalizeCategoryTag(category);

    if (!normalizedCategory || normalizedCategory === 'other') {
      return null;
    }

    return Committee.findOne({
      where: { category_tag: normalizedCategory }
    });
  }

  /**
   * Get complaint by ID with role-based access control
   */
  static async getComplaintById(complaintId, userId, userRole) {
    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // RBAC: Check access permissions
    if (userRole === 'student' && complaint.student_id !== userId) {
      throw new Error('Access denied');
    }

    if (userRole === 'committee_member' && complaint.committee_id !== null) {
      const user = await User.findByPk(userId);
      if (user.committee_id !== complaint.committee_id && userRole !== 'admin') {
        throw new Error('Access denied');
      }
    }

    return complaint;
  }

  /**
   * Update complaint status
   */
  static async updateComplaintStatus(complaintId, newStatus, note, changedById) {
    const transaction = await sequelize.transaction();

    try {
      const complaint = await Complaint.findByPk(complaintId);

      if (!complaint) {
        throw new Error('Complaint not found');
      }

      const oldStatus = complaint.status;

      // Update status
      await complaint.update({
        status: newStatus,
        resolved_at: (newStatus === 'closed' || newStatus === 'resolved') ? new Date() : complaint.resolved_at,
        assigned_to: complaint.assigned_to || changedById
      }, { transaction });

      // Trigger will auto-create status log entry
      // But we can also explicitly create for safety
      await ComplaintStatusLog.create({
        log_id: uuidv4(),
        complaint_id: complaintId,
        changed_by: changedById,
        old_status: oldStatus,
        new_status: newStatus,
        note,
        changed_at: new Date()
      }, { transaction });

      await transaction.commit();

      // Send notification to student (if not anonymous)
      if (!complaint.is_anonymous && complaint.student_id) {
        const student = await User.findByPk(complaint.student_id);
        if (student) {
          try {
            await EmailService.sendStatusUpdateEmail(
              student.email,
              complaint.title,
              newStatus
            );
          } catch (notificationError) {
            console.error('Failed to send status update email:', notificationError.message);
          }
        }
      }

      return complaint;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Escalate complaint
   */
  static async escalateComplaint(complaintId, admin_user_id) {
    try {
      const complaint = await Complaint.findByPk(complaintId);

      if (!complaint) {
        throw new Error('Complaint not found');
      }

      await complaint.update({
        status: 'escalated',
        assigned_to: complaint.assigned_to || admin_user_id
      });

      // Notify committee head and admin
      const recipients = [];

      if (complaint.committee_id) {
        const committee = await Committee.findByPk(complaint.committee_id);
        if (committee && committee.email_alias) {
          recipients.push(committee.email_alias);
        }
      }

      // For P1 complaints, also notify principal
      if (complaint.priority === 'P1') {
        const principal = await User.findOne({
          where: { role: 'principal' }
        });
        if (principal) {
          recipients.push(principal.email);
        }
      }

      // Send escalation emails
      if (recipients.length > 0) {
        try {
          await EmailService.sendEscalationEmail(
            recipients,
            complaint.title,
            complaint.priority
          );
        } catch (notificationError) {
          console.error('Failed to send escalation email:', notificationError.message);
        }
      }

      return complaint;
    } catch (error) {
      console.error('Escalation error:', error);
      throw error;
    }
  }

  /**
   * Track anonymous complaint by token
   */
  static async trackAnonymousComplaint(anonToken) {
    const tokenHash = crypto.createHash('sha256').update(anonToken).digest('hex');
    
    // Look up complaint ID from Redis
    const complaintId = await redisClient.get(`anon_token:${tokenHash}`);

    if (!complaintId) {
      throw new Error('Invalid or expired tracking token');
    }

    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    // Return safe public info only
    return {
      complaint_id: complaintId,
      title: complaint.title,
      status: complaint.status,
      submitted_at: complaint.submitted_at,
      resolved_at: complaint.resolved_at,
      sla_deadline: complaint.sla_deadline
    };
  }
}

module.exports = ComplaintService;
