import express from 'express';
import multer from 'multer';
import upload from '../middleware/uploadMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/upload (Protected file upload route)
router.post('/', verifyToken, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('❌ [Multer Upload Error]:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, message: 'File too large. Maximum allowed file size is 50MB.' });
        }
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload failed' });
    }

    const uploadedFile = req.file;

    if (!uploadedFile) {
      console.error('❌ [Upload Error]: No file provided in request payload');
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Build public static URL
    const fileUrl = `/uploads/${uploadedFile.filename}`;

    console.log(`✅ [Upload Success]: ${uploadedFile.originalname} -> ${fileUrl} (${uploadedFile.size} bytes, ${uploadedFile.mimetype})`);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,     // For components checking res.data.url
      fileUrl: fileUrl, // For components checking res.data.fileUrl
      filename: uploadedFile.filename,
      originalname: uploadedFile.originalname,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
    });
  });
});

export default router;
