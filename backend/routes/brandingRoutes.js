import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   GLOBAL BRANDING CONFIGURATION ROUTES (LOGOS ONLY)
   ========================================================================== */

// GET /api/branding (Public - Returns logo settings)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, logo_url, footer_logo_url, updated_at FROM global_branding_settings WHERE id = 1`);
    const defaultBranding = {
      logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
      footer_logo_url: '',
    };

    res.status(200).json({
      success: true,
      data: result.rows[0] || defaultBranding,
    });
  } catch (error) {
    console.error('Error fetching global branding settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch global branding.' });
  }
});

// PUT /api/branding (Protected - Update Navbar and Footer Logo Settings)
router.put('/', verifyToken, async (req, res) => {
  const { logo_url, footer_logo_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO global_branding_settings (id, logo_url, footer_logo_url, updated_at)
       VALUES (1, $1, $2, NOW())
       ON CONFLICT (id) DO UPDATE
       SET logo_url = EXCLUDED.logo_url,
           footer_logo_url = EXCLUDED.footer_logo_url,
           updated_at = NOW()
       RETURNING id, logo_url, footer_logo_url, updated_at`,
      [logo_url || '', footer_logo_url || '']
    );

    res.status(200).json({
      success: true,
      message: 'Global logo settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating global branding settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update global branding settings.' });
  }
});

export default router;
