-- Remove 'completed' status from bookings table
ALTER TABLE bookings MODIFY COLUMN status ENUM('scheduled', 'cancelled') DEFAULT 'scheduled';

-- Remove verification and active fields from users table
ALTER TABLE users DROP COLUMN is_verified;
ALTER TABLE users DROP COLUMN verification_token;
ALTER TABLE users DROP COLUMN is_active;
