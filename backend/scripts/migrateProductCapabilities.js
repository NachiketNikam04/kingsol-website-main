import pool from '../config/db.js';

async function migrateProductCapabilities() {
  console.log('🚀 Migrating products table columns for capabilities & highlights...');
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS capabilities_tagline TEXT,
      ADD COLUMN IF NOT EXISTS capabilities_heading TEXT,
      ADD COLUMN IF NOT EXISTS brand_highlights JSONB,
      ADD COLUMN IF NOT EXISTS footer_note TEXT;
    `);
    console.log('✅ Added capabilities_tagline, capabilities_heading, brand_highlights, footer_note columns to products table!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateProductCapabilities();
