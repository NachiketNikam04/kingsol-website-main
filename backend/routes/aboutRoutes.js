import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auto-migrate Who We Are and About tables if not present
pool.query(`
  CREATE TABLE IF NOT EXISTS about_hero_settings (
    id INT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(255) DEFAULT 'ABOUT',
    headline TEXT DEFAULT 'A better way to deliver Clean energy',
    highlight_word VARCHAR(100) DEFAULT 'Clean',
    description TEXT DEFAULT 'Kingsol designs, installs, and supports high-performance solar and storage systems for homes, businesses, and large-scale projects.',
    image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  INSERT INTO about_hero_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

  CREATE TABLE IF NOT EXISTS about_who_we_are_settings (
    id INT PRIMARY KEY DEFAULT 1,
    tagline VARCHAR(255) DEFAULT 'WHO WE ARE',
    headline TEXT DEFAULT 'A solar company built on Clarity and accountability',
    highlight_word VARCHAR(100) DEFAULT 'Clarity',
    marquee_headline VARCHAR(255) DEFAULT 'Trusted by 30+ companies',
    marquee_highlight_word VARCHAR(100) DEFAULT '30+',
    image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  INSERT INTO about_who_we_are_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

  CREATE TABLE IF NOT EXISTS about_who_we_are_accordions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`).catch((err) => console.warn('About schema auto-migration notice:', err.message));

/* ==========================================================================
   ABOUT PAGE HERO SECTION ROUTES
   ========================================================================== */

// GET /api/about/hero (Public - Returns about_hero_settings)
router.get('/hero', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM about_hero_settings WHERE id = 1`);

    const defaultAboutHeroSettings = {
      tagline: 'ABOUT',
      headline: 'A better way to deliver Clean energy',
      highlight_word: 'Clean',
      description: 'Kingsol designs, installs, and supports high-performance solar and storage systems for homes, businesses, and large-scale projects. Our work is grounded in engineering rigor, transparency, and a commitment to long-term performance.',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    };

    res.status(200).json({
      success: true,
      data: (result.rows && result.rows.length > 0) ? result.rows[0] : defaultAboutHeroSettings,
    });
  } catch (error) {
    console.error('Error fetching about hero section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load About Us page hero configuration.' });
  }
});

// PUT /api/about/hero (Protected - Update Singleton About Hero Settings)
router.put('/hero', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, description, image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO about_hero_settings (id, tagline, headline, highlight_word, description, image_url, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           description = EXCLUDED.description,
           image_url = EXCLUDED.image_url,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'ABOUT',
        headline || 'A better way to deliver Clean energy',
        highlight_word || 'Clean',
        description || 'Kingsol designs, installs, and supports high-performance solar...',
        image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'About page hero settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating about hero settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update About Us page hero settings.' });
  }
});

/* ==========================================================================
   ABOUT PAGE WHO WE ARE SECTION ROUTES
   ========================================================================== */

// GET /api/about/who-we-are (Public - Returns settings, accordions, and partner logos)
router.get('/who-we-are', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM about_who_we_are_settings WHERE id = 1`);
    
    let accordionsRows = [];
    try {
      const accordionsResult = await pool.query(
        `SELECT * FROM about_who_we_are_accordions ORDER BY sort_order ASC, id ASC`
      );
      accordionsRows = accordionsResult.rows || [];
    } catch (accErr) {
      console.warn('Notice fetching about_who_we_are_accordions:', accErr.message);
    }

    let logosRows = [];
    try {
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
      logosRows = logosResult.rows || [];
    } catch (logoErr) {
      console.warn('Notice fetching home_partners_logos in who-we-are:', logoErr.message);
    }

    const defaultSettings = {
      tagline: 'WHO WE ARE',
      headline: 'A solar company built on Clarity and accountability',
      highlight_word: 'Clarity',
      marquee_headline: 'Trusted by 30+ companies',
      marquee_highlight_word: '30+',
      image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop',
    };

    const settingsData = (settingsResult.rows && settingsResult.rows.length > 0)
      ? settingsResult.rows[0]
      : defaultSettings;

    res.status(200).json({
      success: true,
      data: {
        settings: settingsData,
        accordions: accordionsRows,
        logos: logosRows,
      },
    });
  } catch (error) {
    console.error('Error in who-we-are route:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch data' });
  }
});

