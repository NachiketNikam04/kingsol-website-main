import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   HERO SECTION ROUTES
   ========================================================================== */

// Helper to ensure hero_slides column exists
const ensureHeroSlidesColumn = async () => {
  await pool.query(`ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS hero_slides JSONB DEFAULT '[]'::jsonb;`);
};

const defaultHeroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80',
    headline: 'Powering the future of the world',
    highlightWord: 'future',
  },
  {
    image: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?auto=format&fit=crop&w=2000&q=80',
    headline: 'Engineered for maximum Clean energy yield',
    highlightWord: 'Clean',
  },
  {
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=2000&q=80',
    headline: 'Tier-1 Solar components distributed across India',
    highlightWord: 'Solar',
  },
];

const formatHeroSettings = (row) => {
  let slides = row?.hero_slides;
  if (typeof slides === 'string') {
    try {
      slides = JSON.parse(slides);
    } catch {
      slides = [];
    }
  }

  if (!Array.isArray(slides) || slides.length === 0) {
    if (row?.headline || row?.bg_image_url) {
      slides = [
        {
          image: row.bg_image_url || defaultHeroSlides[0].image,
          headline: row.headline || defaultHeroSlides[0].headline,
          highlightWord: row.highlight_word || defaultHeroSlides[0].highlightWord,
        },
        defaultHeroSlides[1],
        defaultHeroSlides[2],
      ];
    } else {
      slides = defaultHeroSlides;
    }
  }

  // Ensure each slide has expected keys
  const sanitizedSlides = slides.slice(0, 3).map((s, idx) => ({
    image: s.image || s.bg_image_url || defaultHeroSlides[idx]?.image || '',
    headline: s.headline || defaultHeroSlides[idx]?.headline || '',
    highlightWord: s.highlightWord || s.highlight_word || defaultHeroSlides[idx]?.highlightWord || '',
  }));

  return {
    id: row?.id || 1,
    bg_image_url: sanitizedSlides[0]?.image || row?.bg_image_url || defaultHeroSlides[0].image,
    headline: sanitizedSlides[0]?.headline || row?.headline || defaultHeroSlides[0].headline,
    highlight_word: sanitizedSlides[0]?.highlightWord || row?.highlight_word || defaultHeroSlides[0].highlightWord,
    subtitle: row?.subtitle || 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
    heroSlides: sanitizedSlides,
    hero_slides: sanitizedSlides,
  };
};

