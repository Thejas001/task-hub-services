// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');
// const User = require('./user.model'); // Ensure User model is required

// const Employee = sequelize.define('Employee', {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     userId: { 
//         type: DataTypes.INTEGER, 
//         allowNull: false, 
//         references: { model: User, key: 'id' },
//     },
//     position: { type: DataTypes.STRING, allowNull: true },
//     department: { type: DataTypes.STRING, allowNull: true },
//     salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
//     joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
// }, { timestamps: true });

// module.exports = Employee;
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user.model");

const Employee = sequelize.define("employees", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: "id" } 
    },
    
    // Basic Personal Information
    firstName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    mobileNumber: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    
    // Location Information
    address: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    pinCode: { type: DataTypes.STRING, allowNull: false },
    city: { type: DataTypes.STRING, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: false },
    
    // Professional Information
    workType: { type: DataTypes.STRING, allowNull: false }, // Plumbing, Electrical, Gardening, Cleaning, etc.
    workExperience: { type: DataTypes.STRING, allowNull: false }, // Years of experience
    hourlyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: true }, // Hourly rate for services
    bio: { type: DataTypes.TEXT, allowNull: true }, // Professional bio/description
    
    // Skills and Expertise
    skills: { type: DataTypes.JSON, allowNull: true }, // Array of skills
    certifications: { type: DataTypes.JSON, allowNull: true }, // Array of certifications
    
    // Availability
    isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    availableDays: { type: DataTypes.JSON, allowNull: true }, // Days of week available
    availableTimeSlots: { type: DataTypes.JSON, allowNull: true }, // Time slots
    
    // Profile and Documents
    profilePic: { type: DataTypes.STRING, allowNull: true },
    certificate: { type: DataTypes.STRING, allowNull: true }, // File path or URL
    aadharCard: { type: DataTypes.STRING, allowNull: true }, // File path or URL
    panCard: { type: DataTypes.STRING, allowNull: true }, // File path or URL
    idCard: { type: DataTypes.STRING, allowNull: true }, // File path or URL
    
    // Application Status
    applicationStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    
    // Rating and Reviews
    rating: { type: DataTypes.DECIMAL(3, 2), allowNull: false, defaultValue: 0.00 }, // Overall rating (0.00 to 5.00)
    totalReviews: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // Total number of reviews
    
    // Verification Status
    isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isBackgroundChecked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    
    // Admin who added this worker
    addedBy: { 
        type: DataTypes.INTEGER, 
        allowNull: true,
        references: { model: User, key: "id" }
    },
}, { 
    timestamps: true,
    indexes: [
        { fields: ['workType'] },
        { fields: ['state'] },
        { fields: ['applicationStatus'] },
        { fields: ['rating'] },
        { fields: ['isAvailable'] }
    ]
});

module.exports = Employee;
