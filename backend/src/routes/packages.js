const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const { Package, UserPackage } = require('../models');

// Get all active packages
router.get('/', async (req, res) => {
  try {
    const packages = await Package.findAll({
      order: [['is_popular', 'DESC'], ['price', 'ASC']]
    });
    
    res.json({
      success: true,
      data: packages
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch packages',
      error: error.message
    });
  }
});

// Get user's purchased packages
router.get('/my-packages', authenticateToken, async (req, res) => {
  try {
    const userPackages = await UserPackage.findAll({
      where: { 
        user_id: req.user.id,
      },
      order: [['purchase_date', 'DESC']]
    });

    // Filter out expired packages
    const activePackages = userPackages.filter(pkg => !pkg.isExpired());
    
    res.json({
      success: true,
      data: activePackages
    });
  } catch (error) {
    console.error('Error fetching user packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user packages',
      error: error.message
    });
  }
});

// Get packages available for booking (with remaining lessons)
router.get('/available-for-booking', authenticateToken, async (req, res) => {
  try {
    const userPackages = await UserPackage.findAll({
      where: { 
        user_id: req.user.id,
      },
      order: [['purchase_date', 'DESC']]
    });

    // Filter packages with remaining lessons and not expired
    const availablePackages = userPackages.filter(pkg => 
      pkg.hasRemainingLessons() && !pkg.isExpired()
    );
    
    res.json({
      success: true,
      data: availablePackages
    });
  } catch (error) {
    console.error('Error fetching available packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available packages',
      error: error.message
    });
  }
});

// Admin routes
// Create package
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const {
      name,
      description,
      number_of_lessons,
      price,
      original_price,
      duration_hours,
      validity_days,
      package_type,
      is_popular,
      features
    } = req.body;

    const package = await Package.create({
      name,
      description,
      number_of_lessons,
      price,
      original_price,
      duration_hours,
      validity_days,
      package_type,
      is_popular: is_popular || false,
      features
    });

    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create package',
      error: error.message
    });
  }
});

// Update package
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const package = await Package.findByPk(id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await package.update(updateData);

    res.json({
      success: true,
      data: package
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update package',
      error: error.message
    });
  }
});

// Delete package
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const package = await Package.findByPk(id);
    if (!package) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    await package.destroy();

    res.json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete package',
      error: error.message
    });
  }
});

// Seed packages (allow all authenticated users for development)
router.post('/seed', authenticateToken, async (req, res) => {
  try {
    // For development, allow any authenticated user to seed packages
    // In production, you might want to restrict this to admin only

    // Check if packages already exist
    const existingPackages = await Package.findAll();
    if (existingPackages.length > 0) {
      return res.json({
        success: true,
        message: 'Packages already exist',
        data: existingPackages
      });
    }

    // Seed initial package data
    const packagesData = [
      {
        name: '1 Hour Driving Lesson',
        description: 'One lesson, to evaluate and prepare for your road test',
        number_of_lessons: 1,
        price: 80,
        original_price: 110,
        duration_hours: 1,
        package_type: 'single',
        is_popular: false,
        features: ['One lesson evaluation', 'Road test preparation', 'Individual assessment']
      },
      {
        name: '1.5 Hours Driving Lessons',
        description: 'Perfect for intermediate or experienced drivers wanting a reminder of driving skills',
        number_of_lessons: 1,
        price: 110,
        original_price: 150,
        duration_hours: 1.5,
        package_type: 'single',
        is_popular: false,
        features: ['Perfect for intermediate drivers', 'Experienced driver refresher', 'Reminder of driving skills']
      },
      {
        name: 'Package A',
        description: 'In this package you will get four 90 minutes lessons. Total hours 6 behind the wheel.',
        number_of_lessons: 4,
        price: 420,
        original_price: 600,
        duration_hours: 6,
        package_type: 'package',
        is_popular: true,
        features: ['Four 90-minute lessons', 'Total 6 hours behind the wheel', 'Comprehensive training']
      },
      {
        name: 'Package B',
        description: 'In this package you will get six 90 minutes lessons. Total hours 9 behind the wheel.',
        number_of_lessons: 6,
        price: 610,
        original_price: 700,
        duration_hours: 9,
        package_type: 'package',
        is_popular: false,
        features: ['Six 90-minute lessons', 'Total 9 hours behind the wheel', 'Extended training program']
      },
      {
        name: 'Package C',
        description: 'In this package you will get ten 90 minutes lessons. Total hours 15 behind the wheel.',
        number_of_lessons: 10,
        price: 1000,
        original_price: 1200,
        duration_hours: 15,
        package_type: 'package',
        is_popular: false,
        features: ['Ten 90-minute lessons', 'Total 15 hours behind the wheel', 'Comprehensive training program']
      },
      {
        name: 'Road Test',
        description: 'In this package you will get 60 minutes refresher lesson and a school vehicle for road testing.',
        number_of_lessons: 1,
        price: 170,
        original_price: 200,
        duration_hours: 1,
        package_type: 'road_test',
        is_popular: true,
        features: ['60 minutes refresher lesson', 'School vehicle for road testing', 'Complete road test support']
      }
    ];

    const createdPackages = await Package.bulkCreate(packagesData);

    res.json({
      success: true,
      message: 'Packages seeded successfully',
      data: createdPackages
    });
  } catch (error) {
    console.error('Error seeding packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed packages',
      error: error.message
    });
  }
});

module.exports = router;

