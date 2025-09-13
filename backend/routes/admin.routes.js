const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');

// Admin login route
router.post('/login', authController.loginAdmin);

// Create worker (Admin only)
router.post('/create-worker', authMiddleware, authRole(['Admin']), authController.createWorker);

module.exports = router;
