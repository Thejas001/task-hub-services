-- Migration to update estimatedHours column from INTEGER to DECIMAL(4,2)
-- This allows for decimal values like 2.5 hours

-- First, add a new column with the correct data type
ALTER TABLE Bookings ADD COLUMN estimatedHours_new DECIMAL(4,2) DEFAULT 1.0;

-- Copy data from old column to new column (convert integer to decimal)
UPDATE Bookings SET estimatedHours_new = CAST(estimatedHours AS DECIMAL(4,2));

-- Drop the old column
ALTER TABLE Bookings DROP COLUMN estimatedHours;

-- Rename the new column to the original name
ALTER TABLE Bookings CHANGE COLUMN estimatedHours_new estimatedHours DECIMAL(4,2) NOT NULL DEFAULT 1.0;

-- Add validation constraint (if your database supports it)
-- ALTER TABLE Bookings ADD CONSTRAINT chk_estimated_hours CHECK (estimatedHours >= 0.5 AND estimatedHours <= 12.0);
