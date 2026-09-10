import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust absolute uploads directory resolution
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Also ensure cwd uploads directory exists if backend was invoked from project root
const cwdUploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(cwdUploadDir)) {
  fs.mkdirSync(cwdUploadDir, { recursive: true });
}

// Cryptographic UUID File Storage (Prevents Path Traversal Attacks)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (dirErr) {
      cb(dirErr, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const randomUuid = crypto.randomUUID();
    let ext = path.extname(file.originalname || '').toLowerCase();

    // Map MIME types to canonical file extensions
    const mimeToExt = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/svg': '.svg',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
    };

    // If original name doesn't have a valid extension, or if it's a PNG payload that had a legacy .jpg filename
    if (!ext || !['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.pdf'].includes(ext)) {
      ext = mimeToExt[file.mimetype] || '.png';
    } else if (file.mimetype === 'image/png' && (ext === '.jpg' || ext === '.jpeg')) {
      // If the mimetype is PNG (e.g. cropped canvas output), strictly enforce .png extension
      ext = '.png';
    }

    // Strip original filename to prevent directory traversal payloads (../../etc/passwd)
    cb(null, `${randomUuid}${ext}`);
  },
});

// Strict MIME Type & Extension Filter (Supports High-Res Images, SVGs, and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/svg',
    'image/gif',
    'application/pdf',
  ];
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.pdf'];
  const ext = path.extname(file.originalname || '').toLowerCase();

  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype) || (ext === '.svg' && (file.mimetype || '').includes('xml'));
  const isExtAllowed = !ext || allowedExtensions.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format (${file.mimetype || 'unknown'}). Only JPEG, PNG, WEBP, SVG, and PDF files are allowed.`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB File Size Limit (accommodates high-res map graphics/SVGs)
});

export default upload;
