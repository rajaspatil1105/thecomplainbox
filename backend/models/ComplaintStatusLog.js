const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplaintStatusLog = sequelize.define('ComplaintStatusLog', {
  log_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  complaint_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  changed_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  old_status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  new_status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  changed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'complaint_status_log',
  timestamps: false
});

module.exports = ComplaintStatusLog;
