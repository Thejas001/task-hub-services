require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('./models'); // Sync models

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/employee', require('./routes/employee.routes'));
app.use('/api/leave', require('./routes/leave.routes'));
app.use('/api/attendance', require('./routes/attendance.routes'));
app.use('/api/workrequests', require('./routes/workrequest.routes'));
app.use('/api/jobposts', require('./routes/jobpost.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// After all your routes
app.use((req, res, next) => {
    res.status(404).json({
      message: 'Route not found',
      status: 404
    });
  });
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    });
  });

// Function to create default admin user
async function createDefaultAdmin() {
    try {
        const { User } = require('./models');
        
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ 
            where: { 
                email: 'admin@example.com',
                role: 'Admin'
            } 
        });
        
        if (existingAdmin) {
            console.log('✅ Default admin user already exists!');
            console.log('📧 Email: admin@example.com');
            console.log('🔑 Password: Test@123');
            return;
        }

        // Create admin user with existing credentials
        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: 'Test@123', // Using existing admin credentials
            role: 'Admin',
            phoneNumber: '1234567890',
            address: 'Admin Address',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('🎉 Default admin user created successfully!');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: Test@123');
        console.log('🆔 User ID:', adminUser.id);
        console.log('⚠️  Please change the default password after first login!');
        
    } catch (error) {
        console.error('❌ Error creating default admin user:', error);
    }
}
    
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('🚀 Server running on port', PORT);
        
        await sequelize.sync({ alter: true }); // Ensure tables, including Booking, are synced
        console.log('✅ All models synced');
        
        // Create default admin user after database sync
        await createDefaultAdmin();
        
    } catch (error) {
        console.error('❌ Server startup error:', error);
    }
});
