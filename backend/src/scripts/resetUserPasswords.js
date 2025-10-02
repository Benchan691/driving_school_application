#!/usr/bin/env node

/**
 * Reset User Passwords Script
 * 
 * This script resets passwords for all users to known values for testing.
 * 
 * Usage: node src/scripts/resetUserPasswords.js
 */

const { sequelize } = require('../config/database');
const User = require('../models/User');

async function resetUserPasswords() {
  console.log('🔐 Resetting user passwords...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Get all users
    const users = await User.findAll();
    
    console.log(`📊 Found ${users.length} users to reset passwords for:\n`);
    
    // Reset passwords for each user
    for (const user of users) {
      let newPassword;
      
      // Set different passwords based on user type
      if (user.user_type === 'admin') {
        newPassword = 'Admin123!';
      } else if (user.email.includes('chankokpan')) {
        newPassword = 'Chan123!';
      } else {
        newPassword = 'Test123!';
      }
      
      try {
        user.password = newPassword;
        await user.save();
        console.log(`✅ Reset password for ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`   Type: ${user.user_type}, Password: ${newPassword}`);
      } catch (error) {
        console.log(`❌ Failed to reset password for ${user.email}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Password reset completed!');
    console.log('\n📋 Login credentials:');
    console.log('   Admin: admin@drivingschool.com / Admin123!');
    console.log('   Chan Kok Pan: chankokpan0728@gmail.com / Chan123!');
    console.log('   Chan Kok Pan (CUHK): 1155214377@link.cuhk.edu.hk / Chan123!');
    console.log('   Test User: test@example.com / Test123!');
    
  } catch (error) {
    console.error('❌ Error resetting passwords:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  resetUserPasswords()
    .then(() => {
      console.log('\n🎉 Password reset completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to reset passwords:', error.message);
      process.exit(1);
    });
}

module.exports = { resetUserPasswords };
