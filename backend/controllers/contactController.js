import pool from '../config/db.js';
import { sendInquiryEmailAlert } from '../utils/mailer.js';
import { sendEmailNotification } from '../utils/notifications.js';

/**
 * Handle Public Contact Form / Quote Submission & Send SMTP Email Alert
 * POST /api/contact
 */
export const submitContactInquiry = async (req, res) => {
  const {
    name,
    fullName,
    phone,
    email,
    message,
    inquiry_type,
    type,
    productName,
    product,
    brandName,
  } = req.body;

  const customerName = (name || fullName || '').trim();
  const customerEmail = (email || '').trim();

  if (!customerName || !customerEmail) {
    return res.status(400).json({ success: false, message: 'Name and Email are required fields.' });
  }

  const resolvedProduct = (productName || product || '').trim();
  const resolvedType =
    type ||
    inquiry_type ||
    (resolvedProduct ? 'Product Quick Quote' : 'General Contact Form');

  try {
    const fullMessage = resolvedProduct
      ? `[PRODUCT QUOTE] ${resolvedProduct}${brandName ? ` (${brandName})` : ''}\n${message || ''}`
      : (message || '');

    // 1. Save submission to PostgreSQL
    let savedInquiry = null;
    try {
      const result = await pool.query(
        `INSERT INTO contact_inquiries (name, phone, email, message, inquiry_type, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, FALSE, NOW())
         RETURNING *`,
        [customerName, phone || '', customerEmail, fullMessage, resolvedType]
      );
      savedInquiry = result.rows[0];
    } catch (dbErr) {
      console.warn('⚠️ [ContactController] PostgreSQL insert warning:', dbErr.message);
    }

    // 2. Trigger automated SMTP Email Alert to Admin (Protected in try/catch)
    const emailPayload = {
      type: resolvedType,
      name: customerName,
      email: customerEmail,
      phone: phone || 'N/A',
      product: resolvedProduct || 'N/A',
      productName: resolvedProduct || 'N/A',
      brandName: brandName || '',
      message: message || fullMessage || '',
    };

    try {
      await sendInquiryEmailAlert(emailPayload);
    } catch (emailError) {
      console.error(`⚠️ [Mailer] Failed to send alert for ${emailPayload.type}:`, emailError);
    }

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully and email alert dispatched.',
      data: savedInquiry || { name: customerName, email: customerEmail, phone, message: fullMessage },
    });
  } catch (error) {
    console.error('❌ [ContactController] Error submitting contact form:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit contact form.' });
  }
};

/**
 * Send Direct Custom Email (Generic SMTP Dispatcher)
 * POST /api/contact/send-email
 */
export const sendDirectEmail = async (req, res) => {
  const { to, subject, message, htmlContent } = req.body;

  if (!subject || (!message && !htmlContent)) {
    return res.status(400).json({
      success: false,
      message: 'Subject and Message / htmlContent are required.',
    });
  }

  try {
    const result = await sendEmailNotification({
      to,
      subject,
      htmlContent: htmlContent || `<p>${message}</p>`,
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: 'Email dispatched successfully.',
        messageId: result.messageId,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: result.reason || result.error || 'Failed to dispatch email.',
      });
    }
  } catch (err) {
    console.error('❌ [ContactController] Direct email dispatch error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Fetch All Inquiries (Protected - Admin Tracker)
 * GET /api/contact/all
 */
export const getAllInquiries = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM contact_inquiries ORDER BY created_at DESC`);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ [ContactController] Error fetching inquiries:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch contact inquiries.' });
  }
};

/**
 * Mark Inquiry As Read (Protected - Admin Action)
 * PATCH /api/contact/:id/read
 */
export const markInquiryAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE contact_inquiries SET is_read = TRUE WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry marked as read.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ [ContactController] Error marking inquiry as read:', error);
    return res.status(500).json({ success: false, message: 'Failed to update inquiry status.' });
  }
};

/**
 * Delete Inquiry (Protected - Admin Action)
 * DELETE /api/contact/:id
 */
export const deleteInquiry = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM contact_inquiries WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry deleted successfully.',
    });
  } catch (error) {
    console.error('❌ [ContactController] Error deleting inquiry:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
};

/**
 * Get Contact Page CMS Settings (Public)
 * GET /api/contact/page-settings or /api/contact/settings
 */
export const getContactPageSettings = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM contact_page_settings WHERE id = 1`);
    const settings = result.rows[0] || {
      hero_tagline: 'GET IN TOUCH',
      hero_headline: 'Connect with Kingsol.',
      hero_highlight: 'Kingsol.',
      form_headline: 'Send us a message',
      form_subtitle: 'Fill out the form below and our team will get back to you shortly.',
    };
    return res.status(200).json({ success: true, data: settings, settings });
  } catch (error) {
    console.error('❌ [ContactController] Error getting contact page settings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Contact Page CMS Settings (Protected)
 * PUT /api/contact/page-settings
 */
export const updateContactPageSettings = async (req, res) => {
  const {
    hero_tagline,
    hero_headline,
    hero_highlight,
    form_headline,
    form_subtitle,
    form_success_msg,
    hq_tagline,
    hq_headline,
    hq_highlight,
    hq_address,
    hq_map_url,
    hq_hours,
    hq_certification,
    infra_tagline,
    infra_headline,
    infra_highlight,
    faq_tagline,
    faq_headline,
    quote_text,
    quote_author,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE contact_page_settings 
       SET hero_tagline = $1, hero_headline = $2, hero_highlight = $3,
           form_headline = $4, form_subtitle = $5, form_success_msg = $6,
           hq_tagline = $7, hq_headline = $8, hq_highlight = $9, hq_address = $10,
           hq_map_url = $11, hq_hours = $12, hq_certification = $13,
           infra_tagline = $14, infra_headline = $15, infra_highlight = $16,
           faq_tagline = $17, faq_headline = $18, quote_text = $19, quote_author = $20,
           updated_at = NOW()
       WHERE id = 1 RETURNING *`,
      [
        hero_tagline,
        hero_headline,
        hero_highlight,
        form_headline,
        form_subtitle,
        form_success_msg,
        hq_tagline,
        hq_headline,
        hq_highlight,
        hq_address,
        hq_map_url,
        hq_hours,
        hq_certification,
        infra_tagline,
        infra_headline,
        infra_highlight,
        faq_tagline,
        faq_headline,
        quote_text,
        quote_author,
      ]
    );
    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('❌ [ContactController] Error updating contact page settings:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  submitContactInquiry,
  sendDirectEmail,
  getAllInquiries,
  markInquiryAsRead,
  deleteInquiry,
  getContactPageSettings,
  updateContactPageSettings,
};
