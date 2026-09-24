import express from 'express';
import pool from '../config/db.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/dashboard-stats (Protected)
router.get('/dashboard-stats', verifyToken, async (req, res) => {
  try {
    const [inquiriesRes, appsRes, brandsRes, productsRes, quotesRes] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*)::int as total_inquiries,
          COUNT(CASE WHEN is_read = false THEN 1 END)::int as unread_inquiries
        FROM contact_inquiries
      `).catch(() => ({ rows: [{ total_inquiries: 0, unread_inquiries: 0 }] })),

      pool.query(`
        SELECT 
          COUNT(*)::int as total_applications,
          COUNT(CASE WHEN is_read = false THEN 1 END)::int as unread_applications
        FROM job_applications
      `).catch(() => ({ rows: [{ total_applications: 0, unread_applications: 0 }] })),

      pool.query(`SELECT COUNT(*)::int as total_brands FROM brands`).catch(() => ({ rows: [{ total_brands: 0 }] })),
      pool.query(`SELECT COUNT(*)::int as total_products FROM products`).catch(() => ({ rows: [{ total_products: 0 }] })),

      pool.query(`
        SELECT 
          COUNT(*)::int as total_quotes,
          COUNT(CASE WHEN status = 'New' OR status IS NULL THEN 1 END)::int as unread_quotes
        FROM quotes
      `).catch(() => ({ rows: [{ total_quotes: 0, unread_quotes: 0 }] })),
    ]);

    const stats = {
      totalInquiries: inquiriesRes.rows[0]?.total_inquiries || 0,
      unreadInquiries: inquiriesRes.rows[0]?.unread_inquiries || 0,
      totalApplications: appsRes.rows[0]?.total_applications || 0,
      unreadApplications: appsRes.rows[0]?.unread_applications || 0,
      totalBrands: brandsRes.rows[0]?.total_brands || 0,
      totalProducts: productsRes.rows[0]?.total_products || 0,
      totalQuotes: quotesRes.rows[0]?.total_quotes || 0,
      unreadQuotes: quotesRes.rows[0]?.unread_quotes || 0,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard analytics.',
    });
  }
});

export default router;
