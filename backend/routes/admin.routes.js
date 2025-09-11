const express = require('express');
const router = express.Router();
const authController = require('../controllers/admin.controller');

// Admin login route
router.post('/login', authController.loginAdmin);

module.exports = router;
