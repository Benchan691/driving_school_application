const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  number_of_lessons: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  duration_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  discount_percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  is_popular: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  package_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'standard'
  },
  validity_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 365
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'lesson_packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Package;

