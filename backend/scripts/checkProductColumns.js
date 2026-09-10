import pool from '../config/db.js';

async function checkColumns() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `);
    console.log('📋 Columns in products table:');
    console.log(res.rows.map(r => r.column_name).join(', '));
    process.exit(0);
  } catch (err) {
    console.error('Error checking columns:', err);
    process.exit(1);
  }
}

checkColumns();
