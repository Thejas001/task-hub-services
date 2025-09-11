const express = require('express');
const router = express.Router();
const { createJobPost, getMyJobPosts } = require('../controllers/jobpost.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');

// Employee: view own job posts
router.get('/my-posts', authMiddleware, authRole(['Employee']), getMyJobPosts);

// Optional: create and view all job posts
router.post('/create', authMiddleware, authRole(['Employee']), createJobPost);

module.exports = router;
