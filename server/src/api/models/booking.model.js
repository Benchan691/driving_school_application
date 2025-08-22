import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    startingTime: {
      type: Date,
      required: [true, 'A starting time is required for the booking.'],
    },
    endingTime: {
      type: Date,
      required: [true, 'An ending time is required for the booking.'],
      validate: {
        validator: function (value) {
          return value > this.startingTime;
        },
        message: 'Ending time must be after the starting time.',
      },
    },
    // --- This is the link to the User model ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // This tells Mongoose to look in the 'User' collection
      required: [true, 'A booking must be associated with a user.'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot double-book the exact same time slot
bookingSchema.index({ user: 1, startingTime: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;