// PUT /api/about/who-we-are (Protected - Update Singleton Who We Are Settings)
router.put('/who-we-are', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, marquee_headline, marquee_highlight_word, image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO about_who_we_are_settings (id, tagline, headline, highlight_word, marquee_headline, marquee_highlight_word, image_url, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           marquee_headline = EXCLUDED.marquee_headline,
           marquee_highlight_word = EXCLUDED.marquee_highlight_word,
           image_url = EXCLUDED.image_url,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'WHO WE ARE',
        headline || 'A solar company built on Clarity and accountability',
        highlight_word || 'Clarity',
        marquee_headline || 'Trusted by 30+ companies',
        marquee_highlight_word || '30+',
        image_url || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Who We Are settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Who We Are settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Who We Are settings.' });
  }
});

// POST /api/about/who-we-are/accordions (Protected - Add Accordion Item)
router.post('/who-we-are/accordions', verifyToken, async (req, res) => {
  const { title, content, sort_order } = req.body;

  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO about_who_we_are_accordions (title, content, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, content, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: `Accordion '${title}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating accordion:', error);
    res.status(500).json({ success: false, message: 'Failed to create accordion item.' });
  }
});

// PUT /api/about/who-we-are/accordions/:id (Protected - Update Accordion Item)
router.put('/who-we-are/accordions/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE about_who_we_are_accordions
       SET title = $1, content = $2, sort_order = $3
       WHERE id = $4
       RETURNING *`,
      [title, content, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Accordion item not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Accordion '${title}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating accordion:', error);
    res.status(500).json({ success: false, message: 'Failed to update accordion item.' });
  }
});

// DELETE /api/about/who-we-are/accordions/:id (Protected - Delete Accordion Item)
router.delete('/who-we-are/accordions/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM about_who_we_are_accordions WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Accordion item not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Accordion '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting accordion:', error);
    res.status(500).json({ success: false, message: 'Failed to delete accordion item.' });
  }
});

/* ==========================================================================
   ABOUT PAGE FOUNDATION SECTION ROUTES
   ========================================================================== */

// GET /api/about/foundation (Public - Returns foundation settings and values)
router.get('/foundation', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM about_foundation_settings WHERE id = 1`);
    const valuesResult = await pool.query(`SELECT * FROM about_foundation_values ORDER BY sort_order ASC, id ASC`);

    const defaultSettings = {
      tagline: 'THE FOUNDATION',
      headline: 'What drives Kingsol forward.',
      highlight_word: 'Kingsol',
      vision_title: 'Our Vision',
      vision_description: 'To engineer a world where clean, renewable energy is the undisputed baseline for every home and industry.',
      mission_title: 'Our Mission',
      mission_description: 'To deliver flawlessly designed solar architectures that maximize grid independence and financial returns for our clients.',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultSettings,
        values: valuesResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching Foundation section data:', error);
    res.status(500).json({ success: false, message: 'Failed to load Foundation configuration.' });
  }
});

// PUT /api/about/foundation (Protected - Update Singleton Foundation Settings)
router.put('/foundation', verifyToken, async (req, res) => {
  const {
    tagline,
    headline,
    highlight_word,
    vision_title,
    vision_description,
    mission_title,
    mission_description,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO about_foundation_settings (id, tagline, headline, highlight_word, vision_title, vision_description, mission_title, mission_description, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           vision_title = EXCLUDED.vision_title,
           vision_description = EXCLUDED.vision_description,
           mission_title = EXCLUDED.mission_title,
           mission_description = EXCLUDED.mission_description,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'THE FOUNDATION',
        headline || 'What drives Kingsol forward.',
        highlight_word || 'Kingsol',
        vision_title || 'Our Vision',
        vision_description || 'To engineer a world where clean, renewable energy...',
        mission_title || 'Our Mission',
        mission_description || 'To deliver flawlessly designed solar architectures...',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Foundation section settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Foundation settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Foundation settings.' });
  }
});

// POST /api/about/foundation/values (Protected - Add Value Card)
router.post('/foundation/values', verifyToken, async (req, res) => {
  const { title, description, sort_order } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO about_foundation_values (title, description, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, sort_order || 0]
    );

    res.status(201).json({
      success: true,
      message: `Value card '${title}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating value card:', error);
    res.status(500).json({ success: false, message: 'Failed to create value card.' });
  }
});

