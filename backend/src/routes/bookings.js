const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Booking, UserPackage, User } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Get current user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Auto-delete past bookings for this user
    const today = new Date().toISOString().split('T')[0];
    await Booking.destroy({
      where: {
        student_id: req.user.id,
        lesson_date: {
          [Op.lt]: today
        }
      }
    });
    
    const items = await Booking.findAll({ 
      where: { student_id: req.user.id }, 
      order: [['lesson_date', 'DESC'], ['start_time', 'DESC']] 
    });
    res.json({ success: true, data: items });
  } catch (e) {
    console.error('Fetch bookings error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, time, instructor_name, notes, duration_minutes, user_package_id, payment_method } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date and time are required' 
      });
    }

    // Check if the booking date/time is in the past
    try {
      // Ensure time has seconds format (HH:MM:SS)
      const timeWithSeconds = time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
      const bookingDateTime = new Date(`${date}T${timeWithSeconds}`);
      const now = new Date();

      // Check if date is valid
      if (!isNaN(bookingDateTime.getTime()) && bookingDateTime <= now) {
        return res.status(400).json({
          success: false,
          message: 'Cannot book lessons for past dates or times. Please select a future time slot.'
        });
      }
    } catch (dateError) {
      // If date parsing fails, log it but continue (don't block the booking)
      console.error('Date validation error:', dateError);
    }

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

    // Validate package if provided
    let userPackage = null;
    if (user_package_id) {
      userPackage = await UserPackage.findOne({
        where: { 
          id: user_package_id,
          user_id: req.user.id
        }
      });

      if (!userPackage) {
        return res.status(404).json({ 
          success: false, 
          message: 'Package not found or not available' 
        });
      }

      if (!userPackage.hasRemainingLessons()) {
        return res.status(400).json({ 
          success: false, 
          message: 'No lessons remaining in this package' 
        });
      }

      if (userPackage.isExpired()) {
        return res.status(400).json({ 
          success: false, 
          message: 'This package has expired' 
        });
      }
    }

    // Calculate end_time based on duration
    const [hours, minutes] = time.split(':');
    const startTime = new Date(`2000-01-01T${time}:00`);
    const endTime = new Date(startTime.getTime() + (duration_minutes || 60) * 60000);
    const end_time = endTime.toTimeString().slice(0, 5);

    // Create the booking
    const booking = await Booking.create({
      student_id: req.user.id,
      lesson_date: date,
      start_time: time,
      end_time: end_time,
      lesson_type: 'driving', // Default to driving lesson
      instructor_id: null, // Can be assigned later by admin
      notes: notes || '',
      status: 'pending', // Changed from 'scheduled' to match DB enum
      package_id: user_package_id || null
    });

    // Deduct one lesson from the package if provided
    if (userPackage) {
      await userPackage.useLesson();
    }

    // Send confirmation email to student
    try {
      await emailService.sendBookingConfirmationEmail(req.user, booking);
    } catch (emailError) {
      console.error('Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendAdminBookingNotification(req.user, booking);
    } catch (emailError) {
      console.error('Failed to send admin booking notification:', emailError);
      // Don't fail the booking if email fails
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create booking',
      error: error.message 
    });
  }
});

// Update booking
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, instructor_name, notes, duration_minutes, payment_method } = req.body;

    const booking = await Booking.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if the updated booking date/time is in the past
    try {
      const updatedDate = date || booking.date;
      const updatedTime = time || booking.time;
      // Ensure time has seconds format (HH:MM:SS)
      const timeWithSeconds = updatedTime.includes(':') && updatedTime.split(':').length === 2 ? `${updatedTime}:00` : updatedTime;
      const bookingDateTime = new Date(`${updatedDate}T${timeWithSeconds}`);
      const now = new Date();

      // Check if date is valid
      if (!isNaN(bookingDateTime.getTime()) && bookingDateTime <= now) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update booking to a past date or time. Please select a future time slot.'
        });
      }
    } catch (dateError) {
      // If date parsing fails, log it but continue (don't block the update)
      console.error('Date validation error on update:', dateError);
    }

    await booking.update({
      date: date || booking.date,
      time: time || booking.time,
      instructor_name: instructor_name || booking.instructor_name,
      notes: notes || booking.notes,
      duration_minutes: duration_minutes || booking.duration_minutes,
      payment_method: payment_method || booking.payment_method
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update booking',
      error: error.message 
    });
  }
});

// Cancel booking
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    await booking.update({ status: 'cancelled' });

    res.json({ success: true, data: booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel booking',
      error: error.message 
    });
  }
});

// Delete booking
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOne({
      where: { id, user_id: req.user.id }
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    await booking.destroy();

    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete booking',
      error: error.message 
    });
  }
});

// Admin routes
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const items = await Booking.findAll({ 
      include: [{ model: require('../models').User, attributes: ['first_name', 'last_name', 'email'] }],
      order: [['date', 'DESC'], ['time', 'DESC']] 
    });
    res.json({ success: true, data: items });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch all bookings' });
  }
});

module.exports = router;