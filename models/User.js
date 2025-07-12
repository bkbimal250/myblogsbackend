const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },

  // 🧑 Role-based access
  role: {
    type: String,
    enum: ['user', 'author', 'admin'],
    default: 'user',
  },

  // 🧠 Additional personal info
  skills: {
    type: [String],
    default: [],
  },
  languages: {
    type: [String],
    default: [],
  },
  country: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
    maxlength: 300,
  },

  // 🕒 Account activity
  lastLogin: {
    type: Date,
  },

  // 🔁 Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true, // adds createdAt and updatedAt
});


// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔐 Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔁 Generate password reset token
userSchema.methods.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
