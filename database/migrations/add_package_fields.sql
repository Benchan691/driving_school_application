-- Migration: Add missing fields to lesson_packages table
-- Date: 2025-10-09
-- Description: Adds original_price, duration_hours, is_popular, and features columns

-- Add original_price column
ALTER TABLE lesson_packages 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- Add duration_hours column
ALTER TABLE lesson_packages 
ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5,2);

-- Add is_popular column
ALTER TABLE lesson_packages 
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false;

-- Add features column (JSON type for PostgreSQL)
ALTER TABLE lesson_packages 
ADD COLUMN IF NOT EXISTS features JSON DEFAULT '[]';

-- Update existing records to have sensible defaults
UPDATE lesson_packages 
SET original_price = price * 1.3 
WHERE original_price IS NULL;

UPDATE lesson_packages 
SET duration_hours = number_of_lessons * 1.5 
WHERE duration_hours IS NULL;

UPDATE lesson_packages 
SET is_popular = false 
WHERE is_popular IS NULL;

UPDATE lesson_packages 
SET features = '[]' 
WHERE features IS NULL;

