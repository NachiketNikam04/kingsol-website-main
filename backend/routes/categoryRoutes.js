import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/categories (Public - Returns all categories with brand & product counts)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.tagline,
        c.created_at,
        COUNT(DISTINCT b.id)::int as brand_count,
        COUNT(DISTINCT p.id)::int as product_count
      FROM categories c
      LEFT JOIN brands b ON b.category_id = c.id
      LEFT JOIN products p ON p.brand_id = b.id
      GROUP BY c.id
      ORDER BY c.id ASC
    `);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories.',
    });
  }
});

// GET /api/categories/:slug (Public - Single category details)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT c.*,
              COUNT(DISTINCT b.id)::int as brand_count,
              COUNT(DISTINCT p.id)::int as product_count
       FROM categories c
       LEFT JOIN brands b ON b.category_id = c.id
       LEFT JOIN products p ON p.brand_id = b.id
       WHERE LOWER(c.slug) = LOWER($1) 
          OR c.slug = LOWER(REPLACE($1, ' ', '-'))
          OR LOWER(c.name) = LOWER(REPLACE($1, '-', ' '))
          OR c.id::text = $1
       GROUP BY c.id`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories (Protected - Create Category)
router.post('/', verifyToken, async (req, res) => {
  const { name, slug, description, tagline } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, tagline)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, categorySlug, description || '', tagline || '']
    );

    res.status(201).json({
      success: true,
      message: `Category '${name}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: error.code === '23505' ? 'A category with this slug already exists.' : error.message,
    });
  }
});

// PUT /api/categories/:id (Protected - Update Category)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, tagline } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `UPDATE categories
       SET name = $1, slug = $2, description = $3, tagline = $4
       WHERE id = $5
       RETURNING *`,
      [name, categorySlug, description || '', tagline || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Category '${name}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id (Protected - Delete Category)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM categories WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Category '${result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
