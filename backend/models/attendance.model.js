const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user.model');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: { model: User, key: 'id' }
  },
  status: {
    type: DataTypes.ENUM('Present', 'Absent'),
    defaultValue: 'Absent'
  },
  approvalStatus: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
    defaultValue: 'Pending'
  },
  times: {
    type: DataTypes.JSON,  // ✅ Stores multiple check-in/check-out timestamps
    allowNull: true,
    defaultValue: []
  },
  inOutStatus: {
    type: DataTypes.ENUM('IN', 'OUT'),
    defaultValue: 'OUT'
  },
  totalHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  checkInCount: {  // ✅ Count of how many times the user checked in
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  checkOutCount: {  // ✅ Count of how many times the user checked out
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  shiftStart: {
    type: DataTypes.TIME,
    allowNull: true
  },
  shiftEnd: {
    type: DataTypes.TIME,
    allowNull: true
  },
  approvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Attendance;
