// const express = require('express');
// const { register, login, getProfile, getAllusers } = require('../controllers/user.controller');
// const authMiddleware = require('../middleware/authMiddleware');

// const router = express.Router();

// router.post('/register', register);
// router.post('/login', login);
// router.get('/profile', authMiddleware, getProfile);
// router.get('/all',authMiddleware ,getAllusers);

// module.exports = router;

const express = require('express');
const {
    registerUser,
    registerWorker,
    login,
    getProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { employeeDocsUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

//router.post('/register', employeeDocsUpload, register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.get('/all', authMiddleware, getAllUsers);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);
router.post('/register', registerUser);
router.post('/register-worker', registerWorker);

module.exports = router;
