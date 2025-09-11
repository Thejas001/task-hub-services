const express = require('express');
const router = express.Router();
const { getAvailableWorkRequests, acceptWorkRequest, getMyAcceptedWork, completeWorkRequest } = require('../controllers/workrequest.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');

router.get('/available', authMiddleware, authRole(['Employee']), getAvailableWorkRequests);
router.put('/accept/:id', authMiddleware, authRole(['Employee']), acceptWorkRequest);
router.get('/my-accepted', authMiddleware, authRole(['Employee']), getMyAcceptedWork);
router.put('/complete/:id', authMiddleware, authRole(['Employee']), completeWorkRequest);

module.exports = router; 