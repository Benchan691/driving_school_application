const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User, UserPackage, Package, Booking } = require('../models');

// Get all payments/user packages
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get all user packages with related data
    const userPackages = await UserPackage.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        payments: userPackages
      }
    });

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
});

// Delete a user package
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findByPk(req.user.id);
    if (!user || user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    const userPackage = await UserPackage.findByPk(id);
    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'User package not found'
      });
    }

    await userPackage.destroy();

    res.json({
      success: true,
      message: 'User package deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete payment',
      error: error.message
    });
  }
});

module.exports = router;
