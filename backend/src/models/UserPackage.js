const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPackage = sequelize.define('user_packages', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  package_id: {
    type: DataTypes.INTEGER,
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
  expiry_date: {
    type: DataTypes.DATE,
    allowNull: false
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

UserPackage.prototype.isExpired = function() {
  return new Date() > new Date(this.expiry_date);
};

module.exports = UserPackage;

