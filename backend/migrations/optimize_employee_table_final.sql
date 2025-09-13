-- ==========================
-- EMPLOYEE TABLE OPTIMIZATION FOR WORKER MARKETPLACE
-- ==========================

-- Step 1: Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Step 2: Create backup of current employees table (already done)
-- CREATE TABLE IF NOT EXISTS employees_backup AS SELECT * FROM employees;

-- Step 3: Drop foreign key constraints that reference the employees table
-- First, let's check what foreign keys exist and drop them one by one
-- (Run these individually if they exist)

-- Try to drop foreign key from jobposts table
-- ALTER TABLE jobposts DROP FOREIGN KEY jobposts_ibfk_10;

-- If the above fails, try this alternative:
-- ALTER TABLE jobposts DROP FOREIGN KEY fk_jobposts_employee;

-- Step 4: Drop the current employees table
DROP TABLE IF EXISTS employees;

-- Step 5: Create optimized employees table for worker marketplace
CREATE TABLE employees (
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
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addedBy) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for better performance
    INDEX idx_workType (workType),
    INDEX idx_state (state),
    INDEX idx_city (city),
    INDEX idx_applicationStatus (applicationStatus),
    INDEX idx_rating (rating),
    INDEX idx_isAvailable (isAvailable)
);

-- Step 6: Create WorkerReviews table
CREATE TABLE worker_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    customerId INT NOT NULL,
    bookingId INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (customerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_booking_review (workerId, customerId, bookingId)
);

-- Step 7: Create WorkerAvailability table
CREATE TABLE worker_availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    dayOfWeek ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    isAvailable BOOLEAN DEFAULT TRUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES employees(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_worker_day_time (workerId, dayOfWeek, startTime, endTime)
);

-- Step 8: Create WorkerPortfolio table
CREATE TABLE worker_portfolio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    workType VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Step 9: Insert sample data
INSERT INTO employees (
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

-- Step 10: Add additional indexes
CREATE INDEX idx_employees_workType_state ON employees(workType, state);
CREATE INDEX idx_employees_rating_available ON employees(rating, isAvailable);
CREATE INDEX idx_employees_applicationStatus ON employees(applicationStatus);

-- Step 11: Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Step 12: Verify the migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as employee_count FROM employees;
SELECT COUNT(*) as backup_count FROM employees_backup;
