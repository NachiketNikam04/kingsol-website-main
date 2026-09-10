import pool from '../config/db.js';

async function checkBrandColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'brands';
    `);
    console.log('📋 Columns in brands table:');
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
    process.exit(0);
  } catch (err) {
    console.error('Error checking brand columns:', err);
    process.exit(1);
  }
}

checkBrandColumns();
