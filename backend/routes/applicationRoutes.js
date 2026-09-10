import express from 'express';
import pool from '../config/db.js';
import upload from '../middleware/uploadMiddleware.js';
import { sendEmailNotification, sendWhatsAppNotification } from '../utils/notifications.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/applications (Public - Job Application Submission with Resume Upload)
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const job_role = req.body.job_role || req.body.jobRole || 'General Application';
    const full_name = req.body.full_name || req.body.fullName || req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const cover_letter = req.body.cover_letter || req.body.coverLetter || '';

    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Applicant Name, Email, and Phone Number are required.',
      });
    }

    const resume_url = req.file ? `/uploads/${req.file.filename}` : req.body.resumeUrl || '';

    // 1. Save Application to PostgreSQL
    try {
      await pool.query(
        `INSERT INTO job_applications (job_role, full_name, email, phone, resume_url, cover_letter)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [job_role, full_name, email, phone, resume_url, cover_letter]
      );
    } catch (dbErr) {
      console.warn('⚠️ Could not insert into PostgreSQL job_applications:', dbErr.message);
    }

    // 2. Attach PDF Resume directly to Email
    const attachments = [];
    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        path: req.file.path,
      });
    }

    // 3. Compose HTML Email Content
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0F172A; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 16px; background-color: #FFFFFF;">
        <div style="background: linear-gradient(135deg, #0F172A 0%, #78C257 100%); padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; text-align: center;">
          <h2 style="color: #FFFFFF; margin: 0; font-size: 22px; font-weight: bold;">💼 New Candidate Job Application</h2>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 12px; font-weight: bold; width: 140px; border-bottom: 1px solid #EDF2F7; color: #475569;">Applied Role:</td>
            <td style="padding: 12px; border-bottom: 1px solid #EDF2F7; font-weight: bold; color: #1A6BC4;">${job_role}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #EDF2F7; color: #475569;">Applicant Name:</td>
            <td style="padding: 12px; border-bottom: 1px solid #EDF2F7; font-weight: bold; color: #0F172A;">${full_name}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #EDF2F7; color: #475569;">Email Address:</td>
            <td style="padding: 12px; border-bottom: 1px solid #EDF2F7;"><a href="mailto:${email}" style="color: #44A0E3; text-decoration: none; font-weight: 500;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #EDF2F7; color: #475569;">Phone Number:</td>
            <td style="padding: 12px; border-bottom: 1px solid #EDF2F7;"><a href="tel:${phone}" style="color: #0F172A; text-decoration: none; font-weight: 500;">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #EDF2F7; color: #475569;">Attached Resume:</td>
            <td style="padding: 12px; border-bottom: 1px solid #EDF2F7; font-weight: 500; color: #15803D;">
              ${req.file ? `📎 ${req.file.originalname} (Attached to this email)` : resume_url || 'No file uploaded'}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; color: #475569;">Cover Letter:</td>
            <td style="padding: 12px; line-height: 1.6;">${cover_letter || 'None provided.'}</td>
          </tr>
        </table>

        <div style="text-align: center; border-t: 1px solid #E2E8F0; pt: 16px;">
          <p style="font-size: 12px; color: #94A3B8; margin: 0;">Kingsol Careers Portal Recruitment System</p>
        </div>
      </div>
    `;

    // 4. WhatsApp Text Alert
    const whatsAppMessage = `💼 New Job Application!\nRole: ${job_role}\nApplicant: ${full_name}\nPhone: ${phone}\nEmail: ${email}`;

    // 5. Send Direct Email Notification with Attached Resume to ADMIN_EMAIL
    const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.EMAIL_RECEIVER || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    try {
      await Promise.allSettled([
        sendEmailNotification({
          to: adminEmail,
          subject: `💼 New Job Application: ${job_role} - ${full_name}`,
          htmlContent,
          attachments,
        }),
        sendWhatsAppNotification(whatsAppMessage),
      ]);
    } catch (emailError) {
      console.error('⚠️ [Mailer] Failed to send job application alert:', emailError);
    }

    return res.status(200).json({
      success: true,
      message: 'Application submitted successfully! Email alert sent to admin with resume attached.',
      resumeUrl: resume_url,
    });
  } catch (error) {
    console.error('Error processing application submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error processing job application.',
    });
  }
});

// GET /api/applications/all or /api/applications (Protected - View candidate submissions)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM job_applications ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM job_applications ORDER BY created_at DESC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/applications/:id/read (Protected - Mark as read)
router.patch('/:id/read', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE job_applications SET is_read = true WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/applications/:id (Protected - Delete application)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM job_applications WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
