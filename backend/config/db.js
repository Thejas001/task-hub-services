const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'task_hub_services', 
    process.env.DB_USER || 'root', 
    process.env.DB_PASSWORD || '', 
    {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
    }
);

// Test connection
sequelize.authenticate()
    .then(() => console.log('✅ Database connected!'))
    .catch(err => console.error('❌ Database connection error:', err));

module.exports = sequelize;
