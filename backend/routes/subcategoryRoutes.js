import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/subcategories (Public - Filtered by brandId or categoryId)
router.get('/', async (req, res) => {
  const { brandId, categoryId } = req.query;

  try {
    let query = `SELECT s.*, b.name as brand_name, c.name as category_name
                 FROM subcategories s
                 LEFT JOIN brands b ON b.id = s.brand_id
                 LEFT JOIN categories c ON c.id = s.category_id`;
    const params = [];

    if (brandId && brandId !== 'undefined' && brandId !== 'null' && brandId !== '') {
      params.push(brandId);
      query += ` WHERE s.brand_id = $${params.length}`;
    } else if (categoryId && categoryId !== 'undefined' && categoryId !== 'null' && categoryId !== '') {
      params.push(categoryId);
      query += ` WHERE s.category_id = $${params.length}`;
    }

    query += ` ORDER BY s.name ASC`;

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(200).json({ success: true, data: [] });
  }
});

// POST /api/subcategories (Protected - Create Subcategory / Series on the fly)
router.post('/', verifyToken, async (req, res) => {
  const { category_id, brand_id, name, slug, description } = req.body;

  if (!category_id || !brand_id || !name) {
    return res.status(400).json({
      success: false,
      message: 'Category ID, Brand ID, and Subcategory Name are required fields.',
    });
  }

  const subSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `INSERT INTO subcategories (category_id, brand_id, name, slug, description)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (brand_id, slug) DO UPDATE
       SET name = EXCLUDED.name, description = EXCLUDED.description
       RETURNING *`,
      [category_id, brand_id, name, subSlug, description || '']
    );

    res.status(201).json({
      success: true,
      message: `Subcategory '${name}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/subcategories/:id (Protected - Update Subcategory / Series)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { category_id, brand_id, name, slug, description } = req.body;

  if (!category_id || !brand_id || !name) {
    return res.status(400).json({
      success: false,
      message: 'Category ID, Brand ID, and Subcategory Name are required fields.',
    });
  }

  const subSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const result = await pool.query(
      `UPDATE subcategories
       SET category_id = $1, brand_id = $2, name = $3, slug = $4, description = $5
       WHERE id = $6
       RETURNING *`,
      [category_id, brand_id, name, subSlug, description || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subcategory not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Subcategory '${name}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/subcategories/:id (Protected - Delete Subcategory)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM subcategories WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Subcategory not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Subcategory '${result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
