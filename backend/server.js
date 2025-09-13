require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const sequelize = require('./config/db');
const models = require('./models'); // Load models
const notificationService = require('./services/notificationService');

const app = express();
const server = http.createServer(app);

// Configure CORS to allow frontend origin
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'], // Include all common dev ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/categories', require('./routes/serviceCategory.routes'));

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

// Initialize notification service
notificationService.initialize(server);

server.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        console.log('🚀 Server running on port', PORT);
        console.log('🔔 WebSocket notifications available at ws://localhost:' + PORT + '/ws/notifications');
        
        // Ensure service categories table exists without altering other tables
        if (models && models.ServiceCategory) {
            await models.ServiceCategory.sync();
            console.log('✅ ServiceCategory table ensured');
        }
        
        // Ensure booking table exists
        if (models && models.Booking) {
            await models.Booking.sync();
            console.log('✅ Booking table ensured');
        }
        
        // Create default admin user after database sync
        await createDefaultAdmin();
        
    } catch (error) {
        console.error('❌ Server startup error:', error);
    }
});
