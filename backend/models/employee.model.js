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

const Employee = sequelize.define("Employee", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: "id" } 
    },
    position: { type: DataTypes.STRING, allowNull: true },
    department: { type: DataTypes.STRING, allowNull: true },
    salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    joiningDate: { type: DataTypes.DATEONLY, allowNull: true },
    Name: { type: DataTypes.STRING, allowNull: true },
    // Reporting Manager (who they report to)
    reportingManagerId: { 
        type: DataTypes.INTEGER, 
        allowNull: true, 
    },

    // Shift Management
    shiftName: { type: DataTypes.STRING, allowNull: true }, // Morning, Evening, Night
    shiftStartTime: { type: DataTypes.TIME, allowNull: true }, // e.g., 09:00 AM
    shiftEndTime: { type: DataTypes.TIME, allowNull: true },  // e.g., 06:00 PM

    firstName: { type: DataTypes.STRING, allowNull: false },
    middleName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    state: { type: DataTypes.STRING, allowNull: false },
    pinCode: { type: DataTypes.STRING, allowNull: false },
    mobileNumber: { type: DataTypes.STRING, allowNull: false },
    certificate: { type: DataTypes.STRING, allowNull: true }, // file path or URL
    aadharCard: { type: DataTypes.STRING, allowNull: true }, // file path or URL
    panCard: { type: DataTypes.STRING, allowNull: true }, // file path or URL
    applicationStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    profilePic: { type: DataTypes.STRING, allowNull: true },
    nationality: { type: DataTypes.STRING, allowNull: false },
    workExperience: { type: DataTypes.STRING, allowNull: false },
    workType: { type: DataTypes.STRING, allowNull: true }, // Electrician, Plumber, Painter, etc.
    idCard: { type: DataTypes.STRING, allowNull: true },
}, { timestamps: true });

module.exports = Employee;
