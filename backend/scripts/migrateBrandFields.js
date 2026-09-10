import pool from '../config/db.js';

async function migrateBrandFields() {
  try {
    console.log('🌱 Adding badges and brand_highlights fields to brands table...');

    await pool.query(`
      ALTER TABLE brands ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';
      ALTER TABLE brands ADD COLUMN IF NOT EXISTS capabilities_tagline TEXT DEFAULT 'CORPORATE CAPABILITIES';
      ALTER TABLE brands ADD COLUMN IF NOT EXISTS capabilities_heading TEXT DEFAULT 'Brand Highlights';
      ALTER TABLE brands ADD COLUMN IF NOT EXISTS brand_highlights JSONB DEFAULT '[]';
      ALTER TABLE brands ADD COLUMN IF NOT EXISTS footer_note TEXT DEFAULT 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.';
    `);

    // Populate default badges and brand_highlights for existing brands if empty
    await pool.query(`
      UPDATE brands
      SET 
        badges = ARRAY['Tier-1 Listed', 'ALMM Approved', 'TÜV Certified', '25-Year Performance Warranty']
      WHERE badges IS NULL OR array_length(badges, 1) IS NULL;

      UPDATE brands
      SET
        capabilities_tagline = COALESCE(capabilities_tagline, 'CORPORATE CAPABILITIES'),
        capabilities_heading = COALESCE(capabilities_heading, 'Brand Highlights'),
        brand_highlights = CASE 
          WHEN brand_highlights IS NULL OR brand_highlights = '[]'::jsonb THEN '[
            {"title": "Tier-1 BloombergNEF", "subtitle": "Recognized Global PV Manufacturer"},
            {"title": "ALMM & BIS Approved", "subtitle": "MNRE Certified Module Supplier"},
            {"title": "22.8% Module Efficiency", "subtitle": "Ultra-High Power Density"},
            {"title": "25-Year Performance Warranty", "subtitle": "Linear Power Output Guarantee"}
          ]'::jsonb 
          ELSE brand_highlights 
        END,
        footer_note = COALESCE(footer_note, 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.');
    `);

    console.log('✅ Brands table migration complete!');
  } catch (err) {
    console.error('❌ Error migrating brand fields:', err);
  } finally {
    process.exit(0);
  }
}

migrateBrandFields();