// GET /api/home/hero (Public - Returns hero_settings and active hero_trusted_brands)
router.get('/hero', async (req, res) => {
  try {
    await ensureHeroSlidesColumn();
    const settingsResult = await pool.query(`SELECT * FROM hero_settings WHERE id = 1`);
    const brandsResult = await pool.query(`SELECT * FROM hero_trusted_brands WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC`);

    const formattedSettings = formatHeroSettings(settingsResult.rows[0]);

    res.status(200).json({
      success: true,
      data: {
        settings: formattedSettings,
        brands: brandsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching hero section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load hero configuration.' });
  }
});

// GET /api/home/hero/all (Protected - Fetch all brands for admin panel)
router.get('/hero/all', verifyToken, async (req, res) => {
  try {
    await ensureHeroSlidesColumn();
    const settingsResult = await pool.query(`SELECT * FROM hero_settings WHERE id = 1`);
    const brandsResult = await pool.query(`SELECT * FROM hero_trusted_brands ORDER BY sort_order ASC, id ASC`);

    const formattedSettings = formatHeroSettings(settingsResult.rows[0]);

    res.status(200).json({
      success: true,
      data: {
        settings: formattedSettings,
        brands: brandsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching hero admin data:', error);
    res.status(500).json({ success: false, message: 'Failed to load hero admin config.' });
  }
});

// PUT /api/home/hero (Protected - Update Singleton Hero Settings with heroSlides)
router.put('/hero', verifyToken, async (req, res) => {
  const { heroSlides, hero_slides, bg_image_url, headline, highlight_word, subtitle } = req.body;

  try {
    await ensureHeroSlidesColumn();

    const rawSlides = heroSlides || hero_slides;
    let finalSlides = defaultHeroSlides;

    if (Array.isArray(rawSlides) && rawSlides.length > 0) {
      finalSlides = rawSlides.slice(0, 3).map((s, idx) => ({
        image: s.image || s.bg_image_url || defaultHeroSlides[idx]?.image || '',
        headline: s.headline || defaultHeroSlides[idx]?.headline || '',
        highlightWord: s.highlightWord || s.highlight_word || defaultHeroSlides[idx]?.highlightWord || '',
      }));
    } else if (bg_image_url || headline) {
      finalSlides = [
        {
          image: bg_image_url || defaultHeroSlides[0].image,
          headline: headline || defaultHeroSlides[0].headline,
          highlightWord: highlight_word || defaultHeroSlides[0].highlightWord,
        },
        defaultHeroSlides[1],
        defaultHeroSlides[2],
      ];
    }

    const slide0 = finalSlides[0] || defaultHeroSlides[0];
    const finalBgImage = slide0.image || bg_image_url || defaultHeroSlides[0].image;
    const finalHeadline = slide0.headline || headline || defaultHeroSlides[0].headline;
    const finalHighlightWord = slide0.highlightWord || highlight_word || defaultHeroSlides[0].highlightWord;
    const finalSubtitle = subtitle || 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.';

    const result = await pool.query(
      `INSERT INTO hero_settings (id, bg_image_url, headline, highlight_word, subtitle, hero_slides, updated_at)
       VALUES (1, $1, $2, $3, $4, $5::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE
       SET bg_image_url = EXCLUDED.bg_image_url,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           hero_slides = EXCLUDED.hero_slides,
           updated_at = NOW()
       RETURNING *`,
      [finalBgImage, finalHeadline, finalHighlightWord, finalSubtitle, JSON.stringify(finalSlides)]
    );

    const formattedSettings = formatHeroSettings(result.rows[0]);

    res.status(200).json({
      success: true,
      message: 'Hero settings updated successfully.',
      data: formattedSettings,
    });
  } catch (error) {
    console.error('Error updating hero settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update hero settings.' });
  }
});

// POST /api/home/hero/brands (Protected - Add New Trusted Brand)
router.post('/hero/brands', verifyToken, async (req, res) => {
  const { name, image_url, sort_order, is_active } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Brand name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO hero_trusted_brands (name, image_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, image_url || null, sort_order || 0, is_active ?? true]
    );

    res.status(201).json({
      success: true,
      message: `Trusted brand '${name}' added successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding hero trusted brand:', error);
    res.status(500).json({ success: false, message: 'Failed to add trusted brand.' });
  }
});

// PUT /api/home/hero/brands/:id (Protected - Update Trusted Brand)
router.put('/hero/brands/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, image_url, sort_order, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE hero_trusted_brands
       SET name = $1, image_url = $2, sort_order = $3, is_active = $4
       WHERE id = $5
       RETURNING *`,
      [name, image_url || null, sort_order || 0, is_active ?? true, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trusted brand not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Trusted brand '${name}' updated.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating hero trusted brand:', error);
    res.status(500).json({ success: false, message: 'Failed to update trusted brand.' });
  }
});

// DELETE /api/home/hero/brands/:id (Protected - Delete Trusted Brand)
router.delete('/hero/brands/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM hero_trusted_brands WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trusted brand not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Trusted brand '${result.rows[0].name}' deleted.`,
    });
  } catch (error) {
    console.error('Error deleting hero trusted brand:', error);
    res.status(500).json({ success: false, message: 'Failed to delete trusted brand.' });
  }
});

/* ==========================================================================
   ABOUT SECTION ROUTES
   ========================================================================== */

// GET /api/home/about (Public - Returns home_about_settings and home_about_stats)
router.get('/about', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_about_settings WHERE id = 1`);
    const statsResult = await pool.query(`SELECT * FROM home_about_stats ORDER BY sort_order ASC, id ASC`);

    const defaultAboutSettings = {
      tagline: 'WHAT WE DO',
      headline: 'We are dedicated to making clean power accessible, affordable, and effective.',
      highlight_word: 'clean power',
      subtitle: 'Kingsol Energy is a premier solar procurement partner across India, driving rooftop solar installations, commercial PV plants, and grid-tie microgrids with Tier-1 components.',
      main_image_url: 'https://cdn.britannica.com/94/192794-050-3F3F3DDD/panels-electricity-order-sunlight.jpg',
      card_heading: 'SUNERGY VISION',
      card_body: 'Sunergy was founded with a vision to drive sustainable energy solutions that empower individuals, businesses, and communities.',
      bg_image_url: 'https://static.vecteezy.com/system/resources/previews/027/662/778/large_2x/solar-panel-on-sky-sunset-background-free-photo.jpg',
      image_on_left: true,
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultAboutSettings,
        stats: statsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching about section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load about section configuration.' });
  }
});

// PUT /api/home/about (Protected - Update Singleton About Settings)
router.put('/about', verifyToken, async (req, res) => {
  const {
    tagline,
    headline,
    highlight_word,
    subtitle,
    main_image_url,
    card_heading,
    card_body,
    bg_image_url,
    image_on_left,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_about_settings (id, tagline, headline, highlight_word, subtitle, main_image_url, card_heading, card_body, bg_image_url, image_on_left, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           main_image_url = EXCLUDED.main_image_url,
           card_heading = EXCLUDED.card_heading,
           card_body = EXCLUDED.card_body,
           bg_image_url = EXCLUDED.bg_image_url,
           image_on_left = EXCLUDED.image_on_left,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'WHAT WE DO',
        headline || 'We are dedicated to making clean power accessible, affordable, and effective.',
        highlight_word || 'clean power',
        subtitle || 'Kingsol Energy is a premier solar procurement partner across India, driving rooftop solar installations, commercial PV plants, and grid-tie microgrids with Tier-1 components.',
        main_image_url || 'https://cdn.britannica.com/94/192794-050-3F3F3DDD/panels-electricity-order-sunlight.jpg',
        card_heading || 'SUNERGY VISION',
        card_body || 'Sunergy was founded with a vision to drive sustainable energy solutions that empower individuals, businesses, and communities.',
        bg_image_url || 'https://static.vecteezy.com/system/resources/previews/027/662/778/large_2x/solar-panel-on-sky-sunset-background-free-photo.jpg',
        image_on_left ?? true,
      ]
    );

    res.status(200).json({
      success: true,
      message: 'About section settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating about settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update about section settings.' });
  }
});

// POST /api/home/about/stats (Protected - Add New Stat Counter)
router.post('/about/stats', verifyToken, async (req, res) => {
  const { end_value, prefix, suffix, label, sort_order } = req.body;

  if (end_value === undefined || !label) {
    return res.status(400).json({ success: false, message: 'End value and label are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO home_about_stats (end_value, prefix, suffix, label, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [parseInt(end_value), prefix || '', suffix || '', label, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: `Stat '${label}' added successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding about stat:', error);
    res.status(500).json({ success: false, message: 'Failed to add statistic.' });
  }
});

