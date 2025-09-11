const express = require('express');
const { addEmployee, getAllEmployee,getAllPendingWorkerApplications, updateEmployee, deleteEmployee, getEmployeeByUserId, getEmployeeStatus, verifyEmployee, updateOwnProfile, updateProfilePic, getPublicWorkers } = require('../controllers/employee.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');
const { upload } = require('../middleware/uploadMiddleware');
const { loginEmployee } = require('../controllers/employee.controller');
const { employeeDocsUpload } = require('../middleware/uploadMiddleware');
const router = express.Router();

// Public route - no authentication required
router.get('/public', getPublicWorkers);

router.get('/', authMiddleware, getAllEmployee);
router.get('/:userId', authMiddleware, getEmployeeByUserId);
router.put('/update/:id', authMiddleware,authRole(["Admin", "HR","Employee"]), updateEmployee);
router.delete('/delete/:id', authMiddleware,authRole(["Admin"]), deleteEmployee);

// Employee checks their application status
router.get('/status', authMiddleware, authRole(["Employee"]), getEmployeeStatus);

// Admin verifies employee application
router.put('/verify/:id', authMiddleware, authRole(["Admin"]), verifyEmployee);

router.put('/me', authMiddleware, authRole(['Employee']), updateOwnProfile);

router.put('/profile-pic', authMiddleware, authRole(['Employee']), upload.single('profilePic'), updateProfilePic);


// Employee Self-Registration
router.post(
    '/register',
    upload.fields([
      { name: 'certificate', maxCount: 1 },
      { name: 'aadharCard', maxCount: 1 },
      { name: 'panCard', maxCount: 1 }
    ]),
    addEmployee
  );
  
  // Employee Login
  router.post(
    '/login',
    loginEmployee
  );

  router.get('/status', authMiddleware, authRole(["Employee"]), getEmployeeStatus);

  router.get(
    "/admin/employee/pending-applications",
    authMiddleware,
    authRole(["Admin"]),
    getAllPendingWorkerApplications
  );
  
module.exports = router;

