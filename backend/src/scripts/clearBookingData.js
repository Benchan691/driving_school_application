#!/usr/bin/env node

/**
 * Clear All Booking Data Script
 * 
 * This script safely clears all booking-related data from the database.
 * It will remove:
 * - All booking records
 * - All payment records
 * - All student progress records
 * 
 * Usage: node src/scripts/clearBookingData.js
 */

const { sequelize } = require('../config/database');
const fs = require('fs');
const path = require('path');

async function clearBookingData() {
  console.log('🗑️  Starting booking data clearing process...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Start a transaction to ensure all-or-nothing operation
    const transaction = await sequelize.transaction();
    
    try {
      // Clear data in the correct order to respect foreign key constraints
      console.log('📊 Clearing student progress records...');
      const progressDeleted = await sequelize.query(
        'DELETE FROM student_progress',
        { transaction }
      );
      console.log(`   ✅ Cleared ${progressDeleted[1] || 0} student progress records`);
      
      console.log('💳 Clearing payment records...');
      const paymentsDeleted = await sequelize.query(
        'DELETE FROM payments',
        { transaction }
      );
      console.log(`   ✅ Cleared ${paymentsDeleted[1] || 0} payment records`);
      
      console.log('📅 Clearing booking records...');
      const bookingsDeleted = await sequelize.query(
        'DELETE FROM bookings',
        { transaction }
      );
      console.log(`   ✅ Cleared ${bookingsDeleted[1] || 0} booking records`);
      
      // Commit the transaction
      await transaction.commit();
      console.log('\n✅ All booking data cleared successfully!');
      
      // Show remaining data counts
      console.log('\n📈 Current data counts:');
      const [bookingsCount] = await sequelize.query('SELECT COUNT(*) as count FROM bookings');
      const [paymentsCount] = await sequelize.query('SELECT COUNT(*) as count FROM payments');
      const [progressCount] = await sequelize.query('SELECT COUNT(*) as count FROM student_progress');
      
      console.log(`   📅 Bookings: ${bookingsCount[0].count}`);
      console.log(`   💳 Payments: ${paymentsCount[0].count}`);
      console.log(`   📊 Student Progress: ${progressCount[0].count}`);
      
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error clearing booking data:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  // Add confirmation prompt
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('⚠️  WARNING: This will permanently delete ALL booking data!');
  console.log('   This includes:');
  console.log('   - All booking records');
  console.log('   - All payment records');
  console.log('   - All student progress records');
  console.log('');
  
  rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      clearBookingData()
        .then(() => {
          console.log('\n🎉 Booking data clearing completed successfully!');
          process.exit(0);
        })
        .catch((error) => {
          console.error('\n💥 Failed to clear booking data:', error.message);
          process.exit(1);
        });
    } else {
      console.log('\n❌ Operation cancelled by user.');
      process.exit(0);
    }
    rl.close();
  });
}

module.exports = { clearBookingData };
