const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Committee = sequelize.define('Committee', {
  committee_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  category_tag: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Must match Gemini output category'
  },
  head_user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  email_alias: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'committees',
  timestamps: false
});

module.exports = Committee;
