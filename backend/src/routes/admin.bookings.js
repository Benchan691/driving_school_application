const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Booking, User } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// All routes require admin
router.use(authenticateToken, requireRole(['admin']));

// Auto-delete past bookings function
const autoDeletePastBookings = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    
    // Find and delete bookings that are past their date
    const deletedCount = await Booking.destroy({
      where: {
        date: {
          [Op.lt]: today // Less than today
        }
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🗑️ Auto-deleted ${deletedCount} past booking(s)`);
    }
    
    return deletedCount;
  } catch (error) {
    console.error('Error auto-deleting past bookings:', error);
    return 0;
  }
};

// List all bookings (optionally filter by status/date)
router.get('/', async (req, res) => {
  try {
    // Auto-delete past bookings before fetching current ones
    await autoDeletePastBookings();
    
    const { status, date } = req.query;
    const where = {};
    if (status) where.status = status;
    if (date) where.date = date;
    const items = await Booking.findAll({ 
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'], as: 'user' }],
      where, 
      order: [['date', 'DESC'], ['time', 'DESC']] 
    });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Verify a booking
router.put('/:id/verify', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'], as: 'user' }]
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    await booking.update({ is_verified: true });
    
    // Send verification email to student
    try {
      await emailService.sendBookingVerifiedEmail(booking.user, booking);
    } catch (emailError) {
      console.error('Failed to send booking verification email:', emailError);
      // Don't fail the verification if email fails
    }
    
    res.json({ success: true, data: booking });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to verify booking' });
  }
});

// Update booking details
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const { date, time, instructor_name, notes, status, duration_minutes } = req.body;
    
    // If changing date/time, check for conflicts (exclude current booking and cancelled bookings)
    if (date && time && (date !== booking.date || time !== booking.time) && status !== 'cancelled') {
      const existingBooking = await Booking.findOne({
        where: {
          date,
          time,
          id: {
            [Op.ne]: booking.id // Exclude current booking
          },
          status: {
            [Op.ne]: 'cancelled' // Exclude cancelled bookings
          }
        }
      });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked by another student. Please choose a different time.'
        });
      }
    }
    
    await booking.update({ date, time, instructor_name, notes, status, duration_minutes });
    res.json({ success: true, data: booking });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
});

// Create booking (on behalf of user)
router.post('/', async (req, res) => {
  try {
    const { user_id, date, time, instructor_name, notes, duration_minutes } = req.body;
    if (!user_id || !date || !time) return res.status(400).json({ success: false, message: 'user_id, date and time are required' });
    
    // Check if time slot is available (exclude cancelled bookings)
    const existingBooking = await Booking.findOne({
      where: {
        date,
        time,
        status: {
          [Op.ne]: 'cancelled' // Exclude cancelled bookings
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different time.'
      });
    }
    
    const created = await Booking.create({ user_id, date, time, instructor_name, notes, duration_minutes: Number(duration_minutes) === 90 ? 90 : 60, status: 'scheduled' });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// Reject a booking
router.put('/:id/reject', async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email'], as: 'user' }]
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    await booking.update({ 
      is_verified: false, 
      status: 'cancelled',
      rejection_reason: rejection_reason || 'No reason provided'
    });
    
    // Send rejection email to student
    try {
      await emailService.sendBookingRejectedEmail(booking.user, booking);
    } catch (emailError) {
      console.error('Failed to send booking rejection email:', emailError);
      // Don't fail the rejection if email fails
    }
    
    res.json({ success: true, data: booking });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to reject booking' });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    await booking.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete booking' });
  }
});

module.exports = router;