// PUT /api/home/about/stats/:id (Protected - Update Stat Counter)
router.put('/about/stats/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { end_value, prefix, suffix, label, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE home_about_stats
       SET end_value = $1, prefix = $2, suffix = $3, label = $4, sort_order = $5
       WHERE id = $6
       RETURNING *`,
      [parseInt(end_value), prefix || '', suffix || '', label, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Statistic not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Stat '${label}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating about stat:', error);
    res.status(500).json({ success: false, message: 'Failed to update statistic.' });
  }
});

// DELETE /api/home/about/stats/:id (Protected - Delete Stat Counter)
router.delete('/about/stats/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM home_about_stats WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Statistic not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Stat '${result.rows[0].label}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting about stat:', error);
    res.status(500).json({ success: false, message: 'Failed to delete statistic.' });
  }
});

/* ==========================================================================
   PARTNERS SECTION ROUTES
   ========================================================================== */

// Helper to ensure route_url and linked_brand_id columns exist in home_partners_logos
const ensurePartnerLogosColumns = async () => {
  try {
    await pool.query(`
      ALTER TABLE home_partners_logos ADD COLUMN IF NOT EXISTS route_url TEXT DEFAULT '';
      ALTER TABLE home_partners_logos ADD COLUMN IF NOT EXISTS linked_brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;
    `);
  } catch (err) {
    console.error('Error ensuring columns in home_partners_logos:', err);
  }
};
ensurePartnerLogosColumns();

// GET /api/home/partners (Public - Returns home_partners_settings and home_partners_logos with joined brand info)
router.get('/partners', async (req, res) => {
  try {
    await ensurePartnerLogosColumns();
    const settingsResult = await pool.query(`SELECT * FROM home_partners_settings WHERE id = 1`);
    const logosResult = await pool.query(`
      SELECT 
        l.id,
        l.name,
        l.image_url,
        l.sort_order,
        l.route_url,
        l.linked_brand_id,
        CASE 
          WHEN b.id IS NOT NULL THEN json_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'category_id', b.category_id,
            'category_slug', c.slug
          )
          ELSE NULL 
        END AS linked_brand
      FROM home_partners_logos l
      LEFT JOIN brands b ON l.linked_brand_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      ORDER BY l.sort_order ASC, l.id ASC
    `);

    const defaultPartnersSettings = {
      tagline: 'WHO WE TRUST',
      headline: 'Integrated seamlessly with Trusted industry partners',
      highlight_word: 'Trusted',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultPartnersSettings,
        logos: logosResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching partners section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load partners section configuration.' });
  }
});

// PUT /api/home/partners (Protected - Update Singleton Partners Settings)
router.put('/partners', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_partners_settings (id, tagline, headline, highlight_word, updated_at)
       VALUES (1, $1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        tagline || 'WHO WE TRUST',
        headline || 'Integrated seamlessly with Trusted industry partners',
        highlight_word || 'Trusted',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Partners section settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating partners settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update partners section settings.' });
  }
});

// POST /api/home/partners/logos (Protected - Add New Partner Logo)
router.post('/partners/logos', verifyToken, async (req, res) => {
  const { name, image_url, sort_order, route_url, linked_brand_id } = req.body;

  if (!name || !image_url) {
    return res.status(400).json({ success: false, message: 'Partner name and logo image URL are required.' });
  }

  const brandId = linked_brand_id ? parseInt(linked_brand_id, 10) : null;

  try {
    await ensurePartnerLogosColumns();
    const insertResult = await pool.query(
      `INSERT INTO home_partners_logos (name, image_url, sort_order, route_url, linked_brand_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, image_url, sort_order || 0, route_url || '', brandId]
    );

    const newId = insertResult.rows[0].id;
    const result = await pool.query(
      `SELECT 
        l.id,
        l.name,
        l.image_url,
        l.sort_order,
        l.route_url,
        l.linked_brand_id,
        CASE 
          WHEN b.id IS NOT NULL THEN json_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'category_id', b.category_id,
            'category_slug', c.slug
          )
          ELSE NULL 
        END AS linked_brand
      FROM home_partners_logos l
      LEFT JOIN brands b ON l.linked_brand_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE l.id = $1`,
      [newId]
    );

    res.status(201).json({
      success: true,
      message: `Partner logo '${name}' added successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding partner logo:', error);
    res.status(500).json({ success: false, message: 'Failed to add partner logo.' });
  }
});

// PUT /api/home/partners/logos/:id (Protected - Update Partner Logo)
router.put('/partners/logos/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, image_url, sort_order, route_url, linked_brand_id } = req.body;

  const brandId = linked_brand_id ? parseInt(linked_brand_id, 10) : null;

  try {
    await ensurePartnerLogosColumns();
    const updateResult = await pool.query(
      `UPDATE home_partners_logos
       SET name = $1, image_url = $2, sort_order = $3, route_url = $4, linked_brand_id = $5
       WHERE id = $6
       RETURNING id`,
      [name, image_url, sort_order || 0, route_url || '', brandId, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner logo not found.' });
    }

    const result = await pool.query(
      `SELECT 
        l.id,
        l.name,
        l.image_url,
        l.sort_order,
        l.route_url,
        l.linked_brand_id,
        CASE 
          WHEN b.id IS NOT NULL THEN json_build_object(
            'id', b.id,
            'name', b.name,
            'slug', b.slug,
            'category_id', b.category_id,
            'category_slug', c.slug
          )
          ELSE NULL 
        END AS linked_brand
      FROM home_partners_logos l
      LEFT JOIN brands b ON l.linked_brand_id = b.id
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE l.id = $1`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: `Partner logo '${name}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating partner logo:', error);
    res.status(500).json({ success: false, message: 'Failed to update partner logo.' });
  }
});

