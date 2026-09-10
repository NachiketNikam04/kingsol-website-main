import pool from '../config/db.js';

function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fixAllSlugs() {
  console.log('🚀 Starting retroactive database slug migration...');

  try {
    // 1. Fix Categories
    const categories = await pool.query(`SELECT id, name, slug FROM categories`);
    for (const cat of categories.rows) {
      const newSlug = slugify(cat.name);
      await pool.query(`UPDATE categories SET slug = $1 WHERE id = $2`, [newSlug, cat.id]);
      console.log(`✅ Category [ID ${cat.id}]: '${cat.name}' -> slug: '${newSlug}'`);
    }

    // 2. Fix Brands
    const brands = await pool.query(`SELECT id, name, slug FROM brands`);
    for (const brand of brands.rows) {
      const newSlug = slugify(brand.name);
      await pool.query(`UPDATE brands SET slug = $1 WHERE id = $2`, [newSlug, brand.id]);
      console.log(`✅ Brand [ID ${brand.id}]: '${brand.name}' -> slug: '${newSlug}'`);
    }

    // 3. Fix Subcategories
    const subcategories = await pool.query(`SELECT id, name, slug FROM subcategories`);
    for (const sub of subcategories.rows) {
      const newSlug = slugify(sub.name);
      await pool.query(`UPDATE subcategories SET slug = $1 WHERE id = $2`, [newSlug, sub.id]);
      console.log(`✅ Subcategory [ID ${sub.id}]: '${sub.name}' -> slug: '${newSlug}'`);
    }

    // 4. Fix Products
    const products = await pool.query(`SELECT id, title, name, slug FROM products`);
    for (const prod of products.rows) {
      const nameToUse = prod.title || prod.name || `product-${prod.id}`;
      const newSlug = slugify(nameToUse);
      await pool.query(`UPDATE products SET slug = $1 WHERE id = $2`, [newSlug, prod.id]);
      console.log(`✅ Product [ID ${prod.id}]: '${nameToUse}' -> slug: '${newSlug}'`);
    }

    console.log('🎉 Retroactive slug migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixAllSlugs();
