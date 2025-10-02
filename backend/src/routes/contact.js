const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { authenticateToken, requireRole } = require('../middleware/auth');
const emailService = require('../services/emailService');

// Public: submit contact form → save to DB
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'name, email, and message are required' });
    }
    const created = await ContactMessage.create({ name, email, phone, subject, message });
    res.json({ success: true, data: created });
  } catch (error) {
    console.error('Create contact message failed:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact message' });
  }
});

// Admin: list messages with optional filters and sorting
router.get('/admin', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { q, status, sortBy = 'created_at', order = 'DESC' } = req.query;
    const { Op } = require('sequelize');
    const where = {};
    if (status) where.status = status;
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { subject: { [Op.like]: `%${q}%` } },
        { message: { [Op.like]: `%${q}%` } }
      ];
    }
    const messages = await ContactMessage.findAll({ where, order: [[sortBy, order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']] });
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('List contact messages failed:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contact messages' });
  }
});

// Admin: update status or fields
router.put('/admin/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByPk(id);
    if (!message) return res.status(404).json({ success: false, message: 'Not found' });
    const allowed = ['name', 'email', 'phone', 'subject', 'message', 'status'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    await message.update(updates);
    res.json({ success: true, data: message });
  } catch (error) {
    console.error('Update contact message failed:', error);
    res.status(500).json({ success: false, message: 'Failed to update contact message' });
  }
});

// Admin: reply to contact message
router.post('/admin/:id/reply', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;
    
    if (!replyMessage) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }
    
    const message = await ContactMessage.findByPk(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Contact message not found' });
    }
    
    // Send reply email
    await emailService.sendContactReply(message, replyMessage);
    
    // Update status to in_progress if it was new
    if (message.status === 'new') {
      await message.update({ status: 'in_progress' });
    }
    
    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Send contact reply failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send reply' });
  }
});

// Admin: delete
router.delete('/admin/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ContactMessage.findByPk(id);
    if (!message) return res.status(404).json({ success: false, message: 'Not found' });
    await message.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Delete contact message failed:', error);
    res.status(500).json({ success: false, message: 'Failed to delete contact message' });
  }
});

module.exports = router;


