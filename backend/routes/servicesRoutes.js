import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   PUBLIC SERVICES & SERVICE DETAIL ROUTES
   ========================================================================== */

// GET /api/services/page (Public - Returns services page settings and active services list)
router.get('/page', async (req, res) => {
  try {
    const settingsRes = await pool.query(`SELECT * FROM services_page_settings WHERE id = 1`);
    const servicesRes = await pool.query(`SELECT * FROM services ORDER BY sort_order ASC, id ASC`);

    const defaultSettings = {
      tagline: 'EXPERT SERVICES',
      headline: '10+ years of Excellence in the solar industry.',
      highlight_word: 'Excellence',
      emergency_tagline: 'Emergency Support',
      emergency_title: 'Technical Dispatch Unit',
      emergency_phone: '+91 1234567890',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsRes.rows[0] || defaultSettings,
        services: servicesRes.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching Services page data:', error);
    res.status(500).json({ success: false, message: 'Failed to load Services page data.' });
  }
});

// GET /api/services/:slug (Public - Returns active service detail, all services list, and emergency settings)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const activeRes = await pool.query(`SELECT * FROM services WHERE slug = $1`, [slug]);
    const allRes = await pool.query(`SELECT id, title, slug FROM services ORDER BY sort_order ASC, id ASC`);
    const settingsRes = await pool.query(`SELECT * FROM services_page_settings WHERE id = 1`);

    if (activeRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    const defaultSettings = {
      emergency_tagline: 'Emergency Support',
      emergency_title: 'Technical Dispatch Unit',
      emergency_phone: '+91 1234567890',
    };

    res.status(200).json({
      success: true,
      data: {
        activeService: activeRes.rows[0],
        allServices: allRes.rows || [],
        settings: settingsRes.rows[0] || defaultSettings,
      },
    });
  } catch (error) {
    console.error('Error fetching Service detail:', error);
    res.status(500).json({ success: false, message: 'Failed to load Service detail.' });
  }
});

/* ==========================================================================
   PROTECTED ADMIN SERVICES & SETTINGS ROUTES
   ========================================================================== */

// PUT /api/services/settings (Protected - Update Singleton Services Page Settings)
router.put('/settings', verifyToken, async (req, res) => {
  const {
    tagline,
    headline,
    highlight_word,
    emergency_tagline,
    emergency_title,
    emergency_phone,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO services_page_settings (id, tagline, headline, highlight_word, emergency_tagline, emergency_title, emergency_phone, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           emergency_tagline = EXCLUDED.emergency_tagline,
           emergency_title = EXCLUDED.emergency_title,
           emergency_phone = EXCLUDED.emergency_phone,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'EXPERT SERVICES',
        headline || '10+ years of Excellence in the solar industry.',
        highlight_word || 'Excellence',
        emergency_tagline || 'Emergency Support',
        emergency_title || 'Technical Dispatch Unit',
        emergency_phone || '+91 1234567890',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Services page settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Services page settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Services page settings.' });
  }
});

// POST /api/services (Protected - Create New Service Item)
router.post('/', verifyToken, async (req, res) => {
  const {
    title,
    slug,
    short_desc,
    grid_img_url,
    hero_img_url,
    detail_title,
    paragraph1,
    paragraph2,
    checklist,
    gallery_img_url,
    sort_order,
  } = req.body;

  if (!title || !slug) {
    return res.status(400).json({ success: false, message: 'Title and Slug are required.' });
  }

  try {
    // Slug Uniqueness check
    const existing = await pool.query(`SELECT id FROM services WHERE slug = $1`, [slug]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A service with this slug already exists.' });
    }

    const result = await pool.query(
      `INSERT INTO services (title, slug, short_desc, grid_img_url, hero_img_url, detail_title, paragraph1, paragraph2, checklist, gallery_img_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        slug,
        short_desc || '',
        grid_img_url || '',
        hero_img_url || '',
        detail_title || title,
        paragraph1 || '',
        paragraph2 || '',
        checklist || [],
        gallery_img_url || '',
        sort_order || 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, message: 'Failed to create service.' });
  }
});

// PUT /api/services/:id (Protected - Update Existing Service Item)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    short_desc,
    grid_img_url,
    hero_img_url,
    detail_title,
    paragraph1,
    paragraph2,
    checklist,
    gallery_img_url,
    sort_order,
  } = req.body;

  try {
    // Slug Uniqueness check for other records
    const existing = await pool.query(`SELECT id FROM services WHERE slug = $1 AND id != $2`, [slug, id]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A service with this slug already exists.' });
    }

    const result = await pool.query(
      `UPDATE services
       SET title = $1,
           slug = $2,
           short_desc = $3,
           grid_img_url = $4,
           hero_img_url = $5,
           detail_title = $6,
           paragraph1 = $7,
           paragraph2 = $8,
           checklist = $9,
           gallery_img_url = $10,
           sort_order = $11
       WHERE id = $12
       RETURNING *`,
      [
        title,
        slug,
        short_desc || '',
        grid_img_url || '',
        hero_img_url || '',
        detail_title || title,
        paragraph1 || '',
        paragraph2 || '',
        checklist || [],
        gallery_img_url || '',
        sort_order || 0,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, message: 'Failed to update service.' });
  }
});

// DELETE /api/services/:id (Protected - Delete Service Item)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM services WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, message: 'Failed to delete service.' });
  }
});

export default router;
