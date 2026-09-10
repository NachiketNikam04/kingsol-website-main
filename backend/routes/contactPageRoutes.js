import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auto-migrate tables and columns on module load
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_page_settings (
        id SERIAL PRIMARY KEY,
        hero_tagline VARCHAR(255) DEFAULT 'GET IN TOUCH',
        hero_headline TEXT DEFAULT 'Connect with Kingsol.',
        hero_highlight VARCHAR(100) DEFAULT 'Kingsol.',
        form_headline VARCHAR(255) DEFAULT 'Send us a message',
        form_subtitle TEXT DEFAULT 'Fill out the form below and our team will get back to you shortly.',
        form_success_msg TEXT DEFAULT 'Thank you for reaching out. An automated Email & WhatsApp alert has been sent to our admin team.',
        hq_tagline VARCHAR(255) DEFAULT 'GLOBAL HQ',
        hq_headline VARCHAR(255) DEFAULT 'Head Office Location',
        hq_highlight VARCHAR(100) DEFAULT 'Location',
        hq_address TEXT DEFAULT 'Third floor Shop. no. 326, Vardhaman Moonstone, Opposite to JSPM Tathawade, Pune.',
        hq_map_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.81745771891!2d73.7479708752074!3d18.627254582487445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e6f3df8ebf%3A0x889db4c803362a74!2sVardhaman%20Moonstone!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
        hq_hours VARCHAR(255) DEFAULT 'Mon - Sat: 10:00 AM - 6:00 PM',
        hq_certification VARCHAR(255) DEFAULT 'ISO 9001 Certified',
        infra_tagline VARCHAR(255) DEFAULT 'INFRASTRUCTURE & REACH',
        infra_headline VARCHAR(255) DEFAULT 'Nationwide Service Networks & Areas',
        infra_highlight VARCHAR(100) DEFAULT 'Networks',
        faq_tagline VARCHAR(255) DEFAULT 'FAQ',
        faq_headline VARCHAR(255) DEFAULT 'Frequently Asked Questions',
        quote_text TEXT DEFAULT '"Engineering a world where clean, renewable energy is the undisputed baseline for every home and industry."',
        quote_author VARCHAR(255) DEFAULT '— THE KINGSOL PROMISE',
        tagline VARCHAR(255) DEFAULT 'GET IN TOUCH',
        headline TEXT DEFAULT 'Let us engineer your clean energy future.',
        highlight_word VARCHAR(100) DEFAULT 'energy',
        subtitle TEXT DEFAULT 'Reach out to our B2B engineering and procurement team for utility-scale solar consultations, component inquiries, or technical support.',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_departments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        phone VARCHAR(100),
        email VARCHAR(255),
        whatsapp VARCHAR(100),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_infrastructure (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contact_faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO contact_page_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
    `);
  } catch (migErr) {
    console.warn('Notice ensuring contact page tables:', migErr.message);
  }
})();

const defaultSettings = {
  hero_tagline: 'GET IN TOUCH',
  hero_headline: 'Connect with Kingsol.',
  hero_highlight: 'Kingsol.',
  form_headline: 'Send us a message',
  form_subtitle: 'Fill out the form below and our team will get back to you shortly.',
  form_success_msg: 'Thank you for reaching out. An automated Email & WhatsApp alert has been sent to our admin team.',
  hq_tagline: 'GLOBAL HQ',
  hq_headline: 'Head Office Location',
  hq_highlight: 'Location',
  hq_address: 'Third floor Shop. no. 326, Vardhaman Moonstone, Opposite to JSPM Tathawade, Pune.',
  hq_map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.81745771891!2d73.7479708752074!3d18.627254582487445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e6f3df8ebf%3A0x889db4c803362a74!2sVardhaman%20Moonstone!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  hq_hours: 'Mon - Sat: 10:00 AM - 6:00 PM',
  hq_certification: 'ISO 9001 Certified',
  infra_tagline: 'INFRASTRUCTURE & REACH',
  infra_headline: 'Nationwide Service Networks & Areas',
  infra_highlight: 'Networks',
  faq_tagline: 'FAQ',
  faq_headline: 'Frequently Asked Questions',
  quote_text: '"Engineering a world where clean, renewable energy is the undisputed baseline for every home and industry."',
  quote_author: '— THE KINGSOL PROMISE',
  tagline: 'GET IN TOUCH',
  headline: 'Let us engineer your clean energy future.',
  highlight_word: 'energy',
  subtitle: 'Reach out to our B2B engineering and procurement team for utility-scale solar consultations, component inquiries, or technical support.',
};

// GET /api/contact-page/page & /api/contact-page/settings & /api/contact-page (Public)
const getContactPageData = async (req, res) => {
  try {
    let settingsData = { ...defaultSettings };
    try {
      const settingsRes = await pool.query('SELECT * FROM contact_page_settings WHERE id = 1');
      if (settingsRes.rows.length > 0) {
        settingsData = { ...defaultSettings, ...settingsRes.rows[0] };
      }
    } catch (sErr) {
      console.warn('Notice fetching contact_page_settings:', sErr.message);
    }

    let departments = [];
    try {
      const deptsRes = await pool.query('SELECT * FROM contact_departments ORDER BY sort_order ASC, id ASC');
      departments = deptsRes.rows || [];
    } catch (dErr) {
      console.warn('Notice fetching contact_departments:', dErr.message);
    }

    let infrastructure = [];
    try {
      const infraRes = await pool.query('SELECT * FROM contact_infrastructure ORDER BY sort_order ASC, id ASC');
      infrastructure = infraRes.rows || [];
    } catch (iErr) {
      console.warn('Notice fetching contact_infrastructure:', iErr.message);
    }

    let faqs = [];
    try {
      const faqsRes = await pool.query('SELECT * FROM contact_faqs ORDER BY sort_order ASC, id ASC');
      faqs = faqsRes.rows || [];
    } catch (fErr) {
      console.warn('Notice fetching contact_faqs:', fErr.message);
    }

    const payload = {
      settings: settingsData,
      departments,
      infrastructure,
      faqs,
    };

    res.status(200).json({
      success: true,
      data: payload,
      ...payload,
    });
  } catch (err) {
    console.error('Error fetching contact page data:', err);
    res.status(500).json({ success: false, message: 'Server error fetching contact page data' });
  }
};

// PUT /api/contact-page/settings & /api/contact-page/page (Protected)
const updateContactSettings = async (req, res) => {
  const {
    hero_tagline,
    hero_headline,
    hero_highlight,
    form_headline,
    form_subtitle,
    form_success_msg,
    hq_tagline,
    hq_headline,
    hq_highlight,
    hq_address,
    hq_map_url,
    hq_hours,
    hq_certification,
    infra_tagline,
    infra_headline,
    infra_highlight,
    faq_tagline,
    faq_headline,
    quote_text,
    quote_author,
    tagline,
    headline,
    highlight_word,
    subtitle,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO contact_page_settings (
         id,
         hero_tagline,
         hero_headline,
         hero_highlight,
         form_headline,
         form_subtitle,
         form_success_msg,
         hq_tagline,
         hq_headline,
         hq_highlight,
         hq_address,
         hq_map_url,
         hq_hours,
         hq_certification,
         infra_tagline,
         infra_headline,
         infra_highlight,
         faq_tagline,
         faq_headline,
         quote_text,
         quote_author,
         tagline,
         headline,
         highlight_word,
         subtitle,
         updated_at
       ) VALUES (
         1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW()
       )
       ON CONFLICT (id) DO UPDATE
       SET hero_tagline = COALESCE(EXCLUDED.hero_tagline, contact_page_settings.hero_tagline),
           hero_headline = COALESCE(EXCLUDED.hero_headline, contact_page_settings.hero_headline),
           hero_highlight = COALESCE(EXCLUDED.hero_highlight, contact_page_settings.hero_highlight),
           form_headline = COALESCE(EXCLUDED.form_headline, contact_page_settings.form_headline),
           form_subtitle = COALESCE(EXCLUDED.form_subtitle, contact_page_settings.form_subtitle),
           form_success_msg = COALESCE(EXCLUDED.form_success_msg, contact_page_settings.form_success_msg),
           hq_tagline = COALESCE(EXCLUDED.hq_tagline, contact_page_settings.hq_tagline),
           hq_headline = COALESCE(EXCLUDED.hq_headline, contact_page_settings.hq_headline),
           hq_highlight = COALESCE(EXCLUDED.hq_highlight, contact_page_settings.hq_highlight),
           hq_address = COALESCE(EXCLUDED.hq_address, contact_page_settings.hq_address),
           hq_map_url = COALESCE(EXCLUDED.hq_map_url, contact_page_settings.hq_map_url),
           hq_hours = COALESCE(EXCLUDED.hq_hours, contact_page_settings.hq_hours),
           hq_certification = COALESCE(EXCLUDED.hq_certification, contact_page_settings.hq_certification),
           infra_tagline = COALESCE(EXCLUDED.infra_tagline, contact_page_settings.infra_tagline),
           infra_headline = COALESCE(EXCLUDED.infra_headline, contact_page_settings.infra_headline),
           infra_highlight = COALESCE(EXCLUDED.infra_highlight, contact_page_settings.infra_highlight),
           faq_tagline = COALESCE(EXCLUDED.faq_tagline, contact_page_settings.faq_tagline),
           faq_headline = COALESCE(EXCLUDED.faq_headline, contact_page_settings.faq_headline),
           quote_text = COALESCE(EXCLUDED.quote_text, contact_page_settings.quote_text),
           quote_author = COALESCE(EXCLUDED.quote_author, contact_page_settings.quote_author),
           tagline = COALESCE(EXCLUDED.tagline, contact_page_settings.tagline),
           headline = COALESCE(EXCLUDED.headline, contact_page_settings.headline),
           highlight_word = COALESCE(EXCLUDED.highlight_word, contact_page_settings.highlight_word),
           subtitle = COALESCE(EXCLUDED.subtitle, contact_page_settings.subtitle),
           updated_at = NOW()
       RETURNING *`,
      [
        hero_tagline || tagline || defaultSettings.hero_tagline,
        hero_headline || headline || defaultSettings.hero_headline,
        hero_highlight || highlight_word || defaultSettings.hero_highlight,
        form_headline || defaultSettings.form_headline,
        form_subtitle || defaultSettings.form_subtitle,
        form_success_msg || defaultSettings.form_success_msg,
        hq_tagline || defaultSettings.hq_tagline,
        hq_headline || defaultSettings.hq_headline,
        hq_highlight || defaultSettings.hq_highlight,
        hq_address || defaultSettings.hq_address,
        hq_map_url || defaultSettings.hq_map_url,
        hq_hours || defaultSettings.hq_hours,
        hq_certification || defaultSettings.hq_certification,
        infra_tagline || defaultSettings.infra_tagline,
        infra_headline || defaultSettings.infra_headline,
        infra_highlight || defaultSettings.infra_highlight,
        faq_tagline || defaultSettings.faq_tagline,
        faq_headline || defaultSettings.faq_headline,
        quote_text || defaultSettings.quote_text,
        quote_author || defaultSettings.quote_author,
        tagline || hero_tagline || defaultSettings.tagline,
        headline || hero_headline || defaultSettings.headline,
        highlight_word || hero_highlight || defaultSettings.highlight_word,
        subtitle || defaultSettings.subtitle,
      ]
    );

    res.json({ success: true, data: result.rows[0], settings: result.rows[0] });
  } catch (err) {
    console.error('Error updating contact page settings:', err);
    res.status(500).json({ success: false, message: 'Server error updating contact settings' });
  }
};

