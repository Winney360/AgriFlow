import dotenv from 'dotenv';
dotenv.config();
import cloudinary from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary connected:', !!process.env.CLOUDINARY_CLOUD_NAME);

const upload = multer(); // memory storage

export const uploadToCloudinary = async (fileBuffer, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve(result.secure_url);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export default upload;
