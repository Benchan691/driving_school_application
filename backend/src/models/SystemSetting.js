const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
  key: {
    type: DataTypes.STRING(120),
    primaryKey: true,
    allowNull: false,
  },
  value_encrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  enc_iv: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  enc_tag: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
}, {
  tableName: 'system_settings',
});

module.exports = SystemSetting;

