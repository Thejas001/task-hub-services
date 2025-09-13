# HRMS - Human Resource Management System

A comprehensive HR management system with employee management, attendance tracking, leave management, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL/PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HRMS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure database**
   - Update database configuration in `config/db.js`
   - Create your database

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 👑 Default Admin Access

**The system automatically creates a default admin user on first startup:**

- **Email:** `admin@admin.com`
- **Password:** `admin123`
- **Role:** Admin

### 🔐 Security Notice
⚠️ **IMPORTANT:** Change the default password immediately after first login for security!

### Manual Admin Creation
If you need to create the admin user manually:
```bash
node createAdminUser.js
```

## 📋 Features

### Admin Panel
- Employee management
- Attendance tracking
- Leave approval
- Payroll management
- User management

### Employee Features
- Profile management
- Attendance marking
- Leave application
- Work requests

### Worker Portal
- Job posting
- Work applications
- Profile management

## 🛠️ API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration

### Admin Routes
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Employee Routes
- `POST /api/employee/register` - Employee registration
- `GET /api/employee/profile` - Get employee profile
- `PUT /api/employee/profile` - Update profile

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/report` - Get attendance report

### Leave Management
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/requests` - Get leave requests
- `PUT /api/leave/approve/:id` - Approve/reject leave

## 🗄️ Database Schema

The system uses the following main models:
- **User** - Authentication and user management
- **Employee** - Employee details and profiles
- **Attendance** - Attendance tracking
- **LeaveRequest** - Leave applications
- **WorkRequest** - Work requests
- **JobPost** - Job postings
- **Booking** - Service bookings

## 🔧 Configuration

### Environment Variables
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hrms_db
DB_DIALECT=mysql
PORT=5000
```

### Database Setup
1. Create your database
2. Update `config/db.js` with your credentials
3. Run the server - tables will be created automatically

## 🚀 Deployment

### Production Setup
1. Set environment variables for production
2. Use a production database
3. Configure proper security settings
4. Set up SSL certificates
5. Use PM2 or similar process manager

### Docker (Optional)
```bash
docker build -t hrms .
docker run -p 5000:5000 hrms
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note:** This system automatically creates a default admin user with credentials `admin@admin.com` / `admin123`. Please change these credentials after first login for security purposes.
