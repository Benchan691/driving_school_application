import { Router } from 'express';
import userRoutes from './user.routes.js';
import bookingRoutes from './booking.routes.js';
import authRoutes from './auth.routes.js'; // 1. Import auth routes

const router = Router();

// --- MOUNT ROUTES ---
router.use('/auth', authRoutes); // 2. Mount auth routes at /api/v1/auth
router.use('/users', userRoutes);
router.use('/bookings', bookingRoutes);

export default router;