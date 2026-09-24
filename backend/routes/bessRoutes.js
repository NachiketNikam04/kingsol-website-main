import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { sanitizeHtml } from '../middleware/validator.js';

const router = express.Router();

// Auto-migrate bess table schema if not already present
pool.query(`
  CREATE TABLE IF NOT EXISTS bess (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    image_url TEXT,
    card_image TEXT DEFAULT '',
    category_banner_image TEXT DEFAULT '',
    banner_images TEXT[] DEFAULT '{}',
    datasheet_url TEXT,
    expertise TEXT,
    phase_type VARCHAR(255) DEFAULT '',
    gallery TEXT[] DEFAULT '{}',
    long_description TEXT DEFAULT '',
    key_features TEXT[] DEFAULT '{}',
    documents JSONB DEFAULT '[]'::jsonb,
    specs JSONB DEFAULT '{}'::jsonb,
    features TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    capabilities_tagline VARCHAR(255) DEFAULT '',
    capabilities_heading VARCHAR(255) DEFAULT '',
    brand_highlights JSONB DEFAULT NULL,
    footer_note TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS idx_bess_slug ON bess(slug);
  CREATE INDEX IF NOT EXISTS idx_bess_brand_id ON bess(brand_id);
  CREATE INDEX IF NOT EXISTS idx_bess_category_id ON bess(category_id);
`).catch((err) => console.warn('BESS schema auto-migration notice:', err.message));

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

