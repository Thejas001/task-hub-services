const express = require('express');
const router = express.Router();
const { applyLeave, getAllLeaves, updateLeaveStatus, getUserLeaves, cancelLeave } = require('../controllers/leave.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Employee Routes
router.post('/apply', authMiddleware, applyLeave);
router.get('/history', authMiddleware, getUserLeaves);
router.delete("/leave/cancel/:leaveId", authMiddleware, cancelLeave);

// Admin Routes
router.get('/all', authMiddleware, getAllLeaves);
router.put('/:id/status', authMiddleware, updateLeaveStatus);

module.exports = router;
