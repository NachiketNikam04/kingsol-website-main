import pool from '../config/db.js';

// Auto-migrate certificates table if not already created
pool.query(`
  CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_certificates_sort ON certificates(sort_order ASC, id DESC);
`).catch((err) => console.warn('⚠️ [CertificateController] Schema auto-migration notice:', err.message));

/**
 * GET /api/certificates
 * Retrieve all certificates ordered by sort_order and ID
 */
export const getAllCertificates = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM certificates ORDER BY sort_order ASC, id DESC`);
    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates.',
    });
  }
};

/**
 * GET /api/certificates/:id
 * Retrieve a single certificate by ID
 */
export const getCertificateById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM certificates WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve certificate.' });
  }
};

/**
 * POST /api/certificates
 * Create a new certificate
 */
export const createCertificate = async (req, res) => {
  const { title, description, image_url, sort_order } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Certificate title is required.' });
  }
  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ success: false, message: 'Certificate image URL is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO certificates (title, description, image_url, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title.trim(), (description || '').trim(), image_url.trim(), Number(sort_order) || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Certificate created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to create certificate.' });
  }
};

/**
 * PUT /api/certificates/:id
 * Update an existing certificate
 */
export const updateCertificate = async (req, res) => {
  const { id } = req.params;
  const { title, description, image_url, sort_order } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Certificate title is required.' });
  }
  if (!image_url || !image_url.trim()) {
    return res.status(400).json({ success: false, message: 'Certificate image URL is required.' });
  }

  try {
    const result = await pool.query(
      `UPDATE certificates
       SET title = $1, description = $2, image_url = $3, sort_order = $4
       WHERE id = $5
       RETURNING *`,
      [title.trim(), (description || '').trim(), image_url.trim(), Number(sort_order) || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to update certificate.' });
  }
};

/**
 * DELETE /api/certificates/:id
 * Delete a certificate
 */
export const deleteCertificate = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM certificates WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }
    res.status(200).json({ success: true, message: 'Certificate deleted successfully.' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ success: false, message: 'Failed to delete certificate.' });
  }
};
