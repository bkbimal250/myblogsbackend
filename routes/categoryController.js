const Category = require('../models/Category');

// ✅ Create a new category (user-generated)
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name required' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(200).json({ message: 'Already exists', category: existing });

    const category = await Category.create({
      name,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Category created', category });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};
