const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  student_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'student_id'
  },
  guest_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  guest_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  guest_phone: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  instructor_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  vehicle_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  lesson_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'lesson_date'
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  lesson_type: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'),
    defaultValue: 'pending'
  },
  package_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  student_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  instructor_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rescheduled_from: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Booking;