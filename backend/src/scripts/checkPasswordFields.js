#!/usr/bin/env node

/**
 * Check Password Fields Script
 * 
 * This script checks the password fields in the database to see if they're corrupted.
 * 
 * Usage: node src/scripts/checkPasswordFields.js
 */

const { sequelize } = require('../config/database');

async function checkPasswordFields() {
  console.log('🔐 Checking password fields in database...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Query users table directly to see password field values
    const [users] = await sequelize.query(`
      SELECT id, email, first_name, last_name, user_type, 
             CASE 
               WHEN password IS NULL THEN 'NULL'
               WHEN password = '' THEN 'EMPTY'
               ELSE CONCAT('HASHED (', CHAR_LENGTH(password), ' chars)')
             END as password_status,
             created_at, updated_at
      FROM users 
      ORDER BY id
    `);
    
    console.log('👤 User password status:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`      Type: ${user.user_type}, Password: ${user.password_status}`);
      console.log(`      Created: ${user.created_at}, Updated: ${user.updated_at}`);
      console.log('');
    });
    
    // Check for any users with NULL or empty passwords
    const [problematicUsers] = await sequelize.query(`
      SELECT id, email, first_name, last_name 
      FROM users 
      WHERE password IS NULL OR password = ''
    `);
    
    if (problematicUsers.length > 0) {
      console.log('❌ Users with missing/corrupted passwords:');
      problematicUsers.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
      });
      console.log('\n🔧 These users need their passwords reset.');
    } else {
      console.log('✅ All users have password fields set.');
    }
    
  } catch (error) {
    console.error('❌ Error checking password fields:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  checkPasswordFields()
    .then(() => {
      console.log('\n🎉 Password field check completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to check password fields:', error.message);
      process.exit(1);
    });
}

module.exports = { checkPasswordFields };
