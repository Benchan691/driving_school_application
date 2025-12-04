const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'resolved'),
    defaultValue: 'new'
  }
}, {
  tableName: 'contact_messages',
  underscored: true
});

module.exports = ContactMessage;


