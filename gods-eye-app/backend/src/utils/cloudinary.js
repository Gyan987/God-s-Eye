const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImageBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'gods-eye' },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result?.secure_url || '');
      }
    );
    stream.end(buffer);
  });

module.exports = { uploadImageBuffer };
