import pool from '../config/db.js';
import { sendInquiryEmailAlert } from '../utils/mailer.js';

// Auto-migrate quotes table if not already created
pool.query(`
  CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    state VARCHAR(100),
    product_interest VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'New',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
`).catch((err) => console.warn('⚠️ [QuoteController] Schema auto-migration notice:', err.message));

/**
 * Handle Public Get Quote Request Submission & Send Email Alert
 * POST /api/quotes
 */
export const createQuote = async (req, res) => {
  const {
    name,
    fullName,
    phone,
    email,
    company_name,
    company,
    state,
    product_interest,
    product,
    productName,
    message,
  } = req.body;

  const customerName = (name || fullName || '').trim();
  const customerEmail = (email || '').trim();
  const customerPhone = (phone || '').trim();
  const customerCompany = (company_name || company || '').trim();
  const customerState = (state || '').trim();
  const customerProduct = (product_interest || productName || product || '').trim();
  const customerMessage = (message || '').trim();

  if (!customerName || !customerPhone || !customerEmail) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone number, and email address are required fields.',
    });
  }

  try {
    // 1. Insert into PostgreSQL quotes table
    let savedQuote = null;
    try {
      const result = await pool.query(
        `INSERT INTO quotes (name, phone, email, company_name, state, product_interest, message, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'New', NOW())
         RETURNING *`,
        [
          customerName,
          customerPhone,
          customerEmail,
          customerCompany,
          customerState,
          customerProduct,
          customerMessage,
        ]
      );
      savedQuote = result.rows[0];
    } catch (dbErr) {
      console.warn('⚠️ [QuoteController] PostgreSQL insert notice:', dbErr.message);
    }

    // 2. Dispatch SMTP Email Alert to Admin
    const emailPayload = {
      type: 'Get Quote Request',
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      company_name: customerCompany,
      state: customerState,
      product_interest: customerProduct,
      message: customerMessage,
    };

    try {
      await sendInquiryEmailAlert(emailPayload);
    } catch (emailErr) {
      console.error('⚠️ [QuoteController] Email alert failed:', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully. Our team will contact you shortly.',
      data: savedQuote || {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        company_name: customerCompany,
        state: customerState,
        product_interest: customerProduct,
        message: customerMessage,
      },
    });
  } catch (error) {
    console.error('❌ [QuoteController] Error submitting quote request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit quote request.',
    });
  }
};

/**
 * Get All Quotes (Protected Admin Route)
 * GET /api/quotes
 */
export const getAllQuotes = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `SELECT * FROM quotes`;
    const params = [];
    const conditions = [];

    if (status && status !== 'All') {
      params.push(status);
      conditions.push(`status = $` + params.length);
    }

    if (search && search.trim()) {
      params.push(`%` + search.trim() + `%`);
      const pIdx = params.length;
      conditions.push(
        `(name ILIKE $` + pIdx + ` OR email ILIKE $` + pIdx + ` OR phone ILIKE $` + pIdx + ` OR company_name ILIKE $` + pIdx + ` OR state ILIKE $` + pIdx + ` OR product_interest ILIKE $` + pIdx + ` OR message ILIKE $` + pIdx + `)`
      );
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC, id DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('❌ [QuoteController] Error fetching quotes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quote requests.',
    });
  }
};

/**
 * Update Quote Status (Protected Admin Route)
 * PATCH /api/quotes/:id/status
 */
export const updateQuoteStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE quotes SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quote not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Quote status updated to '` + status + `'.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ [QuoteController] Error updating quote status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update quote status.',
    });
  }
};

/**
 * Delete Quote (Protected Admin Route)
 * DELETE /api/quotes/:id
 */
export const deleteQuote = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM quotes WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quote not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Quote deleted successfully.',
    });
  } catch (error) {
    console.error('❌ [QuoteController] Error deleting quote:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete quote request.',
    });
  }
};
