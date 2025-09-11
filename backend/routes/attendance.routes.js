
// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const authRole = require('../middleware/authRole');
// const { markAttendance, getEmployeeAttendance, getAllAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendance.controller');

// // Attendance Routes
// router.post('/', authMiddleware, authRole(['Employee','Admin','Hr']),  markAttendance);
// router.get('/:userId', authMiddleware, authRole(['Admin', 'Hr']),  getEmployeeAttendance);
// router.get('/', authMiddleware, authRole(['Admin', 'Hr']),  getAllAttendance);
// router.put('/:id', authMiddleware, authRole(['Admin', 'Hr']),  updateAttendance);
// router.delete('/:id', authMiddleware, authRole(['Admin']),  deleteAttendance);

// module.exports = router;
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');
const { checkIn, checkOut, approveAttendance, getAllAttendance, deleteAttendance, getAttendanceByUserId } = require('../controllers/attendance.controller');

// ✅ Employee Routes
router.post('/check-in', authMiddleware, authRole(['Admin', 'HR', 'Employee']), checkIn);
router.post('/check-out', authMiddleware, authRole(['Admin', 'HR', 'Employee']), checkOut);
router.get("/:userId", authMiddleware, authRole(['Admin', 'HR', 'Employee']), getAttendanceByUserId);
// ✅ Admin Routes
router.put('/approve', authMiddleware, authRole(['Admin', 'Hr']), approveAttendance);
router.get('/', authMiddleware, authRole(['Admin', 'Hr']), getAllAttendance);
router.delete('/:id', authMiddleware, authRole(['Admin']), deleteAttendance);

module.exports = router;