// DELETE /api/home/partners/logos/:id (Protected - Delete Partner Logo)
router.delete('/partners/logos/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM home_partners_logos WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Partner logo not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Partner logo '${result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting partner logo:', error);
    res.status(500).json({ success: false, message: 'Failed to delete partner logo.' });
  }
});

/* ==========================================================================
   FEATURED PRODUCTS SHOWCASE ROUTES
   ========================================================================== */

// GET /api/home/showcase (Public - Returns home_showcase_settings and featured products)
router.get('/showcase', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_showcase_settings WHERE id = 1`);

    // Fetch products marked is_featured = TRUE joined with categories & brands
    let productsResult = await pool.query(
      `SELECT p.*, 
              c.name AS category_name, c.slug AS category_slug, 
              b.name AS brand_name, b.slug AS brand_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_featured = TRUE
       ORDER BY p.id DESC`
    );

    // Fallback: If no products are explicitly marked featured, return 10 most recent
    if (productsResult.rows.length === 0) {
      productsResult = await pool.query(
        `SELECT p.*, 
                c.name AS category_name, c.slug AS category_slug, 
                b.name AS brand_name, b.slug AS brand_slug
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN brands b ON p.brand_id = b.id
         ORDER BY p.id DESC
         LIMIT 10`
      );
    }

    const defaultShowcaseSettings = {
      tagline: 'FEATURED PICKS',
      headline: 'Products we Deliver',
      highlight_word: 'Deliver',
      subtitle: 'Featured products from our portfolio — click through to product pages',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultShowcaseSettings,
        products: productsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching showcase section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load showcase section configuration.' });
  }
});

// PUT /api/home/showcase (Protected - Update Singleton Showcase Settings)
router.put('/showcase', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, subtitle } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_showcase_settings (id, tagline, headline, highlight_word, subtitle, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'FEATURED PICKS',
        headline || 'Products we Deliver',
        highlight_word || 'Deliver',
        subtitle || 'Featured products from our portfolio — click through to product pages',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Showcase section settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating showcase settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update showcase section settings.' });
  }
});

/* ==========================================================================
   WHY CHOOSE US SECTION ROUTES
   ========================================================================== */

// GET /api/home/why-choose (Public - Returns home_why_choose_settings and home_why_choose_steps)
router.get('/why-choose', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_why_choose_settings WHERE id = 1`);
    const stepsResult = await pool.query(`SELECT * FROM home_why_choose_steps ORDER BY sort_order ASC, id ASC`);

    const defaultWhyChooseSettings = {
      tagline: 'WHY CHOOSE KINGSOL',
      headline: 'From Consultation to Clean Energy in 4 Simple Steps',
      highlight_word: 'Consultation',
      subtitle: 'We make switching to solar energy simple. Our streamlined process ensures you get the best solar solution quickly, affordably, and completely hassle-free.',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultWhyChooseSettings,
        steps: stepsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching why choose us data:', error);
    res.status(500).json({ success: false, message: 'Failed to load why choose us section configuration.' });
  }
});

