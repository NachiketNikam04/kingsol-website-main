import pool from '../config/db.js';

async function checkDatabaseForLocalhost() {
  try {
    const tablesRes = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND data_type IN ('text', 'character varying', 'json', 'jsonb', 'ARRAY');
    `);

    console.log(`Checking ${tablesRes.rows.length} columns across public tables...`);

    for (const row of tablesRes.rows) {
      const { table_name, column_name, data_type } = row;
      try {
        if (data_type === 'text' || data_type === 'character varying') {
          const res = await pool.query(`
            SELECT id, "${column_name}" 
            FROM "${table_name}" 
            WHERE "${column_name}" LIKE '%localhost:5000%' 
            LIMIT 5;
          `);
          if (res.rows.length > 0) {
            console.log(`\n🔴 Found in Table: ${table_name}, Column: ${column_name} (${res.rows.length} sample rows):`);
            res.rows.forEach(r => console.log(`   ID: ${r.id}, Value: ${JSON.stringify(r[column_name])}`));
          }
        } else if (data_type === 'json' || data_type === 'jsonb') {
          const res = await pool.query(`
            SELECT id, "${column_name}" 
            FROM "${table_name}" 
            WHERE "${column_name}"::text LIKE '%localhost:5000%' 
            LIMIT 5;
          `);
          if (res.rows.length > 0) {
            console.log(`\n🔴 Found in JSON Table: ${table_name}, Column: ${column_name} (${res.rows.length} sample rows):`);
            res.rows.forEach(r => console.log(`   ID: ${r.id}, Value: ${JSON.stringify(r[column_name])}`));
          }
        } else if (data_type === 'ARRAY') {
          const res = await pool.query(`
            SELECT id, "${column_name}" 
            FROM "${table_name}" 
            WHERE "${column_name}"::text LIKE '%localhost:5000%' 
            LIMIT 5;
          `);
          if (res.rows.length > 0) {
            console.log(`\n🔴 Found in ARRAY Table: ${table_name}, Column: ${column_name} (${res.rows.length} sample rows):`);
            res.rows.forEach(r => console.log(`   ID: ${r.id}, Value: ${JSON.stringify(r[column_name])}`));
          }
        }
      } catch (colErr) {
        // Some tables may not have 'id' column, handle gracefully
        try {
          const res = await pool.query(`
            SELECT "${column_name}" 
            FROM "${table_name}" 
            WHERE "${column_name}"::text LIKE '%localhost:5000%' 
            LIMIT 5;
          `);
          if (res.rows.length > 0) {
            console.log(`\n🔴 Found in Table: ${table_name}, Column: ${column_name}:`);
            res.rows.forEach(r => console.log(`   Value: ${JSON.stringify(r[column_name])}`));
          }
        } catch {
          // ignore
        }
      }
    }
    console.log('\n✅ Finished checking database.');
    process.exit(0);
  } catch (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  }
}

checkDatabaseForLocalhost();
