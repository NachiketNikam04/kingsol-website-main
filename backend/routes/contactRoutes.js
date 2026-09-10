import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { verifyInquiryAccess } from '../middleware/authorizeOwnership.js';
import { validateContactInquiry } from '../middleware/validator.js';
import {
  submitContactInquiry,
  sendDirectEmail,
  getAllInquiries,
  markInquiryAsRead,
  deleteInquiry,
  getContactPageSettings,
  updateContactPageSettings,
} from '../controllers/contactController.js';

const router = express.Router();

/* ==========================================================================
   CONTACT FORM INQUIRIES SUBMISSIONS & TRACKER ROUTES
   ========================================================================== */

// POST /api/contact (Public - Client Contact Form / Quick Quote Submission with SMTP Email Alert)
router.post('/', validateContactInquiry, submitContactInquiry);

// POST /api/contact/send-email (Generic Direct SMTP Dispatcher)
router.post('/send-email', sendDirectEmail);

// GET /api/contact/all (Protected - Admin Inquiries Tracker with RBAC check)
router.get('/all', verifyToken, verifyInquiryAccess, getAllInquiries);

// PATCH /api/contact/:id/read (Protected - Mark Inquiry as Read with RBAC check)
router.patch('/:id/read', verifyToken, verifyInquiryAccess, markInquiryAsRead);

// DELETE /api/contact/:id (Protected - Delete Inquiry with RBAC check)
router.delete('/:id', verifyToken, verifyInquiryAccess, deleteInquiry);

/* ==========================================================================
   CONTACT PAGE CMS EDITING ROUTES (Singleton & Infrastructure Tables)
   ========================================================================== */

// GET /api/contact/page-settings & /api/contact/settings (Public)
router.get('/page-settings', getContactPageSettings);
router.get('/settings', getContactPageSettings);

// PUT /api/contact/page-settings (Protected)
router.put('/page-settings', verifyToken, updateContactPageSettings);

export default router;
