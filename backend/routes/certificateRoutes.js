import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  getAllCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificateController.js';

const router = express.Router();

// Public read endpoints
router.get('/', getAllCertificates);
router.get('/:id', getCertificateById);

// Protected mutation endpoints
router.post('/', verifyToken, createCertificate);
router.put('/:id', verifyToken, updateCertificate);
router.delete('/:id', verifyToken, deleteCertificate);

export default router;
