#!/usr/bin/env node

/**
 * Test Login Script
 * 
 * This script tests the login functionality in detail to identify the issue.
 * 
 * Usage: node src/scripts/testLogin.js
 */

const { sequelize } = require('../config/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  console.log('🔐 Testing login functionality...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Get the admin user
    const adminUser = await User.findOne({ where: { email: 'admin@drivingschool.com' } });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('👤 Admin user found:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.first_name} ${adminUser.last_name}`);
    console.log(`   Type: ${adminUser.user_type}`);
    console.log(`   Password field type: ${typeof adminUser.password}`);
    console.log(`   Password field value: ${adminUser.password ? 'SET' : 'NULL'}`);
    console.log(`   Password field length: ${adminUser.password ? adminUser.password.length : 'N/A'}`);
    
    // Test password comparison
    console.log('\n🔍 Testing password comparison...');
    
    try {
      console.log('   Testing with "Admin123!"...');
      const isValid = await adminUser.comparePassword('Admin123!');
      console.log(`   Result: ${isValid ? 'VALID' : 'INVALID'}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
      console.log(`   Stack: ${error.stack}`);
    }
    
    // Test direct bcrypt comparison
    console.log('\n🔍 Testing direct bcrypt comparison...');
    try {
      const hash = adminUser.password;
      const directCompare = await bcrypt.compare('Admin123!', hash);
      console.log(`   Direct bcrypt result: ${directCompare ? 'VALID' : 'INVALID'}`);
    } catch (error) {
      console.log(`   Direct bcrypt error: ${error.message}`);
    }
    
    // Test with other common passwords
    console.log('\n🔍 Testing other common passwords...');
    const testPasswords = ['password', 'admin', '123456', 'Password123'];
    
    for (const password of testPasswords) {
      try {
        const isValid = await adminUser.comparePassword(password);
        console.log(`   "${password}": ${isValid ? 'VALID' : 'INVALID'}`);
      } catch (error) {
        console.log(`   "${password}": ERROR - ${error.message}`);
      }
    }
    
    // Try to reset the admin password
    console.log('\n🔧 Attempting to reset admin password...');
    try {
      adminUser.password = 'Admin123!';
      await adminUser.save();
      console.log('   ✅ Password reset successfully');
      
      // Test the new password
      const isValid = await adminUser.comparePassword('Admin123!');
      console.log(`   New password test: ${isValid ? 'VALID' : 'INVALID'}`);
      
    } catch (error) {
      console.log(`   ❌ Password reset failed: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  testLogin()
    .then(() => {
      console.log('\n🎉 Login test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to test login:', error.message);
      process.exit(1);
    });
}

module.exports = { testLogin };
