const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  complaint_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'NULL for anonymous complaints - CRITICAL SECURITY REQUIREMENT'
  },
  anon_token_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'SHA-256 hash of token. NEVER store raw token.'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('P1', 'P2', 'P3', 'P4'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'assigned', 'in_progress', 'waiting_student', 'resolved', 'closed', 'escalated'),
    allowNull: false,
    defaultValue: 'submitted'
  },
  committee_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true
  },
  is_anonymous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  ai_confidence: {
    type: DataTypes.DECIMAL(4, 3),
    allowNull: true
  },
  is_duplicate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sla_deadline: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'complaints',
  timestamps: false
});

module.exports = Complaint;
