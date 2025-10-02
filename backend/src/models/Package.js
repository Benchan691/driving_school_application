const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Package = sequelize.define('packages', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  number_of_lessons: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
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
    type: DataTypes.DECIMAL(4, 1),
    allowNull: false,
    defaultValue: 1.0
  },
  validity_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 365
  },
  package_type: {
    type: DataTypes.ENUM('single', 'package', 'road_test'),
    allowNull: false,
    defaultValue: 'single'
  },
  is_popular: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true
  }
});

module.exports = Package;

