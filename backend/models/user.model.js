// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const User = sequelize.define('User', {
//     id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
//     name: { type: DataTypes.STRING, allowNull: false },
//     email: { type: DataTypes.STRING, unique: true, allowNull: false },
//     password: { type: DataTypes.STRING, allowNull: false },
//     role: { type: DataTypes.ENUM('admin', 'hr', 'employee'), defaultValue: 'employee' }
// }, { timestamps: true });

// module.exports = User;

const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { 
        type: DataTypes.ENUM("Admin", "HR", "Employee", "User"), 
        allowNull: false, 
        defaultValue: "User" 
    }
}, { timestamps: true });

module.exports = User;
