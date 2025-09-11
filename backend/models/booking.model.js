const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Employee = require('./employee.model');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    customerPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    workDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    preferredDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    preferredTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    estimatedHours: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 12
        }
    },
    specialRequirements: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'completed'),
        defaultValue: 'pending',
        allowNull: false
    },
    bookingDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['employeeId', 'preferredDate', 'preferredTime'],
            unique: true,
            name: 'unique_booking_slot'
        },
        {
            fields: ['status']
        },
        {
            fields: ['preferredDate']
        }
    ]
});

module.exports = Booking;
