import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   PUBLIC & ADMIN FOOTER & SOCIAL LINKS ENDPOINTS
   ========================================================================== */

// GET /api/footer (Public - Combined Footer Settings & Social Links)
router.get('/', async (req, res) => {
  try {
    const settingsRes = await pool.query(`SELECT * FROM footer_settings WHERE id = 1`);
    const socialRes = await pool.query(`SELECT * FROM social_links ORDER BY sort_order ASC, id ASC`);

    const defaultSettings = {
      description: 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
      hq_label: 'Global HQ',
      address: 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.',
      phone: '+1 (800) 555-SOLAR',
      email: 'b2b@kingsol-energy.com',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsRes.rows[0] || defaultSettings,
        socialLinks: socialRes.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching footer data:', error);
    res.status(500).json({ success: false, message: 'Failed to load footer configuration.' });
  }
});

// PUT /api/footer/settings (Protected - Update Footer Contact Details)
router.put('/settings', verifyToken, async (req, res) => {
  const { description, hq_label, address, phone, email } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO footer_settings (id, description, hq_label, address, phone, email, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE
       SET description = EXCLUDED.description,
           hq_label = EXCLUDED.hq_label,
           address = EXCLUDED.address,
           phone = EXCLUDED.phone,
           email = EXCLUDED.email,
           updated_at = NOW()
       RETURNING *`,
      [
        description || 'High-efficiency solar components...',
        hq_label || 'Global HQ',
        address || 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.',
        phone || '+1 (800) 555-SOLAR',
        email || 'b2b@kingsol-energy.com',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Footer contact details updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update footer settings.' });
  }
});

// GET /api/footer/social (Public - Get Social Links)
router.get('/social', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM social_links ORDER BY sort_order ASC, id ASC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/footer/social (Protected - Add New Social Link)
router.post('/social', verifyToken, async (req, res) => {
  const { platform_name, url, icon_name, sort_order } = req.body;

  if (!platform_name || !url) {
    return res.status(400).json({ success: false, message: 'Platform name and URL are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO social_links (platform_name, url, icon_name, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [platform_name, url, icon_name || 'Globe', sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Social link created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating social link:', error);
    res.status(500).json({ success: false, message: 'Failed to create social link.' });
  }
});

// PUT /api/footer/social/:id (Protected - Update Social Link)
router.put('/social/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { platform_name, url, icon_name, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE social_links
       SET platform_name = $1, url = $2, icon_name = $3, sort_order = $4
       WHERE id = $5
       RETURNING *`,
      [platform_name, url, icon_name || 'Globe', sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Social link not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Social link updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating social link:', error);
    res.status(500).json({ success: false, message: 'Failed to update social link.' });
  }
});

// DELETE /api/footer/social/:id (Protected - Delete Social Link)
router.delete('/social/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM social_links WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Social link not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Social link deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting social link:', error);
    res.status(500).json({ success: false, message: 'Failed to delete social link.' });
  }
});

export default router;
