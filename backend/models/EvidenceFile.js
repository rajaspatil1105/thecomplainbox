const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EvidenceFile = sequelize.define('EvidenceFile', {
  file_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  complaint_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  file_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['jpg', 'jpeg', 'png', 'mp4', 'pdf']]
    }
  },
  file_size_kb: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      max: 10240
    }
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'evidence_files',
  timestamps: false
});

module.exports = EvidenceFile;
