-- Clear All Booking Data Migration
-- This script will safely remove all booking-related data from the database
-- Run this script to reset all bookings, payments, and related data

-- Disable foreign key checks temporarily (for MySQL compatibility)
SET foreign_key_checks = 0;

-- Clear all booking-related data in the correct order to respect foreign key constraints

-- 1. Clear student progress records (references bookings)
DELETE FROM student_progress;

-- 2. Clear payment records (references bookings)
DELETE FROM payments;

-- 3. Clear booking records
DELETE FROM bookings;

-- 4. Clear user packages (optional - uncomment if you want to clear package purchases too)
-- DELETE FROM user_packages;

-- 5. Reset any auto-increment counters (for MySQL)
-- ALTER TABLE student_progress AUTO_INCREMENT = 1;
-- ALTER TABLE payments AUTO_INCREMENT = 1;
-- ALTER TABLE bookings AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET foreign_key_checks = 1;

-- Show confirmation of cleared data
SELECT 'Booking data cleared successfully' as status;

-- Optional: Show remaining data counts
SELECT 
    'bookings' as table_name, COUNT(*) as remaining_records FROM bookings
UNION ALL
SELECT 
    'payments' as table_name, COUNT(*) as remaining_records FROM payments
UNION ALL
SELECT 
    'student_progress' as table_name, COUNT(*) as remaining_records FROM student_progress;
