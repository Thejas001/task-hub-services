const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Payroll = sequelize.define('Payroll', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
    salary: { type: DataTypes.FLOAT, allowNull: false },
    month: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'paid'), defaultValue: 'pending' }
}, { timestamps: true });

module.exports = Payroll;