/* ==========================================================================
   DEPARTMENT CRUD ROUTES
   ========================================================================== */
router.post('/departments', verifyToken, async (req, res) => {
  const { title, description, phone, email, whatsapp, sort_order } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Department title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_departments (title, description, phone, email, whatsapp, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || '', phone || '', email || '', whatsapp || '', sort_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ success: false, message: 'Failed to create department' });
  }
});

router.put('/departments/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, phone, email, whatsapp, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE contact_departments
       SET title = $1, description = $2, phone = $3, email = $4, whatsapp = $5, sort_order = $6
       WHERE id = $7
       RETURNING *`,
      [title, description || '', phone || '', email || '', whatsapp || '', sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating department:', err);
    res.status(500).json({ success: false, message: 'Failed to update department' });
  }
});

router.delete('/departments/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM contact_departments WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }
    res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    res.status(500).json({ success: false, message: 'Failed to delete department' });
  }
});

/* ==========================================================================
   INFRASTRUCTURE CRUD ROUTES
   ========================================================================== */
router.post('/infrastructure', verifyToken, async (req, res) => {
  const { title, description, sort_order } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Card title is required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_infrastructure (title, description, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description || '', sort_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating infrastructure card:', err);
    res.status(500).json({ success: false, message: 'Failed to create infrastructure card' });
  }
});

router.put('/infrastructure/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, description, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE contact_infrastructure
       SET title = $1, description = $2, sort_order = $3
       WHERE id = $4
       RETURNING *`,
      [title, description || '', sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Infrastructure card not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating infrastructure card:', err);
    res.status(500).json({ success: false, message: 'Failed to update infrastructure card' });
  }
});

