require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * File Upload Validation Middleware
 * Validates MIME type, size, and count
 */

// Allowed MIME types and extensions
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'video/mp4': 'mp4',
  'application/pdf': 'pdf'
};

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'mp4', 'pdf'];

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to validate MIME type
const fileFilter = (req, file, cb) => {
  // Validate MIME type (critical - not just extension)
  if (!ALLOWED_TYPES[file.mimetype]) {
    return cb(new Error(`File type not allowed. Allowed types: ${Object.keys(ALLOWED_TYPES).join(', ')}`), false);
  }

  // Validate extension as secondary check
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File extension not allowed: ${ext}`), false);
  }

  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_KB || 10240) * 1024, // Convert KB to bytes
    files: parseInt(process.env.MAX_FILES_PER_SUBMISSION || 3)
  }
});

/**
 * Express middleware to handle multiple file uploads with validation
 */
const uploadFiles = upload.array('files', parseInt(process.env.MAX_FILES_PER_SUBMISSION || 3));

/**
 * Wrapper middleware to catch multer errors and provide proper response
 */
const fileValidationMiddleware = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'FILE_TOO_LARGE') {
        return res.status(400).json({
          error: `File size exceeds maximum limit of ${process.env.MAX_FILE_SIZE_KB || 10240} KB`
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          error: `Cannot upload more than ${process.env.MAX_FILES_PER_SUBMISSION || 3} files`
        });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Validate minimum files if required
    if (req.files && req.files.length > 0) {
      // Files are optional, so this is just for additional validation if needed
      req.uploadedFiles = req.files;
    }

    next();
  });
};

module.exports = {
  fileValidationMiddleware,
  ALLOWED_TYPES,
  ALLOWED_EXTENSIONS
};
