const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ServiceCategory = sequelize.define('service_categories', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    icon: { type: DataTypes.STRING, allowNull: true },
    color: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
    timestamps: true,
    indexes: [
        { fields: ['title'] },
        { fields: ['isActive'] }
    ]
});

module.exports = ServiceCategory;