// PUT /api/home/why-choose (Protected - Update Singleton Why Choose Settings)
router.put('/why-choose', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, subtitle } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_why_choose_settings (id, tagline, headline, highlight_word, subtitle, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'WHY CHOOSE KINGSOL',
        headline || 'From Consultation to Clean Energy in 4 Simple Steps',
        highlight_word || 'Consultation',
        subtitle || 'We make switching to solar energy simple...',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Why Choose Us settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating why choose settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update why choose section settings.' });
  }
});

// POST /api/home/why-choose/steps (Protected - Add New Process Step)
router.post('/why-choose/steps', verifyToken, async (req, res) => {
  const { title, features, sort_order } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Step title is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO home_why_choose_steps (title, features, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, features || [], sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: `Step '${title}' added successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding why choose step:', error);
    res.status(500).json({ success: false, message: 'Failed to add process step.' });
  }
});

// PUT /api/home/why-choose/steps/:id (Protected - Update Process Step)
router.put('/why-choose/steps/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, features, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE home_why_choose_steps
       SET title = $1, features = $2, sort_order = $3
       WHERE id = $4
       RETURNING *`,
      [title, features || [], sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Process step not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Step '${title}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating why choose step:', error);
    res.status(500).json({ success: false, message: 'Failed to update process step.' });
  }
});

