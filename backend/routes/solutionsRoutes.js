import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   SOLUTIONS SECTION SETTINGS & CARDS ENDPOINTS
   ========================================================================== */

// GET /api/solutions (Public - Combined Settings & Solution Cards)
router.get('/', async (req, res) => {
  try {
    const settingsRes = await pool.query(`SELECT * FROM solutions_settings WHERE id = 1`);
    const cardsRes = await pool.query(`SELECT * FROM solutions_cards ORDER BY sort_order ASC, id ASC`);

    const defaultSettings = {
      tagline: 'OUR SOLUTIONS',
      headline: 'Powering the Future , one panel at a time.',
      highlight_word: 'Future',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsRes.rows[0] || defaultSettings,
        cards: cardsRes.rows,
      },
    });
  } catch (error) {
    console.error('Error fetching solutions section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load solutions section data.' });
  }
});

// PUT /api/solutions/settings (Protected - Update Header Settings)
router.put('/settings', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO solutions_settings (id, tagline, headline, highlight_word, updated_at)
       VALUES (1, $1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'OUR SOLUTIONS',
        headline || 'Powering the Future , one panel at a time.',
        highlight_word || 'Future',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Solutions section header settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating solutions settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update solutions settings.' });
  }
});

// GET /api/solutions/cards (Public - List Cards)
router.get('/cards', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM solutions_cards ORDER BY sort_order ASC, id ASC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/solutions/cards (Protected - Add New Solution Card)
router.post('/cards', verifyToken, async (req, res) => {
  const { tag, title, description, image_url, category_slug, sort_order } = req.body;

  if (!tag || !title || !image_url || !category_slug) {
    return res.status(400).json({ success: false, message: 'Tag, Title, Image URL, and Category Slug are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO solutions_cards (tag, title, description, image_url, category_slug, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tag, title, description || '', image_url, category_slug, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Solution card created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating solution card:', error);
    res.status(500).json({ success: false, message: 'Failed to create solution card.' });
  }
});

// PUT /api/solutions/cards/:id (Protected - Update Solution Card)
router.put('/cards/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { tag, title, description, image_url, category_slug, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE solutions_cards
       SET tag = $1, title = $2, description = $3, image_url = $4, category_slug = $5, sort_order = $6
       WHERE id = $7
       RETURNING *`,
      [tag, title, description || '', image_url, category_slug, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solution card not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Solution card updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating solution card:', error);
    res.status(500).json({ success: false, message: 'Failed to update solution card.' });
  }
});

// DELETE /api/solutions/cards/:id (Protected - Delete Solution Card)
router.delete('/cards/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM solutions_cards WHERE id = $1 RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solution card not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Solution card deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting solution card:', error);
    res.status(500).json({ success: false, message: 'Failed to delete solution card.' });
  }
});

export default router;
