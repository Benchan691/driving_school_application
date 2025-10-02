#!/usr/bin/env node

/**
 * Simple Clear All Booking Data Script
 * 
 * This script uses Sequelize models to clear all booking-related data.
 * It will remove:
 * - All booking records
 * - All payment records
 * - All student progress records
 * 
 * Usage: node src/scripts/clearBookingDataSimple.js
 */

const { sequelize } = require('../config/database');

// Import models
const Booking = require('../models/Booking');
const UserPackage = require('../models/UserPackage');

async function clearBookingData() {
  console.log('🗑️  Starting booking data clearing process...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Check if we're connected to the right database (MySQL syntax)
    const [results] = await sequelize.query("SELECT DATABASE() as current_db");
    console.log(`📊 Connected to database: ${results[0].current_db}\n`);
    
    // Start a transaction to ensure all-or-nothing operation
    const transaction = await sequelize.transaction();
    
    try {
      // Clear data using raw SQL queries that work with the actual table structure
      console.log('📊 Checking and clearing student progress records...');
      try {
        const progressDeleted = await sequelize.query(
          'DELETE FROM student_progress',
          { transaction }
        );
        console.log(`   ✅ Cleared ${progressDeleted[1] || 0} student progress records`);
      } catch (error) {
        console.log(`   ⚠️  Student progress table not found or empty: ${error.message}`);
      }
      
      console.log('💳 Checking and clearing payment records...');
      try {
        const paymentsDeleted = await sequelize.query(
          'DELETE FROM payments',
          { transaction }
        );
        console.log(`   ✅ Cleared ${paymentsDeleted[1] || 0} payment records`);
      } catch (error) {
        console.log(`   ⚠️  Payments table not found or empty: ${error.message}`);
      }
      
      console.log('📅 Checking and clearing booking records...');
      try {
        const bookingsDeleted = await sequelize.query(
          'DELETE FROM bookings',
          { transaction }
        );
        console.log(`   ✅ Cleared ${bookingsDeleted[1] || 0} booking records`);
      } catch (error) {
        console.log(`   ⚠️  Bookings table not found or empty: ${error.message}`);
      }
      
      // Also try clearing using Sequelize models (in case tables exist but with different structure)
      console.log('\n🔄 Trying alternative clearing methods...');
      
      try {
        const bookingCount = await Booking.count({ transaction });
        if (bookingCount > 0) {
          await Booking.destroy({ 
            where: {},
            transaction,
            force: true // Hard delete
          });
          console.log(`   ✅ Cleared ${bookingCount} booking records via Sequelize`);
        } else {
          console.log('   ℹ️  No booking records found via Sequelize');
        }
      } catch (error) {
        console.log(`   ⚠️  Could not clear via Sequelize Booking model: ${error.message}`);
      }
      
      // Commit the transaction
      await transaction.commit();
      console.log('\n✅ All booking data cleared successfully!');
      
      // Show remaining data counts
      console.log('\n📈 Current data counts:');
      
      try {
        const [bookingsCount] = await sequelize.query('SELECT COUNT(*) as count FROM bookings');
        console.log(`   📅 Bookings: ${bookingsCount[0].count}`);
      } catch (error) {
        console.log(`   📅 Bookings: Table not accessible (${error.message})`);
      }
      
      try {
        const [paymentsCount] = await sequelize.query('SELECT COUNT(*) as count FROM payments');
        console.log(`   💳 Payments: ${paymentsCount[0].count}`);
      } catch (error) {
        console.log(`   💳 Payments: Table not accessible (${error.message})`);
      }
      
      try {
        const [progressCount] = await sequelize.query('SELECT COUNT(*) as count FROM student_progress');
        console.log(`   📊 Student Progress: ${progressCount[0].count}`);
      } catch (error) {
        console.log(`   📊 Student Progress: Table not accessible (${error.message})`);
      }
      
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error clearing booking data:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  clearBookingData()
    .then(() => {
      console.log('\n🎉 Booking data clearing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to clear booking data:', error.message);
      process.exit(1);
    });
}

module.exports = { clearBookingData };
