import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auto-migrate card_image column on brands table if not present
pool.query(`
  ALTER TABLE brands ADD COLUMN IF NOT EXISTS card_image TEXT DEFAULT '';
`).catch((err) => console.warn('Brand schema auto-migration notice:', err.message));

function parseArrayOrString(val, fallback = []) {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return fallback;
}

function parseJsonOrString(val, fallback = []) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

// GET /api/brands (Public - Filterable by category_id or category_slug)
router.get('/', async (req, res) => {
  try {
    const { category_id, category_slug } = req.query;
    let query = `
      SELECT b.*, c.name as category_name, c.slug as category_slug 
      FROM brands b 
      JOIN categories c ON b.category_id = c.id
    `;
    const params = [];

    if (category_id) {
      query += ` WHERE b.category_id = $1`;
      params.push(category_id);
    } else if (category_slug) {
      query += ` WHERE c.slug = $1`;
      params.push(category_slug);
    }

    query += ` ORDER BY b.id ASC`;

    const result = await pool.query(query, params);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/brands/:slug (Public - Single Brand Details + Products)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const brandResult = await pool.query(
      `SELECT b.*, c.name as category_name, c.slug as category_slug
       FROM brands b
       JOIN categories c ON b.category_id = c.id
       WHERE LOWER(b.slug) = LOWER($1) 
          OR b.slug = LOWER(REPLACE($1, ' ', '-'))
          OR LOWER(b.name) = LOWER(REPLACE($1, '-', ' '))
          OR b.id::text = $1`,
      [slug]
    );

    if (brandResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    const brand = brandResult.rows[0];

    // Fetch Products belonging to this Brand
    const productsResult = await pool.query(
      `SELECT p.*, b.name as brand_name, b.slug as brand_slug, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN brands b ON b.id = p.brand_id
       JOIN categories c ON c.id = b.category_id
       WHERE p.brand_id = $1
       ORDER BY p.id DESC`,
      [brand.id]
    );

    res.status(200).json({
      success: true,
      data: {
        brand,
        products: productsResult.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/brands (Protected - Create Brand with Rich Data)
router.post('/', verifyToken, async (req, res) => {
  const {
    category_id,
    name,
    slug,
    description,
    image_url,
    card_image,
    certifications,
    gallery,
    long_description,
    key_features,
    highlights,
    documents,
    specs_image_url,
    specifications_list,
    product_range_description,
    product_range_features,
    specs_description,
    certifications_list,
    product_range_subtitle,
    company_profile_text,
    company_profile_image_url,
    categorized_features,
    badges,
    capabilities_tagline,
    capabilities_heading,
    brand_highlights,
    footer_note,
  } = req.body;

  try {
    let finalCardImage = card_image || '';
    if (req.files && req.files['card_image'] && req.files['card_image'][0]) {
      finalCardImage = `/uploads/${req.files['card_image'][0].filename}`;
    }

    const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const certsArray = parseJsonOrString(certifications, []);
    const galleryArray = parseArrayOrString(gallery, []);
    const keyFeaturesArray = parseArrayOrString(key_features, []);
    const highlightsArray = parseArrayOrString(highlights, []);
    const documentsArray = parseJsonOrString(documents, []);
    const specsListArray = parseArrayOrString(specifications_list, []);
    const productRangeFeaturesArray = parseArrayOrString(product_range_features, []);
    const certsListArray = parseArrayOrString(certifications_list, []);
    const categorizedFeaturesArray = parseJsonOrString(categorized_features, []);
    const badgesArray = parseArrayOrString(badges, []);
    let brandHighlightsPayload = brand_highlights;
    if (typeof brand_highlights === 'string') {
      try {
        brandHighlightsPayload = JSON.parse(brand_highlights);
      } catch {
        brandHighlightsPayload = null;
      }
    }

    let cardsList = [];
    let finalTagline = capabilities_tagline || 'CORPORATE CAPABILITIES';
    let finalHeading = capabilities_heading || 'Brand Highlights';

    if (Array.isArray(brandHighlightsPayload)) {
      cardsList = brandHighlightsPayload;
    } else if (brandHighlightsPayload && typeof brandHighlightsPayload === 'object') {
      if (brandHighlightsPayload.tagline) finalTagline = brandHighlightsPayload.tagline;
      if (brandHighlightsPayload.heading) finalHeading = brandHighlightsPayload.heading;
      if (Array.isArray(brandHighlightsPayload.cards)) {
        cardsList = brandHighlightsPayload.cards;
      }
    }

    if (capabilities_tagline) finalTagline = capabilities_tagline;
    if (capabilities_heading) finalHeading = capabilities_heading;

    const finalBrandHighlightsObject = {
      tagline: finalTagline,
      heading: finalHeading,
      cards: cardsList,
    };

    const result = await pool.query(
      `INSERT INTO brands 
       (category_id, name, slug, description, image_url, card_image, certifications, gallery, long_description, key_features, highlights, documents, specs_image_url, specifications_list, product_range_description, product_range_features, specs_description, certifications_list, product_range_subtitle, company_profile_text, company_profile_image_url, categorized_features, badges, capabilities_tagline, capabilities_heading, brand_highlights, footer_note)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27) 
       RETURNING *`,
      [
        category_id,
        name,
        brandSlug,
        description || '',
        image_url || '',
        finalCardImage,
        JSON.stringify(certsArray),
        galleryArray,
        long_description || description || '',
        keyFeaturesArray,
        highlightsArray,
        JSON.stringify(documentsArray),
        specs_image_url || '',
        specsListArray,
        product_range_description || '',
        productRangeFeaturesArray,
        specs_description || '',
        certsListArray,
        product_range_subtitle || '',
        company_profile_text || '',
        company_profile_image_url || '',
        JSON.stringify(categorizedFeaturesArray),
        badgesArray,
        finalTagline,
        finalHeading,
        JSON.stringify(finalBrandHighlightsObject),
        footer_note || '',
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating brand:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/brands/:id (Protected - Update Brand with Rich Data)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    category_id,
    name,
    slug,
    description,
    image_url,
    card_image,
    certifications,
    gallery,
    long_description,
    key_features,
    highlights,
    documents,
    specs_image_url,
    specifications_list,
    product_range_description,
    product_range_features,
    specs_description,
    certifications_list,
    product_range_subtitle,
    company_profile_text,
    company_profile_image_url,
    categorized_features,
    badges,
    capabilities_tagline,
    capabilities_heading,
    brand_highlights,
    footer_note,
  } = req.body;

  try {
    let finalCardImage = card_image !== undefined ? card_image : '';
    if (req.files && req.files['card_image'] && req.files['card_image'][0]) {
      finalCardImage = `/uploads/${req.files['card_image'][0].filename}`;
    }

    const brandSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const certsArray = parseJsonOrString(certifications, []);
    const galleryArray = parseArrayOrString(gallery, []);
    const keyFeaturesArray = parseArrayOrString(key_features, []);
    const highlightsArray = parseArrayOrString(highlights, []);
    const documentsArray = parseJsonOrString(documents, []);
    const specsListArray = parseArrayOrString(specifications_list, []);
    const productRangeFeaturesArray = parseArrayOrString(product_range_features, []);
    const certsListArray = parseArrayOrString(certifications_list, []);
    const categorizedFeaturesArray = parseJsonOrString(categorized_features, []);
    const badgesArray = parseArrayOrString(badges, []);
    let brandHighlightsPayload = brand_highlights;
    if (typeof brand_highlights === 'string') {
      try {
        brandHighlightsPayload = JSON.parse(brand_highlights);
      } catch {
        brandHighlightsPayload = null;
      }
    }

    let cardsList = [];
    let finalTagline = capabilities_tagline || 'CORPORATE CAPABILITIES';
    let finalHeading = capabilities_heading || 'Brand Highlights';

    if (Array.isArray(brandHighlightsPayload)) {
      cardsList = brandHighlightsPayload;
    } else if (brandHighlightsPayload && typeof brandHighlightsPayload === 'object') {
      if (brandHighlightsPayload.tagline) finalTagline = brandHighlightsPayload.tagline;
      if (brandHighlightsPayload.heading) finalHeading = brandHighlightsPayload.heading;
      if (Array.isArray(brandHighlightsPayload.cards)) {
        cardsList = brandHighlightsPayload.cards;
      }
    }

    if (capabilities_tagline) finalTagline = capabilities_tagline;
    if (capabilities_heading) finalHeading = capabilities_heading;

    const finalBrandHighlightsObject = {
      tagline: finalTagline,
      heading: finalHeading,
      cards: cardsList,
    };

    const result = await pool.query(
      `UPDATE brands 
       SET category_id = $1, name = $2, slug = $3, description = $4, image_url = $5, card_image = $6,
           certifications = $7, gallery = $8, long_description = $9, key_features = $10,
           highlights = $11, documents = $12, specs_image_url = $13, specifications_list = $14,
           product_range_description = $15, product_range_features = $16, specs_description = $17,
           certifications_list = $18, product_range_subtitle = $19, company_profile_text = $20,
           company_profile_image_url = $21, categorized_features = $22, badges = $23,
           capabilities_tagline = $24, capabilities_heading = $25, brand_highlights = $26, footer_note = $27
       WHERE id = $28 RETURNING *`,
      [
        category_id,
        name,
        brandSlug,
        description || '',
        image_url || '',
        finalCardImage,
        JSON.stringify(certsArray),
        galleryArray,
        long_description || description || '',
        keyFeaturesArray,
        highlightsArray,
        JSON.stringify(documentsArray),
        specs_image_url || '',
        specsListArray,
        product_range_description || '',
        productRangeFeaturesArray,
        specs_description || '',
        certsListArray,
        product_range_subtitle || '',
        company_profile_text || '',
        company_profile_image_url || '',
        JSON.stringify(categorizedFeaturesArray),
        badgesArray,
        finalTagline,
        finalHeading,
        JSON.stringify(finalBrandHighlightsObject),
        footer_note || '',
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating brand:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/brands/:id (Protected)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM brands WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, message: 'Brand deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
