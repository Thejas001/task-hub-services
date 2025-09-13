const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user.model");
const Employee = require("./employee.model");

const Payment = sequelize.define("payments", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: "id" } 
    },
    employeeId: { 
        type: DataTypes.INTEGER, 
        allowNull: true, 
        references: { model: Employee, key: "id" } 
    },
    paymentType: { 
        type: DataTypes.ENUM('registration_fee', 'service_payment', 'booking_payment'), 
        allowNull: false 
    },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'INR' },
    paymentMethod: { 
        type: DataTypes.ENUM('razorpay', 'stripe', 'paypal', 'bank_transfer', 'cash'), 
        allowNull: false 
    },
    paymentStatus: { 
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'), 
        allowNull: false, 
        defaultValue: 'pending' 
    },
    transactionId: { type: DataTypes.STRING, allowNull: true }, // External payment gateway transaction ID
    paymentGatewayResponse: { type: DataTypes.JSON, allowNull: true }, // Store full response from payment gateway
    description: { type: DataTypes.TEXT, allowNull: true },
    receipt: { type: DataTypes.STRING, allowNull: true }, // Receipt file path
    paidAt: { type: DataTypes.DATE, allowNull: true },
    refundedAt: { type: DataTypes.DATE, allowNull: true },
    refundAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    refundReason: { type: DataTypes.TEXT, allowNull: true },
}, { 
    timestamps: true,
    indexes: [
        { fields: ['userId'] },
        { fields: ['employeeId'] },
        { fields: ['paymentType'] },
        { fields: ['paymentStatus'] },
        { fields: ['transactionId'] }
    ]
});

module.exports = Payment;
