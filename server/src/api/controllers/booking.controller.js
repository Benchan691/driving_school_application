import Booking from '../models/booking.model.js';
import User from '../models/user.model.js'; // We need this to verify the user exists
import { isTimeSlotAvailable, createCalendarEvent } from '../../services/googleCalendar.service.js';

// CREATE a new booking for an EXISTING user
export const createBooking = async (req, res, next) => {
  try {
    const { userId, startingTime, endingTime } = req.body;

    // 1. Validate the input
    if (!userId || !startingTime || !endingTime) {
      return res.status(400).json({
        status: 'fail',
        message: 'Request must include userId, startingTime, and endingTime.',
      });
    }

    // 2. Verify the user exists in the database
    const bookingUser = await User.findById(userId);
    if (!bookingUser) {
      return res.status(404).json({
        status: 'fail',
        message: `User with ID ${userId} not found. A booking cannot be created.`,
      });
    }

    // 3. Check Google Calendar availability
    const isAvailable = await isTimeSlotAvailable(startingTime, endingTime);
    if (!isAvailable) {
      return res.status(409).json({
        status: 'fail',
        message: 'The requested time slot is already booked. Please choose another time.',
      });
    }
    
    // 4. Create the Booking document and link it to the user
    const newBooking = await Booking.create({
      startingTime,
      endingTime,
      user: bookingUser._id, // Linking the booking to the user's ID
    });
    
    // 5. Create the Google Calendar event
    const eventSummary = `Driving School (${bookingUser.name})`;
    const eventDescription = `Booking for ${bookingUser.name}. Contact: ${bookingUser.email}`;
    createCalendarEvent(startingTime, endingTime, eventSummary, eventDescription);

    // 6. Send the response with the new booking, populated with user info
    const populatedBooking = await newBooking.populate('user', 'name email');

    res.status(201).json({
      status: 'success',
      data: {
        booking: populatedBooking,
      },
    });
  } catch (error) {
    next(error);
  }
};

// READ all bookings
export const getAllBookings = async (req, res, next) => {
    try {
      const bookings = await Booking.find({}).populate('user', 'name email');
      res.status(200).json({
        status: 'success',
        results: bookings.length,
        data: {
          bookings,
        },
      });
    } catch (error) {
      next(error);
    }
};