router.delete('/infrastructure/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM contact_infrastructure WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Infrastructure card not found' });
    }
    res.json({ success: true, message: 'Infrastructure card deleted successfully' });
  } catch (err) {
    console.error('Error deleting infrastructure card:', err);
    res.status(500).json({ success: false, message: 'Failed to delete infrastructure card' });
  }
});

/* ==========================================================================
   FAQS CRUD ROUTES
   ========================================================================== */
router.post('/faqs', verifyToken, async (req, res) => {
  const { question, answer, sort_order } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ success: false, message: 'Question and Answer are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contact_faqs (question, answer, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [question, answer, sort_order || 0]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating FAQ:', err);
    res.status(500).json({ success: false, message: 'Failed to create FAQ' });
  }
});

router.put('/faqs/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { question, answer, sort_order } = req.body;

  try {
    const result = await pool.query(
      `UPDATE contact_faqs
       SET question = $1, answer = $2, sort_order = $3
       WHERE id = $4
       RETURNING *`,
      [question, answer, sort_order || 0, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating FAQ:', err);
    res.status(500).json({ success: false, message: 'Failed to update FAQ' });
  }
});

router.delete('/faqs/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`DELETE FROM contact_faqs WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (err) {
    console.error('Error deleting FAQ:', err);
    res.status(500).json({ success: false, message: 'Failed to delete FAQ' });
  }
});

// Page & Settings Route Aliases
router.get('/settings', getContactPageData);
router.get('/page', getContactPageData);
router.get('/', getContactPageData);

router.put('/settings', verifyToken, updateContactSettings);
router.put('/page', verifyToken, updateContactSettings);
router.put('/', verifyToken, updateContactSettings);

export default router;
