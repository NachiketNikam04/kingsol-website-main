import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/* ==========================================================================
   CAREERS PAGE CONFIGURATION & JOBS LISTING ROUTES
   ========================================================================== */

// GET /api/careers/page (Public - Returns careers page settings and all active job listings)
router.get('/page', async (req, res) => {
  try {
    const settingsResult = await pool.query(`SELECT * FROM careers_page_settings WHERE id = 1`);
    const jobsResult = await pool.query(`SELECT * FROM job_listings ORDER BY sort_order ASC, id ASC`);

    const defaultSettings = {
      tagline: 'CAREERS',
      headline: 'Help build a cleaner, brighter energy future.',
      highlight_word: 'brighter',
      hero_bg_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
      positions_title: 'Open Positions',
      positions_subtitle: 'Join us in engineering the future of solar.',
      gen_tagline: 'General Application',
      gen_headline: "Don't see your specific tech stack?",
      gen_description: "We are always looking for exceptional talent to join our team. If your expertise isn't listed in our open roles, send your details directly to our recruitment team and we'll reach out if a position opens up.",
      disclaimer_title: 'Important Note:',
      disclaimer_text: 'Kingsol will never ask for any recruitment fees, security deposits, or financial payments from candidates at any stage of the hiring process.',
    };

    res.status(200).json({
      success: true,
      data: {
        settings: settingsResult.rows[0] || defaultSettings,
        jobs: jobsResult.rows || [],
      },
    });
  } catch (error) {
    console.error('Error fetching Careers page data:', error);
    res.status(500).json({ success: false, message: 'Failed to load Careers page data.' });
  }
});

// PUT /api/careers/page (Protected - Update Singleton Careers Page Settings)
router.put('/page', verifyToken, async (req, res) => {
  const {
    tagline,
    headline,
    highlight_word,
    hero_bg_image_url,
    positions_title,
    positions_subtitle,
    gen_tagline,
    gen_headline,
    gen_description,
    disclaimer_title,
    disclaimer_text,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO careers_page_settings (id, tagline, headline, highlight_word, hero_bg_image_url, positions_title, positions_subtitle, gen_tagline, gen_headline, gen_description, disclaimer_title, disclaimer_text, updated_at)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
       ON CONFLICT (id) DO UPDATE
       SET tagline = EXCLUDED.tagline,
           headline = EXCLUDED.headline,
           highlight_word = EXCLUDED.highlight_word,
           hero_bg_image_url = EXCLUDED.hero_bg_image_url,
           positions_title = EXCLUDED.positions_title,
           positions_subtitle = EXCLUDED.positions_subtitle,
           gen_tagline = EXCLUDED.gen_tagline,
           gen_headline = EXCLUDED.gen_headline,
           gen_description = EXCLUDED.gen_description,
           disclaimer_title = EXCLUDED.disclaimer_title,
           disclaimer_text = EXCLUDED.disclaimer_text,
           updated_at = NOW()
       RETURNING *`,
      [
        tagline || 'CAREERS',
        headline || 'Help build a cleaner, brighter energy future.',
        highlight_word || 'brighter',
        hero_bg_image_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
        positions_title || 'Open Positions',
        positions_subtitle || 'Join us in engineering the future of solar.',
        gen_tagline || 'General Application',
        gen_headline || "Don't see your specific tech stack?",
        gen_description || 'We are always looking for exceptional talent to join our team...',
        disclaimer_title || 'Important Note:',
        disclaimer_text || 'Kingsol will never ask for any recruitment fees...',
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Careers page settings updated successfully.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating Careers page settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update Careers page settings.' });
  }
});

/* ==========================================================================
   INDIVIDUAL JOB OPENINGS ROUTES
   ========================================================================== */

// GET /api/careers/jobs/:slug (Public - Fetch a single job by slug)
router.get('/jobs/:slug', async (req, res) => {
  const { slug } = req.params;
  try {
    const result = await pool.query(`SELECT * FROM job_listings WHERE slug = $1`, [slug]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job listing not found.' });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching job details by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to load job details.' });
  }
});

// POST /api/careers/jobs (Protected - Create a new job opening)
router.post('/jobs', verifyToken, async (req, res) => {
  const {
    title,
    slug,
    department,
    location,
    type,
    experience,
    posted_date,
    overview,
    responsibilities,
    requirements,
    sort_order,
  } = req.body;

  if (!title || !department || !location || !overview) {
    return res.status(400).json({ success: false, message: 'Title, department, location, and overview are required.' });
  }

  const generateSlug = (str) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const jobSlug = slug || generateSlug(title);

  try {
    const result = await pool.query(
      `INSERT INTO job_listings (title, slug, department, location, type, experience, posted_date, overview, responsibilities, requirements, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        jobSlug,
        department,
        location,
        type || 'Full-time',
        experience || '2+ Years',
        posted_date || 'Recently Posted',
        overview,
        responsibilities || [],
        requirements || [],
        sort_order || 0,
      ]
    );

    res.status(201).json({
      success: true,
      message: `Job opening '${title}' created successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating job opening:', error);
    res.status(500).json({ success: false, message: 'Failed to create job opening.' });
  }
});

// PUT /api/careers/jobs/:id (Protected - Update an existing job opening)
router.put('/jobs/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    department,
    location,
    type,
    experience,
    posted_date,
    overview,
    responsibilities,
    requirements,
    sort_order,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE job_listings
       SET title = $1,
           slug = $2,
           department = $3,
           location = $4,
           type = $5,
           experience = $6,
           posted_date = $7,
           overview = $8,
           responsibilities = $9,
           requirements = $10,
           sort_order = $11
       WHERE id = $12
       RETURNING *`,
      [
        title,
        slug,
        department,
        location,
        type || 'Full-time',
        experience || '2+ Years',
        posted_date || 'Recently Posted',
        overview,
        responsibilities || [],
        requirements || [],
        sort_order || 0,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job opening not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Job opening '${title}' updated successfully.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating job opening:', error);
    res.status(500).json({ success: false, message: 'Failed to update job opening.' });
  }
});

// DELETE /api/careers/jobs/:id (Protected - Delete a job opening)
router.delete('/jobs/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM job_listings WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job opening not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Job opening '${result.rows[0].title}' deleted successfully.`,
    });
  } catch (error) {
    console.error('Error deleting job opening:', error);
    res.status(500).json({ success: false, message: 'Failed to delete job opening.' });
  }
});

export default router;
