import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   BLOGS PAGE HEADER CONFIGURATION ROUTES
   ========================================================================== */

// GET /api/blogs/page (Public - Returns blogs_page_settings and published blogs)
router.get('/page', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM blogs_page_settings WHERE id = 1`);
    const blogsResult = await pool.query(`SELECT * FROM blogs WHERE is_published = TRUE ORDER BY published_at DESC, id DESC`);

    const defaultSettings = {
      tagline: 'KINGSOL JOURNAL & INSIGHTS',
      headline: 'News & Insights on clean energy.',
      highlight_word: 'Insights',
      subtitle: 'Stay updated with the latest in solar PV technology, grid-tie inverter innovations, and renewable energy policies across India.',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultSettings,
        blogs: blogsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching Blogs page data:', error);
    res.status(500).json({ success: false, message: 'Failed to load Blogs page settings and articles.' });
  }
});

// PUT /api/blogs/page (Protected - Update Singleton Blogs Page Settings)
router.put('/page', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, subtitle } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO blogs_page_settings (id, tagline, headline, highlight_word, subtitle, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'KINGSOL JOURNAL & INSIGHTS',
        headline || 'News & Insights on clean energy.',
        highlight_word || 'Insights',
        subtitle || 'Stay updated with the latest in solar PV technology...',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Blogs page header settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Blogs page settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Blogs page header settings.' });
  }
});

/* ==========================================================================
   BLOG ARTICLES CRUD ROUTES
   ========================================================================== */

// GET /api/blogs (Public - Accepts optional ?limit=N)
router.get('/', async (req, res) => {
  const { limit } = req.query;

  try {
    let query = `SELECT * FROM blogs WHERE is_published = TRUE ORDER BY published_at DESC, id DESC`;
    const params = [];

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $1`;
    }

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch blog posts.' });
  }
});

// GET /api/blogs/all (Protected - Fetch all including unpublished for admin)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM blogs ORDER BY id DESC`);
    res.status(200).json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Error fetching all blogs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin blog list.' });
  }
});

// GET /api/blogs/:slug (Public - Single Blog Article)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM blogs WHERE slug = $1`, [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching blog article:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch article details.' });
  }
});

// POST /api/blogs (Protected - Create Blog Article)
router.post('/', verifyToken, async (req, res) => {
  const { title, slug, author, image_url, excerpt, content, is_published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and Content are required fields.' });
  }

  const blogSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO blogs (title, slug, author, image_url, excerpt, content, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        blogSlug,
        author || 'Kingsol Team',
        image_url || '',
        excerpt || '',
        content,
        is_published ?? true,
      ]
    );

    res.status(201).json({
      success: true,
      message: `Blog '${title}' published successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: error.code === '23505' ? 'A blog with this slug already exists.' : error.message,
    });
  }
});

// PUT /api/blogs/:id (Protected - Update Blog Article)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, slug, author, image_url, excerpt, content, is_published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and Content are required fields.' });
  }

  const blogSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `UPDATE blogs
       SET title = $1, slug = $2, author = $3, image_url = $4, excerpt = $5, content = $6, is_published = $7
       WHERE id = $8
       RETURNING *`,
      [
        title,
        blogSlug,
        author || 'Kingsol Team',
        image_url || '',
        excerpt || '',
        content,
        is_published ?? true,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Blog '${title}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/blogs/:id (Protected - Delete Blog Article)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM blogs WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog article not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Blog '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;