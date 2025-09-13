const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');
const { listCategories, createCategory, getWorkTypes } = require('../controllers/serviceCategory.controller');

router.get('/', listCategories);
router.post('/', authMiddleware, authRole(['admin']), createCategory);
router.get('/work-types', getWorkTypes);

module.exports = router;


