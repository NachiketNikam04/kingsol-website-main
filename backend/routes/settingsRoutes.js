import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auto-migrate site_settings table and seed row if not exists
pool.query(`
  CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    show_services BOOLEAN DEFAULT false,
    show_videos BOOLEAN DEFAULT false,
    show_bess BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS show_bess BOOLEAN DEFAULT true;
  INSERT INTO site_settings (id, show_services, show_videos, show_bess)
  VALUES (1, false, false, true)
  ON CONFLICT (id) DO NOTHING;
`).catch((err) => console.warn('Site settings auto-migration notice:', err.message));

// GET /api/settings/features (Public - Fetch navigation feature toggles)
router.get('/features', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT show_services, show_videos, COALESCE(show_bess, true) AS show_bess FROM site_settings WHERE id = 1 LIMIT 1`
    );

    let data = { show_services: false, show_videos: false, show_bess: true };
    if (result.rows.length > 0) {
      data = {
        show_services: Boolean(result.rows[0].show_services),
        show_videos: Boolean(result.rows[0].show_videos),
        show_bess: result.rows[0].show_bess === null ? true : Boolean(result.rows[0].show_bess),
      };
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching feature settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feature settings.',
    });
  }
});

// PUT /api/settings/features (Protected - Update feature toggles)
router.put('/features', verifyToken, async (req, res) => {
  const { show_services, show_videos, show_bess } = req.body;

  try {
    const isServices = show_services === true || show_services === 'true';
    const isVideos = show_videos === true || show_videos === 'true';
    const isBess = show_bess === undefined ? true : (show_bess === true || show_bess === 'true');

    const result = await pool.query(
      `INSERT INTO site_settings (id, show_services, show_videos, show_bess, updated_at)
       VALUES (1, $1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         show_services = EXCLUDED.show_services,
         show_videos = EXCLUDED.show_videos,
         show_bess = EXCLUDED.show_bess,
         updated_at = CURRENT_TIMESTAMP
       RETURNING show_services, show_videos, show_bess, updated_at`,
      [isServices, isVideos, isBess]
    );

    res.status(200).json({
      success: true,
      message: 'Feature toggles updated successfully.',
      data: {
        show_services: Boolean(result.rows[0].show_services),
        show_videos: Boolean(result.rows[0].show_videos),
        show_bess: Boolean(result.rows[0].show_bess),
      },
    });
  } catch (error) {
    console.error('Error updating feature settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature settings.',
    });
  }
});

export default router;
