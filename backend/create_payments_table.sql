-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    employeeId INT NULL,
    paymentType ENUM('registration_fee', 'service_payment', 'booking_payment') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    paymentMethod ENUM('razorpay', 'stripe', 'paypal', 'bank_transfer', 'cash') NOT NULL,
    paymentStatus ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    transactionId VARCHAR(255) NULL,
    paymentGatewayResponse JSON NULL,
    description TEXT NULL,
    receipt VARCHAR(255) NULL,
    paidAt DATETIME NULL,
    refundedAt DATETIME NULL,
    refundAmount DECIMAL(10,2) NULL,
    refundReason TEXT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_userId (userId),
    INDEX idx_employeeId (employeeId),
    INDEX idx_paymentType (paymentType),
    INDEX idx_paymentStatus (paymentStatus),
    INDEX idx_transactionId (transactionId)
);

-- Insert sample payment data for testing
INSERT INTO payments (userId, employeeId, paymentType, amount, currency, paymentMethod, paymentStatus, transactionId, description, paidAt) 
VALUES 
(1, 1, 'registration_fee', 500.00, 'INR', 'razorpay', 'completed', 'txn_001_1234567890', 'Worker registration fee', NOW()),
(2, 2, 'registration_fee', 500.00, 'INR', 'stripe', 'completed', 'txn_002_1234567891', 'Worker registration fee', NOW());

SELECT 'Payments table created successfully!' as status;
