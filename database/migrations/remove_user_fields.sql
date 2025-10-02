-- Migration to remove city, postal_code, and date_of_birth fields from users table
-- This migration should be run to update existing databases

-- Remove the columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS city;
ALTER TABLE users DROP COLUMN IF EXISTS postal_code;
ALTER TABLE users DROP COLUMN IF EXISTS date_of_birth;

-- Note: This migration is safe to run even if the columns don't exist
-- The IF EXISTS clause prevents errors if the columns have already been removed


