const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');
const Package = require('../models/Package');
const UserPackage = require('../models/UserPackage');

const initDatabase = async () => {
  try {
    // Test connection
    await testConnection();

    // Define associations
    User.hasOne(Instructor, { foreignKey: 'user_id', as: 'instructor' });
    Instructor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
    Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // Package associations
    User.hasMany(UserPackage, { foreignKey: 'user_id', as: 'userPackages' });
    UserPackage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    
    Package.hasMany(UserPackage, { foreignKey: 'package_id', as: 'userPackages' });
    UserPackage.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
    
    // UserPackage and Booking association removed - user_package_id column doesn't exist

    // Sync database (create tables only)
    // Disable alter to avoid repetitive key alterations on existing columns
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Database synchronized successfully');

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ where: { email: 'admin@drivingschool.com' } });
    if (!adminExists) {
      const admin = await User.create({
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@drivingschool.com',
        password: 'Admin123!',
        user_type: 'admin',
        is_verified: true
      });
      console.log('✅ Admin user created');
    }

    console.log('🎉 Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = { initDatabase };


