const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const User = require('../models/User');

// All routes require admin
router.use(authenticateToken, requireRole(['admin']));

// List users (with basic search by email/name)
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    // Basic filtering will be refined in DB later if needed
    const users = await User.findAll({ order: [['created_at', 'DESC']] });
    const data = q
      ? users.filter(u => `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(String(q).toLowerCase()))
      : users;
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Get user by id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { first_name, last_name, email, user_type } = req.body;
    await user.update({ first_name, last_name, email, user_type });
    res.json({ success: true, data: user });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
});

module.exports = router;


