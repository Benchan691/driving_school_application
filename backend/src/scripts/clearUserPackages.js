#!/usr/bin/env node

/**
 * Clear User Packages Script
 * 
 * This script clears all user package purchases.
 * 
 * Usage: node src/scripts/clearUserPackages.js
 */

const { sequelize } = require('../config/database');
const UserPackage = require('../models/UserPackage');

async function clearUserPackages() {
  console.log('🗑️  Starting user packages clearing process...\n');
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');
    
    // Start a transaction to ensure all-or-nothing operation
    const transaction = await sequelize.transaction();
    
    try {
      console.log('📦 Clearing user package records...');
      
      // Count existing records first
      const packageCount = await UserPackage.count({ transaction });
      console.log(`   📊 Found ${packageCount} user package records`);
      
      if (packageCount > 0) {
        await UserPackage.destroy({ 
          where: {},
          transaction,
          force: true // Hard delete
        });
        console.log(`   ✅ Cleared ${packageCount} user package records`);
      } else {
        console.log('   ℹ️  No user package records found');
      }
      
      // Commit the transaction
      await transaction.commit();
      console.log('\n✅ User packages cleared successfully!');
      
      // Show remaining data count
      const remainingCount = await UserPackage.count();
      console.log(`\n📈 Remaining user packages: ${remainingCount}`);
      
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error clearing user packages:', error.message);
    process.exit(1);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  clearUserPackages()
    .then(() => {
      console.log('\n🎉 User packages clearing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Failed to clear user packages:', error.message);
      process.exit(1);
    });
}

module.exports = { clearUserPackages };
