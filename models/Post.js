const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 150,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    index: true,
  },
  content: {
    type: String, // Rich text HTML
    required: true,
  },
  coverImage: {
    type: String, // Image URL (e.g., Cloudinary)
    default: '',
  },
  videoUrl: {
    type: String, // Optional video embed URL (YouTube, Vimeo)
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  language: {
    type: String,
    default: 'en',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

// 🔁 Auto-generate slug from title
postSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
