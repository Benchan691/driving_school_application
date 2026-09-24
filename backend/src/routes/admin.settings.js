const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const settingsService = require('../services/settingsService');

router.use(authenticateToken, requireRole(['admin']));

router.get('/email', async (req, res) => {
  try {
    const cfg = await settingsService.getEmailConfig();
    const hasPass = await settingsService.hasStoredEmailPass();
    res.json({
      success: true,
      data: {
        email_user: cfg.user || '',
        email_from: cfg.from || '',
        has_password: hasPass || !!cfg.pass,
        source: cfg.source,
        settings_key_present: cfg.settingsKeyPresent,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load email settings' });
  }
});

router.put('/email', async (req, res) => {
  try {
    const { email_user, email_from, email_pass } = req.body || {};
    await settingsService.setEmailConfig({ user: email_user, from: email_from, pass: email_pass });
    const cfg = await settingsService.getEmailConfig();
    const hasPass = await settingsService.hasStoredEmailPass();
    res.json({
      success: true,
      data: {
        email_user: cfg.user || '',
        email_from: cfg.from || '',
        has_password: hasPass || !!cfg.pass,
        source: cfg.source,
        settings_key_present: cfg.settingsKeyPresent,
      },
    });
  } catch (e) {
    if (e && e.code === 'SETTINGS_KEY_MISSING') {
      return res.status(400).json({
        success: false,
        message: 'Server encryption key missing. Set SETTINGS_ENCRYPTION_KEY on the server to store email passwords.',
      });
    }
    res.status(500).json({ success: false, message: 'Failed to update email settings' });
  }
});

module.exports = router;

