/**
 * Sequelize Model Associations
 * Define all model relationships in one place
 */

const User = require('./User');
const Committee = require('./Committee');
const Complaint = require('./Complaint');
const ComplaintStatusLog = require('./ComplaintStatusLog');
const EvidenceFile = require('./EvidenceFile');
const Feedback = require('./Feedback');
const AuditLog = require('./AuditLog');

/**
 * Initialize all associations
 */
function initializeAssociations() {
  // User - Committee relationship
  User.belongsTo(Committee, {
    foreignKey: 'committee_id',
    as: 'committee'
  });

  Committee.hasMany(User, {
    foreignKey: 'committee_id',
    as: 'members'
  });

  // Committee - Head User relationship
  Committee.belongsTo(User, {
    foreignKey: 'head_user_id',
    as: 'headUser'
  });

  User.hasMany(Committee, {
    foreignKey: 'head_user_id',
    as: 'headedCommittees'
  });

  // Complaint - User relationship
  Complaint.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  User.hasMany(Complaint, {
    foreignKey: 'student_id',
    as: 'complaints'
  });

  // Complaint - Committee relationship
  Complaint.belongsTo(Committee, {
    foreignKey: 'committee_id',
    as: 'committee'
  });

  Committee.hasMany(Complaint, {
    foreignKey: 'committee_id',
    as: 'assignedComplaints'
  });

  // Complaint - Assigned User relationship
  Complaint.belongsTo(User, {
    foreignKey: 'assigned_to',
    as: 'assignedUser'
  });

  User.hasMany(Complaint, {
    foreignKey: 'assigned_to',
    as: 'assignedComplaints'
  });

  // ComplaintStatusLog - Complaint relationship
  ComplaintStatusLog.belongsTo(Complaint, {
    foreignKey: 'complaint_id'
  });

  Complaint.hasMany(ComplaintStatusLog, {
    foreignKey: 'complaint_id',
    as: 'statusLogs'
  });

  // EvidenceFile - Complaint relationship
  EvidenceFile.belongsTo(Complaint, {
    foreignKey: 'complaint_id'
  });

  Complaint.hasMany(EvidenceFile, {
    foreignKey: 'complaint_id',
    as: 'evidenceFiles'
  });

  // Feedback - Complaint relationship
  Feedback.belongsTo(Complaint, {
    foreignKey: 'complaint_id'
  });

  Complaint.hasOne(Feedback, {
    foreignKey: 'complaint_id',
    as: 'feedback'
  });

  // Feedback - Student User relationship
  Feedback.belongsTo(User, {
    foreignKey: 'student_id',
    as: 'student'
  });

  User.hasMany(Feedback, {
    foreignKey: 'student_id',
    as: 'feedback'
  });

  // AuditLog - User relationship
  AuditLog.belongsTo(User, {
    foreignKey: 'actor_id',
    as: 'User'
  });

  User.hasMany(AuditLog, {
    foreignKey: 'actor_id',
    as: 'auditLogs'
  });
}

module.exports = {
  User,
  Committee,
  Complaint,
  ComplaintStatusLog,
  EvidenceFile,
  Feedback,
  AuditLog,
  initializeAssociations
};
