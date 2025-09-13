-- ==========================
-- EMPLOYEE TABLE OPTIMIZATION FOR WORKER MARKETPLACE
-- ==========================

-- Step 1: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Create backup of current employee table
CREATE TABLE IF NOT EXISTS Employee_backup AS SELECT * FROM Employee;

-- Step 3: Drop foreign key constraints that reference the Employee table
-- First, let's find and drop all foreign key constraints

-- Drop foreign key from jobposts table (if it exists)
ALTER TABLE jobposts DROP FOREIGN KEY IF EXISTS jobposts_ibfk_10;
ALTER TABLE jobposts DROP FOREIGN KEY IF EXISTS fk_jobposts_employee;

-- Drop any other foreign keys that might reference Employee table
-- (Add more as needed based on your schema)

-- Step 4: Drop the current employee table
DROP TABLE IF EXISTS Employee;

-- Step 5: Create optimized Employee table for worker marketplace
CREATE TABLE Employee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    
    -- Basic Personal Information
    firstName VARCHAR(255) NOT NULL,
    middleName VARCHAR(255),
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobileNumber VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    
    -- Location Information
    address VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    pinCode VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    nationality VARCHAR(255) NOT NULL,
    
    -- Professional Information
    workType VARCHAR(255) NOT NULL,
    workExperience VARCHAR(255) NOT NULL,
    hourlyRate DECIMAL(10,2),
    bio TEXT,
    
    -- Skills and Expertise
    skills JSON,
    certifications JSON,
    
    -- Availability
    isAvailable BOOLEAN DEFAULT TRUE,
    availableDays JSON,
    availableTimeSlots JSON,
    
    -- Profile and Documents
    profilePic VARCHAR(255),
    certificate VARCHAR(255),
    aadharCard VARCHAR(255),
    panCard VARCHAR(255),
    idCard VARCHAR(255),
    
    -- Application Status
    applicationStatus ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    
    -- Rating and Reviews
    rating DECIMAL(3,2) DEFAULT 0.00,
    totalReviews INT DEFAULT 0,
    
    -- Verification Status
    isVerified BOOLEAN DEFAULT FALSE,
    isBackgroundChecked BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    addedBy INT,
    
    -- Foreign Key Constraints
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (addedBy) REFERENCES Users(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_workType (workType),
    INDEX idx_state (state),
    INDEX idx_city (city),
    INDEX idx_applicationStatus (applicationStatus),
    INDEX idx_rating (rating),
    INDEX idx_isAvailable (isAvailable)
);

-- Step 6: Create WorkerReviews table
CREATE TABLE WorkerReviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    customerId INT NOT NULL,
    bookingId INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES Employee(id) ON DELETE CASCADE,
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_booking_review (workerId, customerId, bookingId)
);

-- Step 7: Create WorkerAvailability table
CREATE TABLE WorkerAvailability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    isAvailable BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES Employee(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_worker_day_time (workerId, dayOfWeek, startTime, endTime)
);

-- Step 8: Create WorkerPortfolio table
CREATE TABLE WorkerPortfolio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    workType VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES Employee(id) ON DELETE CASCADE
);

-- Step 9: Re-add foreign key constraints to jobposts table (if needed)
-- You may need to adjust this based on your actual jobposts table structure
-- ALTER TABLE jobposts ADD CONSTRAINT fk_jobposts_employee 
--     FOREIGN KEY (employeeId) REFERENCES Employee(id) ON DELETE SET NULL;

-- Step 10: Insert sample data
INSERT INTO Employee (
    userId, firstName, lastName, email, mobileNumber, age, address, state, pinCode, 
    city, nationality, workType, workExperience, hourlyRate, bio, skills, 
    certifications, isAvailable, applicationStatus, rating, totalReviews, 
    isVerified, isBackgroundChecked
) VALUES (
    1, 'John', 'Smith', 'john.smith@example.com', '(555) 123-4567', 35,
    '123 Main Street', 'California', '90210', 'Los Angeles', 'American',
    'Plumbing', '8 years', 50.00, 
    'Professional plumber with expertise in residential and commercial plumbing systems. Specialized in emergency repairs, installation, and maintenance.',
    '["Emergency Repairs", "Pipe Installation", "Leak Detection", "Water Heater Repair"]',
    '["Licensed Plumber", "EPA Certified", "OSHA Safety Trained"]',
    TRUE, 'accepted', 4.8, 127, TRUE, TRUE
);

-- Step 11: Update Users table role enum
ALTER TABLE Users MODIFY COLUMN role ENUM('admin', 'employee', 'user') NOT NULL;

-- Step 12: Add additional indexes
CREATE INDEX idx_employee_workType_state ON Employee(workType, state);
CREATE INDEX idx_employee_rating_available ON Employee(rating, isAvailable);
CREATE INDEX idx_employee_applicationStatus ON Employee(applicationStatus);

-- Step 13: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 14: Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as employee_count FROM Employee;
SELECT COUNT(*) as backup_count FROM Employee_backup;