// DELETE /api/home/why-choose/steps/:id (Protected - Delete Process Step)
router.delete('/why-choose/steps/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM home_why_choose_steps WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Process step not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Step '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting why choose step:', error);
    res.status(500).json({ success: false, message: 'Failed to delete process step.' });
  }
});

/* ==========================================================================
   MAINTENANCE & SUPPORT SECTION ROUTES
   ========================================================================== */

// GET /api/home/maintenance and /api/home/support (Public - Returns maintenance/support settings and cards)
router.get(['/maintenance', '/support'], async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_maintenance_settings WHERE id = 1`);
    const cardsResult = await pool.query(`SELECT * FROM home_maintenance_cards ORDER BY sort_order ASC, id ASC`);

    const defaultMaintenanceSettings = {
      tagline: 'MAINTENANCE & SUPPORT',
      headline: 'Keeping your Solar system efficient.',
      highlight_word: 'Solar',
      subtitle: 'Ensuring smooth performance all year for reliable solar energy output.',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultMaintenanceSettings,
        cards: cardsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching maintenance section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load maintenance section configuration.' });
  }
});

// PUT /api/home/maintenance (Protected - Update Singleton Maintenance Settings)
router.put('/maintenance', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, subtitle } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_maintenance_settings (id, tagline, headline, highlight_word, subtitle, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'MAINTENANCE & SUPPORT',
        headline || 'Keeping your Solar system efficient.',
        highlight_word || 'Solar',
        subtitle || 'Ensuring smooth performance all year for reliable solar energy output.',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Maintenance settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating maintenance settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update maintenance settings.' });
  }
});

// POST /api/home/maintenance/cards (Protected - Add New Maintenance Card)
router.post('/maintenance/cards', verifyToken, async (req, res) => {
  const { title, description, icon_name, sort_order } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO home_maintenance_cards (title, description, icon_name, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, icon_name || 'Activity', sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: `Card '${title}' added successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding maintenance card:', error);
    res.status(500).json({ success: false, message: 'Failed to add maintenance service card.' });
  }
});

// PUT /api/home/maintenance/cards/:id (Protected - Update Maintenance Card)
router.put('/maintenance/cards/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, icon_name, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE home_maintenance_cards
       SET title = $1, description = $2, icon_name = $3, sort_order = $4
       WHERE id = $5
       RETURNING *`,
      [title, description, icon_name || 'Activity', sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance card not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Card '${title}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating maintenance card:', error);
    res.status(500).json({ success: false, message: 'Failed to update maintenance card.' });
  }
});

// DELETE /api/home/maintenance/cards/:id (Protected - Delete Maintenance Card)
router.delete('/maintenance/cards/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM home_maintenance_cards WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Maintenance card not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Card '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting maintenance card:', error);
    res.status(500).json({ success: false, message: 'Failed to delete maintenance card.' });
  }
});

/* ==========================================================================
   TESTIMONIALS SECTION ROUTES
   ========================================================================== */

// GET /api/home/testimonials (Public - Returns home_testimonials_settings and home_testimonials reviews)
router.get('/testimonials', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_testimonials_settings WHERE id = 1`);
    const reviewsResult = await pool.query(`SELECT * FROM home_testimonials ORDER BY sort_order ASC, id ASC`);

    const defaultTestimonialsSettings = {
      tagline: 'Testimonial',
      headline: 'What Our Solar Clients Say',
      highlight_word: 'Clients',
      subtitle: 'Real feedback from homeowners and businesses who trust our solar solutions.',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultTestimonialsSettings,
        reviews: reviewsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching testimonials section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load testimonials section configuration.' });
  }
});

