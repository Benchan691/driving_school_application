const { sequelize, testConnection } = require('../config/database');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const Booking = require('../models/Booking');
const ContactMessage = require('../models/ContactMessage');
const Package = require('../models/Package');
const UserPackage = require('../models/UserPackage');
const SystemSetting = require('../models/SystemSetting');

// Idempotent migrations — safe to run on every startup
const runMigrations = async (seq) => {
  // Make student_id nullable (was NOT NULL in original schema)
  await seq.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'bookings' AND column_name = 'student_id' AND is_nullable = 'NO'
      ) THEN
        ALTER TABLE bookings ALTER COLUMN student_id DROP NOT NULL;
      END IF;
    END $$;
  `);

  // Add guest columns if they don't already exist
  await seq.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_name VARCHAR(200);`);
  await seq.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);`);
  await seq.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(30);`);

  // System settings table for runtime-configurable credentials (encrypted at rest)
  await seq.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key VARCHAR(120) PRIMARY KEY,
      value_encrypted TEXT,
      enc_iv VARCHAR(64),
      enc_tag VARCHAR(64),
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const initDatabase = async () => {
  try {
    // Test connection
    await testConnection();

    // Define associations
    User.hasOne(Instructor, { foreignKey: 'user_id', as: 'instructor' });
    Instructor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    User.hasMany(Booking, { foreignKey: 'student_id', as: 'bookings' });
    Booking.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
    
    Instructor.hasMany(Booking, { foreignKey: 'instructor_id', as: 'bookings' });
    Booking.belongsTo(Instructor, { foreignKey: 'instructor_id', as: 'instructor' });

    Package.hasMany(Booking, { foreignKey: 'package_id', as: 'bookings' });
    Booking.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });

    // Package associations (UserPackage)
    User.hasMany(UserPackage, { foreignKey: 'user_id', as: 'userPackages' });
    UserPackage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    
    Package.hasMany(UserPackage, { foreignKey: 'package_id', as: 'userPackages' });
    UserPackage.belongsTo(Package, { foreignKey: 'package_id', as: 'package' });
    
    // UserPackage and Booking association removed - user_package_id column doesn't exist

    // Sync database (don't alter existing schema - use migrations instead)
    // Using alter: false to avoid conflicts with existing database schema
    await sequelize.sync({ alter: false, force: false });
    console.log('✅ Database synchronized successfully');

    // Apply incremental schema migrations
    await runMigrations(sequelize);
    console.log('✅ Schema migrations applied');

    // Create admin user if it doesn't exist and ADMIN_EMAIL is configured
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && adminEmail.trim() !== '') {
      const adminExists = await User.findOne({ where: { email: adminEmail } });
      if (!adminExists) {
        try {
          const admin = await User.create({
            name: 'Admin User',
            email: adminEmail,
            password: 'Admin123!',
            user_type: 'admin',
            email_verified: true
          });
          console.log('✅ Admin user created');
        } catch (error) {
          console.warn('⚠️  Failed to create admin user:', error.message);
        }
      }
    } else {
      console.log('⚠️  ADMIN_EMAIL not configured, skipping admin user creation');
    }

    console.log('🎉 Database initialization completed');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

module.exports = { initDatabase };


