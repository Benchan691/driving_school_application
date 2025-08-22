import User from '../models/user.model.js';
import Booking from '../models/booking.model.js';

// READ all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};

// READ a single user by ID
export const getUserById = async (req, res, next) => {
  try {
    // Find the user and also find all their associated bookings
    const user = await User.findById(req.params.id);
    if (!user) {
      const error = new Error(`User not found with ID: ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }
    
    const bookings = await Booking.find({ user: user._id });

    res.status(200).json({
      status: 'success',
      data: {
        user,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// DELETE a user by ID
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      const error = new Error(`User not found with ID: ${req.params.id}`);
      error.statusCode = 404;
      return next(error);
    }
    // Optional: Also delete all bookings associated with this user
    await Booking.deleteMany({ user: user._id });
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};