// PUT /api/home/testimonials (Protected - Update Singleton Testimonials Settings)
router.put('/testimonials', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, subtitle } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_testimonials_settings (id, tagline, headline, highlight_word, subtitle, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'Testimonial',
        headline || 'What Our Solar Clients Say',
        highlight_word || 'Clients',
        subtitle || 'Real feedback from homeowners and businesses who trust our solar solutions.',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Testimonial settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating testimonial settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update testimonial settings.' });
  }
});

// POST /api/home/testimonials/reviews (Protected - Add New Review)
router.post('/testimonials/reviews', verifyToken, async (req, res) => {
  const { name, role, image_url, review, rating, sort_order } = req.body;

  if (!name || !role || !review) {
    return res.status(400).json({ success: false, message: 'Name, role, and review text are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO home_testimonials (name, role, image_url, review, rating, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, role, image_url || null, review, parseInt(rating) || 5, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: `Review by '${name}' added successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error adding testimonial review:', error);
    res.status(500).json({ success: false, message: 'Failed to add testimonial review.' });
  }
});

// PUT /api/home/testimonials/reviews/:id (Protected - Update Review)
router.put('/testimonials/reviews/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, role, image_url, review, rating, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE home_testimonials
       SET name = $1, role = $2, image_url = $3, review = $4, rating = $5, sort_order = $6
       WHERE id = $7
       RETURNING *`,
      [name, role, image_url || null, review, parseInt(rating) || 5, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Review by '${name}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating testimonial review:', error);
    res.status(500).json({ success: false, message: 'Failed to update testimonial review.' });
  }
});

// DELETE /api/home/testimonials/reviews/:id (Protected - Delete Review)
router.delete('/testimonials/reviews/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM home_testimonials WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Review by '${result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting testimonial review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial review.' });
  }
});

/* ==========================================================================
   BLOG SECTION HEADERS ROUTES
   ========================================================================== */

// GET /api/home/blogs-settings (Public - Returns home_blogs_settings)
router.get('/blogs-settings', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_blogs_settings WHERE id = 1`);

    const defaultBlogsSettings = {
      tagline: 'BLOGS & NEWS',
      headline: 'Latest Insights',
      highlight_word: 'Insights',
      subtitle: 'News, technical engineering updates, and solar market innovations.',
    };

    res.status(200).json({
      success: true,
      data: settingsResult.rows[0] || defaultBlogsSettings,
    });
  } catch (error) {
    console.error('Error fetching blog section settings:', error);
    res.status(500).json({ success: false, message: 'Failed to load blog section configuration.' });
  }
});

// PUT /api/home/blogs-settings (Protected - Update Singleton Blog Settings)
router.put('/blogs-settings', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, subtitle } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_blogs_settings (id, tagline, headline, highlight_word, subtitle, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           subtitle = EXCLUDED.subtitle,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'BLOGS & NEWS',
        headline || 'Latest Insights',
        highlight_word || 'Insights',
        subtitle || 'News, technical engineering updates, and solar market innovations.',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Blog section settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating blog section settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update blog section settings.' });
  }
});

/* ==========================================================================
   FREE QUOTE (CTA) SECTION ROUTES
   ========================================================================== */

// GET /api/home/cta (Public - Returns home_cta_settings)
router.get('/cta', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM home_cta_settings WHERE id = 1`);

    const defaultCtaSettings = {
      tagline: 'Free Quote',
      headline: "Ready to go Solar? request for a quote today. It's free!",
      highlight_word: 'Solar',
      bg_image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2070&auto=format&fit=crop',
    };

    res.status(200).json({
      success: true,
      data: settingsResult.rows[0] || defaultCtaSettings,
    });
  } catch (error) {
    console.error('Error fetching CTA section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load free quote CTA configuration.' });
  }
});

// PUT /api/home/cta (Protected - Update Singleton CTA Settings)
router.put('/cta', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, bg_image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO home_cta_settings (id, tagline, headline, highlight_word, bg_image_url, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           bg_image_url = EXCLUDED.bg_image_url,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'Free Quote',
        headline || "Ready to go Solar? request for a quote today. It's free!",
        highlight_word || 'Solar',
        bg_image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2070&auto=format&fit=crop',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Free Quote CTA settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating CTA settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Free Quote CTA settings.' });
  }
});

export default router;
