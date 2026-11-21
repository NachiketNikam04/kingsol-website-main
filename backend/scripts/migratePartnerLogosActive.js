import pool from '../config/db.js';

async function migratePartnerLogosActive() {
  try {
    console.log('🌱 Adding is_active column to home_partners_logos table...');

    await pool.query(`
      ALTER TABLE home_partners_logos ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      UPDATE home_partners_logos SET is_active = TRUE WHERE is_active IS NULL;
    `);

    console.log('✅ home_partners_logos table migration complete (is_active column added)!');
  } catch (err) {
    console.error('❌ Error migrating partner logos fields:', err.message);
  } finally {
    process.exit(0);
  }
}

migratePartnerLogosActive();
