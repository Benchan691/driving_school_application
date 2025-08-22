// src/api/routes/user.routes.js
import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// POST is removed. User creation is now handled by /auth/signup
router
  .route('/')
  .get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUserById)
  .delete(userController.deleteUser);

export default router;