const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Shift = sequelize.define("Shift", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    shiftName: { type: DataTypes.STRING, allowNull: false }, // Morning, Night, etc.
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false }
}, { timestamps: true });

module.exports = Shift;
