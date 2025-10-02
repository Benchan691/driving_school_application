const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { User, UserPackage, Package, Booking } = require('../models');
const { sequelize } = require('../config/database');

// Get all payments/user packages with quota information
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
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['purchase_date', 'DESC']]
    });

    // Get quota usage for packages A, B, C
    const quotaStats = await UserPackage.findAll({
      where: {
        package_name: ['Package A', 'Package B', 'Package C']
      },
      attributes: [
        'package_name',
        [sequelize.fn('COUNT', sequelize.col('id')), 'total_purchased'],
        [sequelize.fn('SUM', sequelize.col('lessons_used')), 'total_used'],
        [sequelize.fn('SUM', sequelize.col('total_lessons')), 'total_lessons']
      ],
      group: ['package_name']
    });

    res.json({
      success: true,
      data: {
        payments: userPackages,
        quotaStats: quotaStats
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

// Update quota for a specific user package
router.put('/:id/quota', authenticateToken, async (req, res) => {
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
    const { lessons_used } = req.body;

    if (typeof lessons_used !== 'number' || lessons_used < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lessons_used value'
      });
    }

    const userPackage = await UserPackage.findByPk(id);
    if (!userPackage) {
      return res.status(404).json({
        success: false,
        message: 'User package not found'
      });
    }

    // Update quota
    userPackage.lessons_used = lessons_used;
    userPackage.lessons_remaining = userPackage.total_lessons - lessons_used;

    await userPackage.save();

    res.json({
      success: true,
      message: 'Quota updated successfully',
      data: userPackage
    });

  } catch (error) {
    console.error('Update quota error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quota',
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
