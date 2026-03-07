import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads');
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const imageFileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image uploads are allowed'));
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
