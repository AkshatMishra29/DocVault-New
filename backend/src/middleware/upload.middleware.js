import multer from 'multer';

// Memory storage for file uploads up to 25 MB
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

