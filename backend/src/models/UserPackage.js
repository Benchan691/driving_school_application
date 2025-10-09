const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPackage = sequelize.define('UserPackage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  package_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  package_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total_lessons: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  lessons_used: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lessons_remaining: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  payment_intent_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  purchase_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.00
  }
}, {
  tableName: 'user_packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
UserPackage.prototype.useLesson = async function() {
  if (this.lessons_remaining <= 0) {
    throw new Error('No lessons remaining');
  }
  
  this.lessons_used += 1;
  this.lessons_remaining -= 1;
  
  await this.save();
  return this;
};

UserPackage.prototype.hasRemainingLessons = function() {
  return this.lessons_remaining > 0;
};

module.exports = UserPackage;

