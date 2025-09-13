const express = require('express');
const router = express.Router();
const { getAvailableWorkRequests, acceptWorkRequest, getMyAcceptedWork, completeWorkRequest } = require('../controllers/workrequest.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');

router.get('/available', authMiddleware, authRole(['employee']), getAvailableWorkRequests);
router.put('/accept/:id', authMiddleware, authRole(['employee']), acceptWorkRequest);
router.get('/my-accepted', authMiddleware, authRole(['employee']), getMyAcceptedWork);
router.put('/complete/:id', authMiddleware, authRole(['employee']), completeWorkRequest);

module.exports = router; 