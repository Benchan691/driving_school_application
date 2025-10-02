#!/usr/bin/env node

/**
 * Check Users Script
 * 
 * This script checks what users exist in the database and tests login functionality.
 * 
 * Usage: node src/scripts/checkUsers.js
 */

const { sequelize } = require('../config/database');
const User = require('../models/User');

async function checkUsers() {
  console.log('👥 Checking users in database...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Count all users
    const userCount = await User.count();
    console.log(`📊 Total users in database: ${userCount}\n`);
    
    if (userCount > 0) {
      // Get all users
      const users = await User.findAll({
        attributes: ['id', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'created_at']
      });
      
      console.log('👤 User details:');
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`      Type: ${user.user_type}, Verified: ${user.is_verified}, Created: ${user.created_at}`);
      });
      
      // Test password verification for first user
      if (users.length > 0) {
        const testUser = users[0];
        console.log(`\n🔐 Testing password verification for ${testUser.email}...`);
        
        try {
          // Test with common passwords
          const testPasswords = ['password', 'admin', '123456', 'Admin123!'];
          
          for (const password of testPasswords) {
            try {
              const isValid = await testUser.comparePassword(password);
              if (isValid) {
                console.log(`   ✅ Password "${password}" is correct for ${testUser.email}`);
                break;
              }
            } catch (error) {
              console.log(`   ❌ Password "${password}" failed: ${error.message}`);
            }
          }
        } catch (error) {
          console.log(`   ❌ Error testing passwords: ${error.message}`);
        }
      }
      
    } else {
      console.log('❌ No users found in database!');
      console.log('   You may need to create a user account or restore from backup.');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('\n🎉 User check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to check users:', error.message);
      process.exit(1);
    });
}

module.exports = { checkUsers };
