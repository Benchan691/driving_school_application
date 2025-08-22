import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';

const router = Router();

router
  .route('/')
  .post(bookingController.createBooking) // Creates a booking
  .get(bookingController.getAllBookings); // Gets all bookings

// You can add routes for /:id to get or delete a single booking later
// router.route('/:id').get(bookingController.getBookingById);

export default router;