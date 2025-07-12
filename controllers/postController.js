const Post = require('../models/Post');
const Category = require('../models/Category');
const slugify = require('slugify');

// ✅ Create New Blog Post
exports.createPost = async (req, res) => {
  try {
    const {
      title,
      content,
      coverImage,
      videoUrl,
      tags,
      categories, // array of category names
      language
    } = req.body;

    const slug = slugify(title, { lower: true, strict: true });

    // Check if slug exists already
    const existing = await Post.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'A post with similar title exists. Use a different title.' });
    }

    // Create or find categories
    const categoryIds = [];
    if (categories && categories.length > 0) {
      for (const name of categories) {
        let category = await Category.findOne({ name });
        if (!category) {
          category = await Category.create({ name, createdBy: req.user._id });
        }
        categoryIds.push(category._id);
      }
    }

    const newPost = await Post.create({
      title,
      content,
      slug,
      coverImage,
      videoUrl,
      tags,
      language,
      author: req.user._id,
      categories: categoryIds,
    });

    res.status(201).json({ message: 'Post created', post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};

// ✅ Get All Posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name email')
      .populate('categories', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
};

// ✅ Get Single Post by Slug
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'name email')
      .populate('categories', 'name');

    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch post', error: err.message });
  }
};

// ✅ Update Post
exports.updatePost = async (req, res) => {
  try {
    const {
      title,
      content,
      coverImage,
      videoUrl,
      tags,
      categories,
      language,
    } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Allow only author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not authorized to update this post' });
    }

    // Update categories
    const categoryIds = [];
    if (categories && categories.length > 0) {
      for (const name of categories) {
        let category = await Category.findOne({ name });
        if (!category) {
          category = await Category.create({ name, createdBy: req.user._id });
        }
        categoryIds.push(category._id);
      }
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.coverImage = coverImage || post.coverImage;
    post.videoUrl = videoUrl || post.videoUrl;
    post.tags = tags || post.tags;
    post.language = language || post.language;
    post.categories = categoryIds.length > 0 ? categoryIds : post.categories;

    if (title && title !== post.title) {
      post.slug = slugify(title, { lower: true, strict: true });
    }

    await post.save();

    res.json({ message: 'Post updated', post });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update post', error: err.message });
  }
};

// ✅ Delete Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Allow only author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
};
