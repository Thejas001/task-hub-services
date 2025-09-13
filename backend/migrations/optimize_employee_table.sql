-- ==========================
-- EMPLOYEE TABLE OPTIMIZATION FOR WORKER MARKETPLACE
-- ==========================

-- First, let's create a backup of the current employee table
CREATE TABLE Employee_backup AS SELECT * FROM Employee;

-- Drop the current employee table
DROP TABLE IF EXISTS Employee;

-- Create optimized Employee table for worker marketplace
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
    workType VARCHAR(255) NOT NULL, -- Plumbing, Electrical, Gardening, Cleaning, etc.
    workExperience VARCHAR(255) NOT NULL, -- Years of experience
    hourlyRate DECIMAL(10,2), -- Hourly rate for services
    bio TEXT, -- Professional bio/description
    
    -- Skills and Expertise
    skills JSON, -- Array of skills: ["Emergency Repairs", "Pipe Installation", "Leak Detection"]
    certifications JSON, -- Array of certifications: ["Licensed Plumber", "EPA Certified"]
    
    -- Availability
    isAvailable BOOLEAN DEFAULT TRUE,
    availableDays JSON, -- Days of week available: ["Monday", "Tuesday", "Wednesday"]
    availableTimeSlots JSON, -- Time slots: [{"start": "09:00", "end": "17:00"}]
    
    -- Profile and Documents
    profilePic VARCHAR(255),
    certificate VARCHAR(255), -- File path or URL
    aadharCard VARCHAR(255), -- File path or URL
    panCard VARCHAR(255), -- File path or URL
    idCard VARCHAR(255), -- File path or URL
    
    -- Application Status
    applicationStatus ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
    
    -- Rating and Reviews
    rating DECIMAL(3,2) DEFAULT 0.00, -- Overall rating (0.00 to 5.00)
    totalReviews INT DEFAULT 0, -- Total number of reviews
    
    -- Verification Status
    isVerified BOOLEAN DEFAULT FALSE,
    isBackgroundChecked BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    addedBy INT, -- Admin who added this worker
    
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

-- Create a separate table for worker reviews
CREATE TABLE WorkerReviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    customerId INT NOT NULL,
    bookingId INT, -- Reference to the booking this review is for
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES Employee(id) ON DELETE CASCADE,
    FOREIGN KEY (customerId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookingId) REFERENCES Bookings(id) ON DELETE SET NULL,
    
    -- Ensure one review per customer per worker per booking
    UNIQUE KEY unique_booking_review (workerId, customerId, bookingId)
);

-- Create a table for worker availability slots
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
    
    -- Ensure no overlapping time slots for the same worker and day
    UNIQUE KEY unique_worker_day_time (workerId, dayOfWeek, startTime, endTime)
);

-- Create a table for worker portfolios (before/after photos, work samples)
CREATE TABLE WorkerPortfolio (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workerId INT NOT NULL,
    imageUrl VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    workType VARCHAR(255), -- Type of work shown in this image
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workerId) REFERENCES Employee(id) ON DELETE CASCADE
);

-- Insert sample data for testing
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

-- Update the Users table to support the new role structure
ALTER TABLE Users MODIFY COLUMN role ENUM('admin', 'employee', 'user') NOT NULL;

-- Add indexes for better performance
CREATE INDEX idx_employee_workType_state ON Employee(workType, state);
CREATE INDEX idx_employee_rating_available ON Employee(rating, isAvailable);
CREATE INDEX idx_employee_applicationStatus ON Employee(applicationStatus);
