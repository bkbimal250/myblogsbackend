const express = require('express');
const router = express.Router();
const { createCategory, getAllCategories } = require('../controllers/categoryController');
const { protect } = require('../middlewares/authMiddleware');

// Public
router.get('/', getAllCategories);

// Protected (user can add category)
router.post('/', protect, createCategory);

module.exports = router;