// PUT /api/about/foundation/values/:id (Protected - Update Value Card)
router.put('/foundation/values/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE about_foundation_values
       SET title = $1, description = $2, sort_order = $3
       WHERE id = $4
       RETURNING *`,
      [title, description, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Value card not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Value card '${title}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating value card:', error);
    res.status(500).json({ success: false, message: 'Failed to update value card.' });
  }
});

// DELETE /api/about/foundation/values/:id (Protected - Delete Value Card)
router.delete('/foundation/values/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM about_foundation_values WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Value card not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Value card '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting value card:', error);
    res.status(500).json({ success: false, message: 'Failed to delete value card.' });
  }
});

/* ==========================================================================
   ABOUT PAGE CAREERS CTA SECTION ROUTES
   ========================================================================== */

// GET /api/about/careers-cta (Public - Returns singleton about_careers_cta_settings)
router.get('/careers-cta', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM about_careers_cta_settings WHERE id = 1`);

    const defaultCareersCtaSettings = {
      tagline: "WE'RE GROWING OUR TEAM",
      headline: 'Explore current Openings and find your place at Kingsol.',
      highlight_word: 'Openings',
      bg_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    };

    res.status(200).json({
      success: true,
      data: result.rows[0] || defaultCareersCtaSettings,
    });
  } catch (error) {
    console.error('Error fetching About page Careers CTA settings:', error);
    res.status(500).json({ success: false, message: 'Failed to load Careers CTA configuration.' });
  }
});

// PUT /api/about/careers-cta (Protected - Update Singleton About Careers CTA Settings)
router.put('/careers-cta', verifyToken, async (req, res) => {
  const { tagline, headline, highlight_word, bg_image_url } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO about_careers_cta_settings (id, tagline, headline, highlight_word, bg_image_url, updated_at)
       VALUES (1, $1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           bg_image_url = EXCLUDED.bg_image_url,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || "WE'RE GROWING OUR TEAM",
        headline || 'Explore current Openings and find your place at Kingsol.',
        highlight_word || 'Openings',
        bg_image_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Careers CTA section settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Careers CTA settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Careers CTA settings.' });
  }
});

/* ==========================================================================
   ABOUT PAGE WAREHOUSE PRESENCE SECTION ROUTES
   ========================================================================== */

