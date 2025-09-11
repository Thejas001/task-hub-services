const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model'); // Ensure correct User model reference

const LeaveRequest = sequelize.define('LeaveRequest', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: 'id' } 
    },
leaveType: { 
    type: DataTypes.ENUM('Sick Leave', 'Casual Leave', 'Earned Leave', 'Maternity Leave', 'Paternity Leave'), 
    allowNull: false 
},

    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: true }, // Optional reason
    status: { 
        type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
        defaultValue: 'pending' 
    }
}, { timestamps: true });

module.exports = LeaveRequest;
