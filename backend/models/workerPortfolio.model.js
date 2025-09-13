const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Employee = require("./employee.model");

const WorkerPortfolio = sequelize.define("WorkerPortfolio", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    workerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Employee, key: "id" } 
    },
    imageUrl: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    workType: { type: DataTypes.STRING, allowNull: true }, // Type of work shown in this image
}, { 
    timestamps: true,
    indexes: [
        { fields: ['workerId'] },
        { fields: ['workType'] }
    ]
});

module.exports = WorkerPortfolio;