// GET /api/bess (Public - Returns all BESS items with category, brand, and subcategory details)
router.get('/', async (req, res) => {
  try {
    const { featured, is_featured, search, category, brand } = req.query;
    let query = `
      SELECT 
        bess_item.*,
        b.name as brand_name,
        b.slug as brand_slug,
        b.logo_url as brand_logo_url,
        b.certifications as brand_certifications,
        b.certifications_list as brand_certifications_list,
        c.name as category_name,
        c.slug as category_slug,
        s.name as subcategory_name,
        s.slug as subcategory_slug
      FROM bess bess_item
      JOIN brands b ON b.id = bess_item.brand_id
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN subcategories s ON s.id = bess_item.subcategory_id
    `;
    const params = [];
    const conditions = [];

    if (featured === 'true' || is_featured === 'true') {
      conditions.push(`bess_item.is_featured = true`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const searchIdx = params.length;
      conditions.push(`(bess_item.title ILIKE $${searchIdx} OR bess_item.name ILIKE $${searchIdx} OR b.name ILIKE $${searchIdx})`);
    }

    if (category && category !== 'All') {
      params.push(category.trim());
      const catIdx = params.length;
      conditions.push(`(c.name = $${catIdx} OR c.slug = $${catIdx} OR CAST(c.id AS TEXT) = $${catIdx})`);
    }

    if (brand && brand !== 'All') {
      params.push(brand.trim());
      const brandIdx = params.length;
      conditions.push(`(b.name = $${brandIdx} OR b.slug = $${brandIdx} OR CAST(b.id AS TEXT) = $${brandIdx})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY bess_item.id DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching BESS items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve BESS items.',
    });
  }
});

// GET /api/bess/:slug (Public - Single BESS Details + Related Products)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        bess_item.*,
        b.name as brand_name,
        b.slug as brand_slug,
        b.logo_url as brand_logo_url,
        b.certifications as brand_certifications,
        b.certifications_list as brand_certifications_list,
        c.name as category_name,
        c.slug as category_slug,
        s.name as subcategory_name,
        s.slug as subcategory_slug
       FROM bess bess_item
       JOIN brands b ON b.id = bess_item.brand_id
       JOIN categories c ON c.id = b.category_id
       LEFT JOIN subcategories s ON s.id = bess_item.subcategory_id
       WHERE LOWER(bess_item.slug) = LOWER($1) 
          OR bess_item.slug = LOWER(REPLACE($1, ' ', '-'))
          OR LOWER(bess_item.title) = LOWER(REPLACE($1, '-', ' '))
          OR LOWER(bess_item.name) = LOWER(REPLACE($1, '-', ' '))
          OR LOWER(s.slug) = LOWER($1)
          OR LOWER(s.name) = LOWER(REPLACE($1, '-', ' '))
          OR bess_item.id::text = $1
       ORDER BY bess_item.id DESC`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'BESS item not found' });
    }

    const product = result.rows[0];

    // Fetch 3-4 related items from the same brand or category
    const relatedResult = await pool.query(
      `SELECT bess_item.id, bess_item.title, bess_item.name, bess_item.slug, bess_item.short_description, bess_item.image_url, bess_item.specs,
              b.name as brand_name, b.slug as brand_slug, c.slug as category_slug
       FROM bess bess_item
       JOIN brands b ON b.id = bess_item.brand_id
       JOIN categories c ON c.id = b.category_id
       WHERE (bess_item.brand_id = $1 OR bess_item.category_id = $2) AND bess_item.id != $3
       LIMIT 4`,
      [product.brand_id, product.category_id, product.id]
    );

    res.status(200).json({
      success: true,
      data: {
        product,
        relatedProducts: relatedResult.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/bess (Protected - Create BESS Item with Rich Fields)
router.post('/', verifyToken, async (req, res) => {
  const {
    category_id,
    brand_id,
    subcategory_id,
    name,
    title,
    slug,
    description,
    short_description,
    long_description,
    image_url,
    card_image,
    category_banner_image,
    datasheet_url,
    expertise,
    gallery,
    key_features,
    documents,
    specs,
    specifications,
    features,
    is_featured,
    capabilities_tagline,
    capabilities_heading,
    brand_highlights,
    footer_note,
  } = req.body;

  const productTitle = title || name;

  if (!brand_id || !productTitle) {
    return res.status(400).json({
      success: false,
      message: 'Brand ID and BESS Title are required fields.',
    });
  }

  const productSlug = slug || productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const brandRes = await pool.query(`SELECT category_id FROM brands WHERE id = $1`, [brand_id]);
    if (brandRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid Brand ID.' });
    }
    const finalCategoryId = category_id || brandRes.rows[0].category_id;
    let galleryInput = gallery || req.body.images;
    if (!galleryInput || (Array.isArray(galleryInput) && galleryInput.length === 0)) {
      const discreteImages = [req.body.image_1, req.body.image_2, req.body.image_3, req.body.image_4].filter(Boolean);
      if (discreteImages.length > 0) {
        galleryInput = discreteImages;
      }
    }
    const galleryArray = parseArrayOrString(galleryInput, [image_url].filter(Boolean))
      .filter((u) => typeof u === 'string' && u.trim() !== '')
      .slice(0, 4);
    if (galleryArray.length === 0 && image_url) {
      galleryArray.push(image_url);
    }
    const keyFeaturesArray = parseArrayOrString(key_features || features, []);
    const documentsArray = parseJsonOrString(documents || req.body.datasheets, []);
    const specsObject = parseJsonOrString(specs || specifications, {});

    const cleanDesc = sanitizeHtml(description || '');
    const cleanShortDesc = sanitizeHtml(short_description || description || '');
    const cleanLongDesc = sanitizeHtml(long_description || description || '');

    const isFeaturedBool = is_featured === true || is_featured === 'true';

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

    const finalPhaseType = req.body.phase_type || req.body.phaseType || expertise || '';
    const bannerImagesArray = parseArrayOrString(req.body.banner_images || req.body.category_banner_images, [category_banner_image].filter(Boolean))
      .filter((u) => typeof u === 'string' && u.trim() !== '')
      .slice(0, 4);
    const primaryCategoryBanner = bannerImagesArray[0] || category_banner_image || '';

    const result = await pool.query(
      `INSERT INTO bess 
       (category_id, brand_id, subcategory_id, title, name, slug, description, short_description, long_description, image_url, card_image, category_banner_image, banner_images, datasheet_url, expertise, phase_type, gallery, key_features, documents, specs, features, is_featured, capabilities_tagline, capabilities_heading, brand_highlights, footer_note)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING *`,
      [
        finalCategoryId,
        brand_id,
        subcategory_id || null,
        productTitle,
        productSlug,
        cleanDesc,
        cleanShortDesc,
        cleanLongDesc,
        image_url || '',
        card_image || '',
        primaryCategoryBanner,
        bannerImagesArray,
        datasheet_url || '',
        finalPhaseType,
        finalPhaseType,
        galleryArray,
        keyFeaturesArray,
        JSON.stringify(documentsArray),
        JSON.stringify(specsObject),
        keyFeaturesArray,
        isFeaturedBool,
        finalTagline,
        finalHeading,
        JSON.stringify(finalBrandHighlightsObject),
        footer_note || '',
      ]
    );

    res.status(201).json({
      success: true,
      message: `BESS Item '${productTitle}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating BESS item:', error);
    res.status(500).json({
      success: false,
      message: error.code === '23505' ? 'A BESS item with this slug already exists.' : error.message,
    });
  }
});

// PUT /api/bess/:id (Protected - Update BESS Item with Rich Fields)
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    category_id,
    brand_id,
    subcategory_id,
    name,
    title,
    slug,
    description,
    short_description,
    long_description,
    image_url,
    card_image,
    category_banner_image,
    datasheet_url,
    expertise,
    gallery,
    key_features,
    documents,
    specs,
    specifications,
    features,
    is_featured,
    capabilities_tagline,
    capabilities_heading,
    brand_highlights,
    footer_note,
  } = req.body;

  const productTitle = title || name;

  if (!brand_id || !productTitle) {
    return res.status(400).json({
      success: false,
      message: 'Brand ID and BESS Title are required fields.',
    });
  }

  const productSlug = slug || productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const brandRes = await pool.query(`SELECT category_id FROM brands WHERE id = $1`, [brand_id]);
    let finalCategoryId = category_id || (brandRes.rows.length > 0 ? brandRes.rows[0].category_id : null);
    if (!finalCategoryId) {
      const prodRes = await pool.query(`SELECT category_id FROM bess WHERE id = $1`, [id]);
      if (prodRes.rows.length > 0) {
        finalCategoryId = prodRes.rows[0].category_id;
      }
    }
    let galleryInput = gallery || req.body.images;
    if (!galleryInput || (Array.isArray(galleryInput) && galleryInput.length === 0)) {
      const discreteImages = [req.body.image_1, req.body.image_2, req.body.image_3, req.body.image_4].filter(Boolean);
      if (discreteImages.length > 0) {
        galleryInput = discreteImages;
      }
    }
    const galleryArray = parseArrayOrString(galleryInput, [image_url].filter(Boolean))
      .filter((u) => typeof u === 'string' && u.trim() !== '')
      .slice(0, 4);
    if (galleryArray.length === 0 && image_url) {
      galleryArray.push(image_url);
    }
    const keyFeaturesArray = parseArrayOrString(key_features || features, []);
    const documentsArray = parseJsonOrString(documents || req.body.datasheets, []);
    const specsObject = parseJsonOrString(specs || specifications, {});

    const cleanDesc = sanitizeHtml(description || '');
    const cleanShortDesc = sanitizeHtml(short_description || description || '');
    const cleanLongDesc = sanitizeHtml(long_description || description || '');

    const isFeaturedBool = is_featured === true || is_featured === 'true';

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

    const finalPhaseType = req.body.phase_type || req.body.phaseType || expertise || '';
    const bannerImagesArray = parseArrayOrString(req.body.banner_images || req.body.category_banner_images, [category_banner_image].filter(Boolean))
      .filter((u) => typeof u === 'string' && u.trim() !== '')
      .slice(0, 4);
    const primaryCategoryBanner = bannerImagesArray[0] || category_banner_image || '';

    const result = await pool.query(
      `UPDATE bess
       SET category_id = $1, brand_id = $2, subcategory_id = $3, title = $4, name = $4, slug = $5,
           description = $6, short_description = $7, long_description = $8, image_url = $9, card_image = $10, category_banner_image = $11, banner_images = $12, datasheet_url = $13,
           expertise = $14, phase_type = $15, gallery = $16, key_features = $17, documents = $18, specs = $19, features = $20, is_featured = $21,
           capabilities_tagline = $22, capabilities_heading = $23, brand_highlights = $24, footer_note = $25
       WHERE id = $26
       RETURNING *`,
      [
        finalCategoryId,
        brand_id,
        subcategory_id || null,
        productTitle,
        productSlug,
        cleanDesc,
        cleanShortDesc,
        cleanLongDesc,
        image_url || '',
        card_image || '',
        primaryCategoryBanner,
        bannerImagesArray,
        datasheet_url || '',
        finalPhaseType,
        finalPhaseType,
        galleryArray,
        keyFeaturesArray,
        JSON.stringify(documentsArray),
        JSON.stringify(specsObject),
        keyFeaturesArray,
        isFeaturedBool,
        finalTagline,
        finalHeading,
        JSON.stringify(finalBrandHighlightsObject),
        footer_note || '',
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'BESS item not found.' });
    }

    res.status(200).json({
      success: true,
      message: `BESS Item '${productTitle}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating BESS item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/bess/:id (Protected - Delete BESS Item)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM bess WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'BESS item not found.' });
    }

    res.status(200).json({
      success: true,
      message: `BESS Item '${result.rows[0].title || result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting BESS item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
