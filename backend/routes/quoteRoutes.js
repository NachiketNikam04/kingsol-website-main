import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
  createQuote,
  getAllQuotes,
  updateQuoteStatus,
  deleteQuote,
} from '../controllers/quoteController.js';

const router = express.Router();

// POST /api/quotes (Public Quote Submission)
router.post('/', createQuote);

// GET /api/quotes (Protected Admin Tracker)
router.get('/', verifyToken, getAllQuotes);

// PATCH /api/quotes/:id/status (Protected Status Update)
router.patch('/:id/status', verifyToken, updateQuoteStatus);

// DELETE /api/quotes/:id (Protected Delete)
router.delete('/:id', verifyToken, deleteQuote);

export default router;
