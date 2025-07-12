const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Standardized env var
  api_key: process.env.CLOUDINARY_API_KEY,      // Standardized env var
  api_secret: process.env.CLOUDINARY_API_SECRET // Standardized env var
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-images',
    allowedFormats: ['webp'],
    resource_type: 'image',
  }
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'blog-videos',
    allowedFormats: ['mp4', 'mov', 'avi', 'mkv'],
    resource_type: 'video',
  }
});

module.exports = {
  cloudinary,
  imageStorage,
  videoStorage
};
