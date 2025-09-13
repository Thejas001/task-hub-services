const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Employee = require("./employee.model");

const WorkerAvailability = sequelize.define("WorkerAvailability", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    workerId: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: Employee, key: "id" } 
    },
    dayOfWeek: { 
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'), 
        allowNull: false 
    },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    isAvailable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { 
    timestamps: true,
    indexes: [
        { fields: ['workerId'] },
        { fields: ['dayOfWeek'] },
        { fields: ['isAvailable'] },
        { 
            unique: true, 
            fields: ['workerId', 'dayOfWeek', 'startTime', 'endTime'],
            name: 'unique_worker_day_time'
        }
    ]
});

module.exports = WorkerAvailability;
