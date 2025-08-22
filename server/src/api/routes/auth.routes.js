// src/api/routes/auth.routes.js
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// --- NEW ROUTES ---
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

export default router;