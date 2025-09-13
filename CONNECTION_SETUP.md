# Backend-Frontend Connection Setup

## 🚀 Quick Start

### 1. Install Dependencies

**Frontend:**
```bash
npm install axios
```

**Backend:**
```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Backend will run on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on: `http://localhost:8080` (or `http://localhost:5173` for Vite)

### 4. Test Connection

Run the test script:
```bash
node test-connection.js
```

## 🔧 What Was Added

### Frontend Changes:
- ✅ **API Configuration** (`src/lib/api.ts`)
- ✅ **Authentication Service** (`src/services/authService.ts`)
- ✅ **Employee Service** (`src/services/employeeService.ts`)
- ✅ **Booking Service** (`src/services/bookingService.ts`)
- ✅ **API Hook** (`src/hooks/useApi.ts`)
- ✅ **Updated AuthModal** with real API calls
- ✅ **Updated WorkerRegistration** with real API calls

### Backend Changes:
- ✅ **CORS Configuration** for frontend origin
- ✅ **Proper error handling**

## 🎯 API Endpoints

### Authentication
- `POST /api/users/login` - Customer login
- `POST /api/users/register` - User registration
- `POST /api/admin/login` - Admin login
- `POST /api/employee/login` - Employee/Worker login

### Employee Management
- `POST /api/employee/register` - Employee registration
- `GET /api/employee/profile` - Get employee profile
- `PUT /api/employee/profile` - Update profile

### Booking Management
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/employee-bookings` - Get employee bookings
- `PUT /api/bookings/:id/status` - Update booking status

### Admin
- `GET /api/admin/employees` - Get all employees
- `PUT /api/admin/employees/:id/approve` - Approve employee
- `PUT /api/admin/employees/:id/reject` - Reject employee

## 🔐 Default Credentials

### Admin Login
- **Email:** `admin@example.com`
- **Password:** `Test@123`
- **Endpoint:** `POST /api/admin/login`
- **Backend Role:** `Admin` → Frontend: `/admin-dashboard`

### Employee Login
- **Email:** `thejas@gmail.com`
- **Password:** `Test@123`
- **Endpoint:** `POST /api/employee/login`
- **Backend Role:** `Employee` → Frontend: `/worker-dashboard`

### Customer Login
- **Endpoint:** `POST /api/users/login`
- **Backend Role:** `User` → Frontend: `/customer-dashboard`

## 🐛 Troubleshooting

### Backend Not Starting
1. Check if MySQL is running
2. Verify database credentials in `backend/config/db.js`
3. Ensure all dependencies are installed

### CORS Errors
1. Verify backend CORS configuration in `backend/server.js`
2. Check if frontend URL is in allowed origins
3. **Restart backend server** after CORS changes
4. Common frontend ports: `http://localhost:3000`, `http://localhost:5173`, `http://localhost:8080`

### API Connection Failed
1. Ensure backend is running on port 5000
2. Check if `VITE_API_URL` is set correctly
3. Verify network connectivity

## 📝 Next Steps

1. **Test Authentication Flow**
   - Register new users
   - Login with different roles
   - Verify token storage

2. **Test Employee Registration**
   - Submit worker applications
   - Upload documents
   - Check admin approval workflow

3. **Test Booking System**
   - Create bookings
   - Update booking status
   - View booking history

4. **Add More Features**
   - Real-time notifications
   - File upload handling
   - Payment integration
   - Email notifications

## 🎉 Success Indicators

✅ Backend server starts without errors  
✅ Frontend connects to backend APIs  
✅ Authentication works end-to-end  
✅ Data flows between frontend and backend  
✅ CORS errors are resolved  
✅ File uploads work properly  

---

**Note:** This setup connects the existing backend with the frontend. Make sure your database is properly configured and running before testing the connection.
