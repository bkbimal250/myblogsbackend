const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const { storage, imageStorage, videoStorage } = require('../utils/cloudinary');
const { protect } = require('../middlewares/authMiddleware');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

const upload = multer({ dest: 'uploads/' }); // Use local storage for processing

// Helper to process and upload image
async function processAndUploadImage(file, cloudinary, folder = 'blog-images') {
  const webpPath = file.path + '.webp';
  await sharp(file.path)
    .resize({ width: 800 }) // Resize to max width 800px (customize as needed)
    .webp({ quality: 80 })
    .toFile(webpPath);

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(webpPath, {
    folder,
    resource_type: 'image',
    format: 'webp',
  });

  // Cleanup temp files
  fs.unlinkSync(file.path);
  fs.unlinkSync(webpPath);

  return result.secure_url;
}

const { cloudinary } = require('../utils/cloudinary');

router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await processAndUploadImage(req.file, cloudinary, 'blog-images');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload user avatar
router.post('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await processAndUploadImage(req.file, cloudinary, 'avatars');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload post cover image
router.post('/cover', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await processAndUploadImage(req.file, cloudinary, 'cover-images');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Video upload route
const videoUpload = multer({ dest: 'uploads/' });

async function processAndUploadVideo(file, cloudinary, folder = 'blog-videos') {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.mp4', '.mov', '.avi', '.mkv'];
  if (!allowed.includes(ext)) throw new Error('Invalid video format');

  // Optional: compress/resize video (here, just copy to .mp4 for demo)
  const outputPath = file.path + '.mp4';
  await new Promise((resolve, reject) => {
    ffmpeg(file.path)
      .outputOptions('-preset', 'fast')
      .videoCodec('libx264')
      .size('?x720') // Resize to 720p height, keep aspect
      .format('mp4')
      .on('end', resolve)
      .on('error', reject)
      .save(outputPath);
  });

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(outputPath, {
    folder,
    resource_type: 'video',
    format: 'mp4',
  });

  // Cleanup temp files
  fs.unlinkSync(file.path);
  fs.unlinkSync(outputPath);

  return result.secure_url;
}

router.post('/video', protect, videoUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = await processAndUploadVideo(req.file, cloudinary, 'blog-videos');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
