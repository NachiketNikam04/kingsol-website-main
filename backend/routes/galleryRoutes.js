import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/gallery/public (Public - Active Gallery Items)
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM gallery_items WHERE is_active = TRUE ORDER BY sort_order ASC, id DESC`
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching public gallery items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve gallery items.' });
  }
});

// GET /api/gallery (Public - Fallback Endpoint)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM gallery_items WHERE is_active = TRUE ORDER BY sort_order ASC, id DESC`
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve gallery items.' });
  }
});

// GET /api/gallery/all (Protected - Admin Panel List)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM gallery_items ORDER BY sort_order ASC, id DESC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching admin gallery items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve gallery items.' });
  }
});

// POST /api/gallery (Protected - Create Gallery Item)
router.post('/', verifyToken, async (req, res) => {
  const { title, image_url, category, is_active, sort_order } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ success: false, message: 'Title and image URL are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO gallery_items (title, image_url, category, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, image_url, category || 'Projects', is_active ?? true, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    res.status(500).json({ success: false, message: 'Failed to create gallery item.' });
  }
});

// PUT /api/gallery/:id (Protected - Update Gallery Item)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, image_url, category, is_active, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE gallery_items
       SET title = $1, image_url = $2, category = $3, is_active = $4, sort_order = $5
       WHERE id = $6
       RETURNING *`,
      [title, image_url, category || 'Projects', is_active ?? true, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating gallery item:', error);
    res.status(500).json({ success: false, message: 'Failed to update gallery item.' });
  }
});

// DELETE /api/gallery/:id (Protected - Delete Gallery Item)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM gallery_items WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Gallery item '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete gallery item.' });
  }
});

export default router;
