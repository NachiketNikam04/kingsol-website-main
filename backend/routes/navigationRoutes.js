import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

/* ==========================================================================
   PUBLIC NAVIGATION MENU API
   ========================================================================== */

// GET /api/navigation/menu (Public - Returns nested categories, brands, subcategories & services)
router.get('/menu', async (req, res) => {
  try {
    // 1. Fetch Categories
    const catResult = await pool.query(
      `SELECT id, name, slug FROM categories ORDER BY id ASC`
    );
    const categories = catResult.rows;

    // 2. Fetch Brands with category_id
    const brandResult = await pool.query(
      `SELECT id, category_id, name, slug FROM brands ORDER BY id ASC`
    );
    const brands = brandResult.rows;

    // 3. Fetch Subcategories with brand_id/category_id
    const subResult = await pool.query(
      `SELECT id, category_id, brand_id, name, slug FROM subcategories ORDER BY id ASC`
    );
    const subcategories = subResult.rows;

    // 4. Fetch Products and BESS items with brand_id and subcategory_id
    let bessRows = [];
    try {
      const bessResult = await pool.query(
        `SELECT id, category_id, brand_id, subcategory_id, title, name, slug FROM bess ORDER BY id ASC`
      );
      bessRows = bessResult.rows;
    } catch {
      bessRows = [];
    }

    const prodResult = await pool.query(
      `SELECT id, category_id, brand_id, subcategory_id, title, name, slug FROM products ORDER BY id ASC`
    );
    const products = [...prodResult.rows, ...bessRows];

    // Build Nested Tree: Category -> Brands -> Products / Subcategories
    const productCategories = categories.map((cat) => {
      const catBrands = brands
        .filter((b) => b.category_id === cat.id)
        .map((b) => {
          const brandProducts = products.filter((p) => p.brand_id === b.id);

          // Get ONLY subcategories of products that ACTUALLY exist for this brand in the database
          const uniqueSubcatMap = new Map();
          brandProducts.forEach((p) => {
            if (p.subcategory_id) {
              const matchedSub = subcategories.find((s) => s.id === p.subcategory_id);
              if (matchedSub) {
                const key = (matchedSub.name || matchedSub.slug || '').trim().toLowerCase();
                if (key && !uniqueSubcatMap.has(key)) {
                  uniqueSubcatMap.set(key, {
                    id: matchedSub.id,
                    name: matchedSub.name,
                    slug: matchedSub.slug,
                  });
                }
              }
            }
          });
          const brandSubcategories = Array.from(uniqueSubcatMap.values());

          return {
            id: b.id,
            name: b.name,
            slug: b.slug,
            products: brandProducts.map((p) => ({
              id: p.id,
              name: p.title || p.name,
              slug: p.slug,
            })),
            subcategories: brandSubcategories,
          };
        });

      return {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        brands: catBrands,
      };
    });

    // 4. Fetch Services directly from database services table
    const servicesResult = await pool.query(
      `SELECT title, slug FROM services ORDER BY sort_order ASC, id ASC`
    );

    const dbServices = servicesResult.rows;

    const defaultServices = [
      { title: 'Solar panel cleaning services', slug: 'solar-panel-cleaning' },
      { title: 'Off-grid solar installation', slug: 'off-grid-installation' },
      { title: 'Solar inverter repair services', slug: 'solar-inverter-repair' },
      { title: 'Solar system maintenance', slug: 'solar-system-maintenance' },
      { title: 'Wind turbine repair services', slug: 'wind-turbine-repair' },
      { title: 'Rooftop solar panel installation', slug: 'rooftop-solar-installation' },
    ];

    res.status(200).json({
      success: true,
      data: {
        productCategories: productCategories || [],
        services: dbServices.length > 0 ? dbServices : defaultServices,
      },
    });
  } catch (error) {
    console.error('Error building navigation menu:', error);
    res.status(500).json({ success: false, message: 'Failed to build navigation menu.' });
  }
});

export default router;