// Helper to ensure about_warehouse_settings table exists
const ensureWarehouseTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS about_warehouse_settings (
      id SERIAL PRIMARY KEY,
      tagline VARCHAR(255) DEFAULT 'PAN-INDIA PRESENCE',
      headline TEXT DEFAULT 'Strategic warehousing across High-demand renewable corridors.',
      highlight_word VARCHAR(100) DEFAULT 'High-demand',
      description TEXT DEFAULT 'To guarantee rapid dispatch and zero transit bottlenecks, Kingsol maintains strategically positioned regional fulfillment hubs stocked with Tier-1 modules, inverters, and BOS infrastructure.',
      map_image_url TEXT DEFAULT '/uploads/india-warehouse-map.jpg',
      locations JSONB DEFAULT '["Bhiwandi, Maharashtra", "Ahmedabad, Gujarat", "Bengaluru, Karnataka", "Chennai, Tamil Nadu", "Jaipur, Rajasthan", "Kolkata, West Bengal", "Hyderabad, Telangana", "Noida, Delhi NCR"]'::jsonb,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// GET /api/about/warehouse (Public - Returns singleton about_warehouse_settings)
router.get('/warehouse', async (req, res) => {
  try {
    await ensureWarehouseTable();
    const result = await pool.query(`SELECT * FROM about_warehouse_settings WHERE id = 1`);

    const defaultWarehouseSettings = {
      tagline: 'PAN-INDIA PRESENCE',
      headline: 'Strategic warehousing across High-demand renewable corridors.',
      highlight_word: 'High-demand',
      description: 'To guarantee rapid dispatch and zero transit bottlenecks, Kingsol maintains strategically positioned regional fulfillment hubs stocked with Tier-1 modules, inverters, and BOS infrastructure.',
      map_image_url: '/uploads/india-warehouse-map.jpg',
      locations: [
        'Bhiwandi, Maharashtra',
        'Ahmedabad, Gujarat',
        'Bengaluru, Karnataka',
        'Chennai, Tamil Nadu',
        'Jaipur, Rajasthan',
        'Kolkata, West Bengal',
        'Hyderabad, Telangana',
        'Noida, Delhi NCR',
      ],
    };

    const row = result.rows[0] || defaultWarehouseSettings;
    const locations = Array.isArray(row.locations) ? row.locations : (typeof row.locations === 'string' ? JSON.parse(row.locations) : defaultWarehouseSettings.locations);

    res.status(200).json({
      success: true,
      data: {
        id: row.id || 1,
        tagline: row.tagline,
        headline: row.headline,
        highlight_word: row.highlight_word,
        description: row.description,
        map_image_url: row.map_image_url,
        locations: locations,
        warehouseTagline: row.tagline,
        warehouseHeadline: row.headline,
        warehouseHighlightWord: row.highlight_word,
        warehouseDescription: row.description,
        warehouseMapImage: row.map_image_url,
        warehouseLocations: locations,
      },
    });
  } catch (error) {
    console.error('Error fetching About page Warehouse settings:', error);
    res.status(500).json({ success: false, message: 'Failed to load Warehouse configuration.' });
  }
});

// PUT /api/about/warehouse (Protected - Update Singleton About Warehouse Settings)
router.put('/warehouse', verifyToken, async (req, res) => {
  const {
    tagline,
    headline,
    highlight_word,
    description,
    map_image_url,
    locations,
    warehouseTagline,
    warehouseHeadline,
    warehouseHighlightWord,
    warehouseDescription,
    warehouseMapImage,
    warehouseLocations,
  } = req.body;

  const finalTagline = warehouseTagline || tagline || 'PAN-INDIA PRESENCE';
  const finalHeadline = warehouseHeadline || headline || 'Strategic warehousing across High-demand renewable corridors.';
  const finalHighlightWord = warehouseHighlightWord || highlight_word || 'High-demand';
  const finalDescription = warehouseDescription || description || 'To guarantee rapid dispatch and zero transit bottlenecks, Kingsol maintains strategically positioned regional fulfillment hubs stocked with Tier-1 modules, inverters, and BOS infrastructure.';
  const finalMapImage = warehouseMapImage || map_image_url || '/uploads/india-warehouse-map.jpg';
  const rawLocations = warehouseLocations || locations || [];
  const finalLocations = Array.isArray(rawLocations) ? JSON.stringify(rawLocations) : (typeof rawLocations === 'string' ? rawLocations : '[]');

  try {
    await ensureWarehouseTable();
    const result = await pool.query(
      `INSERT INTO about_warehouse_settings (id, tagline, headline, highlight_word, description, map_image_url, locations, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6::jsonb, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           description = EXCLUDED.description,
           map_image_url = EXCLUDED.map_image_url,
           locations = EXCLUDED.locations,
           updated_at = NOW()
       RETURNING *`,
      [finalTagline, finalHeadline, finalHighlightWord, finalDescription, finalMapImage, finalLocations]
    );

    const row = result.rows[0];
    const parsedLocations = Array.isArray(row.locations) ? row.locations : (typeof row.locations === 'string' ? JSON.parse(row.locations) : []);

    res.status(200).json({
      success: true,
      message: 'Warehouse section settings updated successfully.',
      data: {
        id: row.id,
        tagline: row.tagline,
        headline: row.headline,
        highlight_word: row.highlight_word,
        description: row.description,
        map_image_url: row.map_image_url,
        locations: parsedLocations,
        warehouseTagline: row.tagline,
        warehouseHeadline: row.headline,
        warehouseHighlightWord: row.highlight_word,
        warehouseDescription: row.description,
        warehouseMapImage: row.map_image_url,
        warehouseLocations: parsedLocations,
      },
    });
  } catch (error) {
    console.error('Error updating Warehouse settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Warehouse settings.' });
  }
});

export default router;
