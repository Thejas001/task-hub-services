const express = require('express');
const { 
  addEmployee, completeWorkerProfile, getAllEmployee, getAllPendingWorkerApplications, updateEmployee, 
  deleteEmployee, getEmployeeByUserId, getEmployeeStatus, verifyEmployee, 
  updateOwnProfile, updateProfilePic, getPublicWorkers, searchWorkers, 
  getWorkerProfile, updateAvailability, getWorkerReviews, approveWorkerApplication, rejectWorkerApplication
} = require('../controllers/employee.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');
const { upload } = require('../middleware/uploadMiddleware');
const { loginEmployee } = require('../controllers/employee.controller');
const { employeeDocsUpload } = require('../middleware/uploadMiddleware');
const router = express.Router();

// Public routes - no authentication required
router.get('/public', getPublicWorkers);
router.get('/search', searchWorkers);
router.get('/profile/:workerId', getWorkerProfile);
router.get('/:workerId/reviews', getWorkerReviews);

router.get('/', authMiddleware, getAllEmployee);
// NOTE: keep parameterized routes AFTER specific routes to avoid conflicts
router.get('/by-user/:userId', authMiddleware, getEmployeeByUserId);
router.put('/update/:id', authMiddleware,authRole(["admin", "hr","employee"]), updateEmployee);
router.delete('/delete/:id', authMiddleware,authRole(["admin"]), deleteEmployee);

// Employee checks their application status
router.get('/status', authMiddleware, authRole(["employee"]), getEmployeeStatus);

// Admin verifies employee application
router.put('/verify/:id', authMiddleware, authRole(["admin"]), verifyEmployee);

router.put('/me', authMiddleware, authRole(['employee']), updateOwnProfile);

router.put('/profile-pic', authMiddleware, authRole(['employee']), upload.single('profilePic'), updateProfilePic);

// Worker availability management
router.put('/availability', authMiddleware, authRole(['employee']), updateAvailability);

// Admin worker application management
router.get('/pending-applications', authMiddleware, authRole(['admin']), getAllPendingWorkerApplications);
router.put('/approve/:id', authMiddleware, authRole(['admin']), approveWorkerApplication);
router.put('/reject/:id', authMiddleware, authRole(['admin']), rejectWorkerApplication);


// Complete worker profile with payment (authenticated)
router.post(
    '/complete-profile',
    authMiddleware,
    authRole(['employee']),
    upload.fields([
      { name: 'profilePic', maxCount: 1 },
      { name: 'certificate', maxCount: 1 },
      { name: 'aadharCard', maxCount: 1 },
      { name: 'panCard', maxCount: 1 },
      { name: 'idCard', maxCount: 1 }
    ]),
    completeWorkerProfile
  );

// Legacy employee registration (for backward compatibility)
router.post(
    '/register',
    upload.fields([
      { name: 'profilePic', maxCount: 1 },
      { name: 'certificate', maxCount: 1 },
      { name: 'aadharCard', maxCount: 1 },
      { name: 'panCard', maxCount: 1 },
      { name: 'idCard', maxCount: 1 }
    ]),
    addEmployee
  );
  
  // Employee Login
  router.post(
    '/login',
    loginEmployee
  );


  // Removed duplicate route for pending applications; use /pending-applications above
  
module.exports = router;

