const express = require('express');
const router = express.Router();
const { createJobPost, getMyJobPosts, getAllJobPosts } = require('../controllers/jobpost.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');

// Employee: view own job posts
router.get('/my-posts', authMiddleware, authRole(['employee']), getMyJobPosts);

// Optional: create and view all job posts
router.post('/create', authMiddleware, authRole(['employee']), createJobPost);

// Admin: view all job posts with filters
router.get('/all', authMiddleware, authRole(['Admin']), getAllJobPosts);

module.exports = router;
