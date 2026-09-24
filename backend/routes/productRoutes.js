import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { sanitizeHtml } from '../middleware/validator.js';

const router = express.Router();

// Auto-migrate category_banner_image and card_image column if not present
pool.query(`
  ALTER TABLE products ADD COLUMN IF NOT EXISTS category_banner_image TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS banner_images TEXT[] DEFAULT '{}';
  ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_banner_image TEXT DEFAULT '';
  ALTER TABLE brands ADD COLUMN IF NOT EXISTS category_banner_image TEXT DEFAULT '';
  ALTER TABLE products ADD COLUMN IF NOT EXISTS card_image TEXT DEFAULT '';
`).catch((err) => console.warn('Product schema auto-migration notice:', err.message));

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

// GET /api/products (Public - Returns all products with category, brand, and subcategory names)
router.get('/', async (req, res) => {
  try {
    const { featured, is_featured, search, category } = req.query;
    let query = `
      SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        b.certifications as brand_certifications,
        b.certifications_list as brand_certifications_list,
        c.name as category_name,
        c.slug as category_slug,
        s.name as subcategory_name,
        s.slug as subcategory_slug
      FROM products p
      JOIN brands b ON b.id = p.brand_id
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN subcategories s ON s.id = p.subcategory_id
    `;
    const params = [];
    const conditions = [];

    if (featured === 'true' || is_featured === 'true') {
      conditions.push(`p.is_featured = true`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const searchIdx = params.length;
      conditions.push(`(p.title ILIKE $${searchIdx} OR p.name ILIKE $${searchIdx} OR b.name ILIKE $${searchIdx})`);
    }

    if (category && category !== 'All') {
      params.push(category.trim());
      const catIdx = params.length;
      conditions.push(`(c.name = $${catIdx} OR c.slug = $${catIdx} OR CAST(c.id AS TEXT) = $${catIdx})`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY p.id DESC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve products.',
    });
  }
});

// GET /api/products/:slug (Public - Single Product Details + Related Products)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        b.certifications as brand_certifications,
        b.certifications_list as brand_certifications_list,
        c.name as category_name,
        c.slug as category_slug,
        s.name as subcategory_name,
        s.slug as subcategory_slug
       FROM products p
       JOIN brands b ON b.id = p.brand_id
       JOIN categories c ON c.id = b.category_id
       LEFT JOIN subcategories s ON s.id = p.subcategory_id
       WHERE LOWER(p.slug) = LOWER($1) 
          OR p.slug = LOWER(REPLACE($1, ' ', '-'))
          OR LOWER(p.title) = LOWER(REPLACE($1, '-', ' '))
          OR LOWER(p.name) = LOWER(REPLACE($1, '-', ' '))
          OR LOWER(s.slug) = LOWER($1)
          OR LOWER(s.name) = LOWER(REPLACE($1, '-', ' '))
          OR p.id::text = $1
       ORDER BY p.id DESC`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const product = result.rows[0];

    // Fetch 3-4 related products from the same brand or category
    const relatedResult = await pool.query(
      `SELECT p.id, p.title, p.name, p.slug, p.short_description, p.image_url, p.specs,
              b.name as brand_name, b.slug as brand_slug, c.slug as category_slug
       FROM products p
       JOIN brands b ON b.id = p.brand_id
       JOIN categories c ON c.id = b.category_id
       WHERE (p.brand_id = $1 OR p.category_id = $2) AND p.id != $3
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

// POST /api/products (Protected - Create Product with Rich Fields)
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
      message: 'Brand ID and Product Title are required fields.',
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
      `INSERT INTO products 
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
      message: `Product '${productTitle}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: error.code === '23505' ? 'A product with this slug already exists.' : error.message,
    });
  }
});

// PUT /api/products/:id (Protected - Update Product with Rich Fields)
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
      message: 'Brand ID and Product Title are required fields.',
    });
  }

  const productSlug = slug || productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  try {
    const brandRes = await pool.query(`SELECT category_id FROM brands WHERE id = $1`, [brand_id]);
    let finalCategoryId = category_id || (brandRes.rows.length > 0 ? brandRes.rows[0].category_id : null);
    if (!finalCategoryId) {
      const prodRes = await pool.query(`SELECT category_id FROM products WHERE id = $1`, [id]);
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
      `UPDATE products
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
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Product '${productTitle}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id (Protected - Delete Product)
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Product '${result.rows[0].title || result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
