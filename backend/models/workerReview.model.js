const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user.model");
const Employee = require("./employee.model");

const WorkerReview = sequelize.define("WorkerReview", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    workerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Employee, key: "id" } 
    },
    customerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: "id" } 
    },
    bookingId: { 
        type: DataTypes.INTEGER, 
        allowNull: true, 
        references: { model: "Bookings", key: "id" } 
    },
    rating: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: { type: DataTypes.TEXT, allowNull: true },
}, { 
    timestamps: true,
    indexes: [
        { fields: ['workerId'] },
        { fields: ['customerId'] },
        { fields: ['rating'] },
        { 
            unique: true, 
            fields: ['workerId', 'customerId', 'bookingId'],
            name: 'unique_booking_review'
        }
    ]
});

module.exports = WorkerReview;
