import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to extract YouTube video ID and construct default thumbnail URL
const getYouTubeThumbnail = (url, customThumbnail) => {
  if (customThumbnail && customThumbnail.trim()) return customThumbnail;
  if (!url) return '';

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    const videoId = match[2];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
};

// GET /api/media/public (Public - Active Media/Videos)
router.get('/public', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM media_items WHERE is_active = TRUE ORDER BY sort_order ASC, id DESC`
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching public media items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve media items.' });
  }
});

// GET /api/media (Public - Fallback Endpoint)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM media_items WHERE is_active = TRUE ORDER BY sort_order ASC, id DESC`
    );
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching media items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve media items.' });
  }
});

// GET /api/media/all (Protected - Admin Panel List)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM media_items ORDER BY sort_order ASC, id DESC`);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching admin media items:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve media items.' });
  }
});

// POST /api/media (Protected - Create Media Item)
router.post('/', verifyToken, async (req, res) => {
  const { title, youtube_url, thumbnail_url, description, is_active, sort_order } = req.body;

  if (!title || !youtube_url) {
    return res.status(400).json({ success: false, message: 'Title and YouTube URL are required.' });
  }

  const computedThumbnail = getYouTubeThumbnail(youtube_url, thumbnail_url);

  try {
    const result = await pool.query(
      `INSERT INTO media_items (title, youtube_url, thumbnail_url, description, is_active, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, youtube_url, computedThumbnail, description || '', is_active ?? true, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Media item created successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating media item:', error);
    res.status(500).json({ success: false, message: 'Failed to create media item.' });
  }
});

// PUT /api/media/:id (Protected - Update Media Item)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, youtube_url, thumbnail_url, description, is_active, sort_order } = req.body;

  const computedThumbnail = getYouTubeThumbnail(youtube_url, thumbnail_url);

  try {
    const result = await pool.query(
      `UPDATE media_items
       SET title = $1, youtube_url = $2, thumbnail_url = $3, description = $4, is_active = $5, sort_order = $6
       WHERE id = $7
       RETURNING *`,
      [title, youtube_url, computedThumbnail, description || '', is_active ?? true, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Media item updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating media item:', error);
    res.status(500).json({ success: false, message: 'Failed to update media item.' });
  }
});

// DELETE /api/media/:id (Protected - Delete Media Item)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM media_items WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Media item not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Media item '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting media item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete media item.' });
  }
});

export default router;
