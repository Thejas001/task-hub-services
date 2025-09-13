const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user.model");

const JobPost = sequelize.define("JobPost", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: User, key: "id" }
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "employees", key: "id" }
    },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    ratePerHour: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    ratePerDay: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    location: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active"
    }
}, { 
    timestamps: true,
    tableName: 'jobposts'
});

module.exports = JobPost;
