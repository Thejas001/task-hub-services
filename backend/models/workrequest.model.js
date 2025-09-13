const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employee = require('./employee.model');
// You may need to create enduser.model.js if not present

const WorkRequest = sequelize.define('WorkRequest', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  employeeId: { type: DataTypes.INTEGER, allowNull: true, references: { model: Employee, key: 'id' } }, // null if not yet assigned
  endUserId: { type: DataTypes.INTEGER, allowNull: false }, // Add reference if EndUser model exists
  workType: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'), defaultValue: 'pending' },
  scheduledTime: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true });

module.exports = WorkRequest; 