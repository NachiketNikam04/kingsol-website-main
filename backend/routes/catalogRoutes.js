import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/catalog/page-settings (Public - Products Page & Catalog Layout Settings)
router.get('/page-settings', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM products_page_settings WHERE id = 1`);
    const defaultSettings = {
      tagline: 'PORTFOLIO & PRODUCTS',
      headline: 'Authorized Tier-1 Solar Catalog.',
      highlight_word: 'Catalog.',
      subtitle: 'Explore authorized photovoltaic modules, string & hybrid inverters, and DC cabling systems engineered for commercial and industrial energy projects.',
      brands_tagline: 'AUTHORIZED MANUFACTURERS',
      brands_title: 'Partner Brands',
      products_tagline: 'COMPONENT SPECIFICATIONS',
      products_title: 'Featured Components',
      brand_story_tagline: 'BRAND BACKGROUND & ARCHITECTURE',
      brand_story_title: 'Engineering & Technology Story',
      features_title: 'Key Features & Standards',
      capabilities_title: 'Brand Highlights',
      capabilities_footer: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
      docs_tagline: 'TECHNICAL DOCUMENTATION',
      docs_title: 'Downloadable Specs & Certifications',
      docs_subtitle: 'Official Manufacturer Datasheets & Compliance PDFs',
      slider_tagline: 'COMPONENT CATALOG PORTFOLIO',
      alternate_layout: true,
    };

    res.status(200).json({
      success: true,
      data: result.rows[0] || defaultSettings,
    });
  } catch (error) {
    console.error('Error fetching Products page settings:', error);
    res.status(500).json({ success: false, message: 'Failed to load Products page settings.' });
  }
});

// PUT /api/catalog/page-settings (Protected - Update Products Page & Layout Settings)
router.put('/page-settings', verifyToken, async (req, res) => {
  const {
    tagline,
    headline,
    highlight_word,
    subtitle,
    brands_tagline,
    brands_title,
    products_tagline,
    products_title,
    brand_story_tagline,
    brand_story_title,
    features_title,
    capabilities_title,
    capabilities_footer,
    docs_tagline,
    docs_title,
    docs_subtitle,
    slider_tagline,
    alternate_layout,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO products_page_settings (
        id, tagline, headline, highlight_word, subtitle, brands_tagline, brands_title, products_tagline, products_title,
        brand_story_tagline, brand_story_title, features_title, capabilities_title, capabilities_footer,
        docs_tagline, docs_title, docs_subtitle, slider_tagline, alternate_layout, updated_at
       )
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           brands_tagline = EXCLUDED.brands_tagline,
           brands_title = EXCLUDED.brands_title,
           products_tagline = EXCLUDED.products_tagline,
           products_title = EXCLUDED.products_title,
           brand_story_tagline = EXCLUDED.brand_story_tagline,
           brand_story_title = EXCLUDED.brand_story_title,
           features_title = EXCLUDED.features_title,
           capabilities_title = EXCLUDED.capabilities_title,
           capabilities_footer = EXCLUDED.capabilities_footer,
           docs_tagline = EXCLUDED.docs_tagline,
           docs_title = EXCLUDED.docs_title,
           docs_subtitle = EXCLUDED.docs_subtitle,
           slider_tagline = EXCLUDED.slider_tagline,
           alternate_layout = EXCLUDED.alternate_layout,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'PORTFOLIO & PRODUCTS',
        headline || 'Authorized Tier-1 Solar Catalog.',
        highlight_word || 'Catalog.',
        subtitle || 'Explore authorized photovoltaic modules...',
        brands_tagline || 'AUTHORIZED MANUFACTURERS',
        brands_title || 'Partner Brands',
        products_tagline || 'COMPONENT SPECIFICATIONS',
        products_title || 'Featured Components',
        brand_story_tagline || 'BRAND BACKGROUND & ARCHITECTURE',
        brand_story_title || 'Engineering & Technology Story',
        features_title || 'Key Features & Standards',
        capabilities_title || 'Brand Highlights',
        capabilities_footer || 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
        docs_tagline || 'TECHNICAL DOCUMENTATION',
        docs_title || 'Downloadable Specs & Certifications',
        docs_subtitle || 'Official Manufacturer Datasheets & Compliance PDFs',
        slider_tagline || 'COMPONENT CATALOG PORTFOLIO',
        alternate_layout !== undefined ? alternate_layout : true,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Products page & catalog layout settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Products page settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Products page settings.' });
  }
});

// GET /api/catalog/nav-tree (Public - Dynamic Multi-Level Nav Hierarchy)
router.get('/nav-tree', async (req, res) => {
  try {
    const categoriesResult = await pool.query(`
      SELECT DISTINCT c.id, c.name, c.slug, c.tagline
      FROM categories c
      INNER JOIN products p ON p.category_id = c.id
      ORDER BY c.id ASC
    `);

    const categories = categoriesResult.rows;

    const navTree = await Promise.all(
      categories.map(async (cat) => {
        const brandsResult = await pool.query(
          `SELECT DISTINCT b.id, b.name, b.slug, b.image_url
           FROM brands b
           INNER JOIN products p ON p.brand_id = b.id
           WHERE b.category_id = $1
           ORDER BY b.name ASC`,
          [cat.id]
        );

        const brands = await Promise.all(
          brandsResult.rows.map(async (brand) => {
            const subcategoriesResult = await pool.query(
              `SELECT DISTINCT s.id, s.name, s.slug
               FROM subcategories s
               INNER JOIN products p ON p.subcategory_id = s.id
               WHERE s.brand_id = $1
               ORDER BY s.name ASC`,
              [brand.id]
            );

            return {
              id: brand.id,
              name: brand.name,
              slug: brand.slug,
              image_url: brand.image_url,
              subcategories: subcategoriesResult.rows,
            };
          })
        );

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          tagline: cat.tagline,
          brands,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: navTree,
    });
  } catch (error) {
    console.error('Error generating catalog nav-tree:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate dynamic navigation tree.',
    });
  }
});

export default router;
