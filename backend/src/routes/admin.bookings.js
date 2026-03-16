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
        lesson_date: {
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
    if (date) where.lesson_date = date;
    const items = await Booking.findAll({ 
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'], as: 'student' }],
      where, 
      order: [['lesson_date', 'DESC'], ['start_time', 'DESC']] 
    });
    res.json({ success: true, data: items });
  } catch (e) {
    console.error('Failed to fetch bookings:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Verify a booking
router.put('/:id/verify', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'], as: 'student' }]
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    await booking.update({ status: 'confirmed' });
    
    // Send verification email to student or guest
    try {
      const recipient = booking.student || (booking.guest_email ? { name: booking.guest_name, email: booking.guest_email } : null);
      if (recipient) {
        await emailService.sendBookingVerifiedEmail(recipient, booking);
      }
    } catch (emailError) {
      console.error('Failed to send booking verification email:', emailError);
      // Don't fail the verification if email fails
    }
    
    res.json({ success: true, data: booking });
  } catch (e) {
    console.error('Failed to verify booking:', e);
    res.status(500).json({ success: false, message: 'Failed to verify booking' });
  }
});

// Update booking details
router.put('/:id', async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    const { date, time, instructor_name, notes, status, duration_minutes, payment_method } = req.body;
    
    const updateData = {};
    if (date) updateData.lesson_date = date;
    if (time) {
      updateData.start_time = time;
      // Calculate end_time if duration is provided
      if (duration_minutes) {
        const startTime = new Date(`2000-01-01T${time}:00`);
        const endTime = new Date(startTime.getTime() + duration_minutes * 60000);
        updateData.end_time = endTime.toTimeString().slice(0, 8);
      }
    }
    if (notes) updateData.notes = notes;
    if (status) updateData.status = status;
    
    // If changing date/time, check for conflicts (exclude current booking and cancelled bookings)
    if (date && time && (date !== booking.lesson_date || time !== booking.start_time) && status !== 'cancelled') {
      const existingBooking = await Booking.findOne({
        where: {
          lesson_date: date,
          start_time: time,
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
    
    await booking.update(updateData);
    res.json({ success: true, data: booking });
  } catch (e) {
    console.error('Failed to update booking:', e);
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
        lesson_date: date,
        start_time: time,
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
    
    // Calculate end_time
    const duration = Number(duration_minutes) || 60;
    const startTime = new Date(`2000-01-01T${time}:00`);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const end_time = endTime.toTimeString().slice(0, 8);
    
    const created = await Booking.create({ 
      student_id: user_id, 
      lesson_date: date, 
      start_time: time,
      end_time: end_time,
      lesson_type: 'driving',
      notes: notes || '', 
      status: 'pending'
    });
    res.status(201).json({ success: true, data: created });
  } catch (e) {
    console.error('Failed to create booking:', e);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// Reject a booking
router.put('/:id/reject', async (req, res) => {
  try {
    const { rejection_reason } = req.body;
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'name', 'email', 'phone'], as: 'student' }]
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    await booking.update({ 
      status: 'cancelled',
      cancellation_reason: rejection_reason || 'No reason provided'
    });
    
    // Send rejection email to student or guest
    try {
      const recipient = booking.student || (booking.guest_email ? { name: booking.guest_name, email: booking.guest_email } : null);
      if (recipient) {
        await emailService.sendBookingRejectedEmail(recipient, booking);
      }
    } catch (emailError) {
      console.error('Failed to send booking rejection email:', emailError);
      // Don't fail the rejection if email fails
    }
    
    res.json({ success: true, data: booking });
  } catch (e) {
    console.error('Failed to reject booking:', e);
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


