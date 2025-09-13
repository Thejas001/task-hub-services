const sequelize = require('../config/db');
const User = require('./user.model');
const Employee = require('./employee.model');
const Attendance = require('./attendance.model');
const LeaveRequest = require('./leaveRequest.model');
const Payroll = require('./payroll.model');
const JobPost = require('./jobpost.model');
const Booking = require('./booking.model');
const Payment = require('./payment.model');
const ServiceCategory = require('./serviceCategory.model');

// Define relationships FIRST
User.hasMany(Employee, { foreignKey: 'addedBy' });
Employee.belongsTo(User, { foreignKey: 'addedBy' });

// Employee belongs to User (for userId relationship)
User.hasMany(Employee, { foreignKey: 'userId', as: 'employeeUser' });
Employee.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Employee–JobPost relationship for posting jobs
Employee.hasMany(JobPost, { foreignKey: 'employeeId' });
JobPost.belongsTo(Employee, { foreignKey: 'employeeId' });

// User–JobPost relationship (JobPost also has userId)
User.hasMany(JobPost, { foreignKey: 'userId', as: 'jobPosts' });
JobPost.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Booking belongs to Employee
Employee.hasMany(Booking, { foreignKey: 'employeeId', as: 'bookings' });
Booking.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// Payment relationships
User.hasMany(Payment, { foreignKey: 'userId' });
Payment.belongsTo(User, { foreignKey: 'userId' });
Employee.hasMany(Payment, { foreignKey: 'employeeId' });
Payment.belongsTo(Employee, { foreignKey: 'employeeId' });

// Sync database after defining associations
// Temporarily disabled to avoid "Too many keys" error
// sequelize.sync({ alter: true })
//     .then(() => console.log('✅ Tables synced!'))
//     .catch(err => console.error('❌ Sync error:', err));

// Export ALL models for controller/service usage
module.exports = { sequelize, User, Employee, Attendance, LeaveRequest, Payroll, JobPost, Booking, Payment, ServiceCategory };
