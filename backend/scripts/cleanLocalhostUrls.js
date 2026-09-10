import pool from '../config/db.js';

async function cleanLocalhostUrls() {
  console.log('🚀 Starting Database Migration: Stripping localhost URLs to relative paths...');

  try {
    // 1. Text & Varchar columns across all public tables
    const textColumns = [
      { table: 'products', column: 'image_url' },
      { table: 'products', column: 'datasheet_url' },
      { table: 'brands', column: 'image_url' },
      { table: 'brands', column: 'logo_url' },
      { table: 'brands', column: 'specs_image_url' },
      { table: 'brands', column: 'company_profile_image_url' },
      { table: 'categories', column: 'image_url' },
      { table: 'hero_settings', column: 'bg_image_url' },
      { table: 'about_settings', column: 'main_image_url' },
      { table: 'about_settings', column: 'bg_image_url' },
      { table: 'blogs', column: 'image_url' },
      { table: 'services', column: 'image_url' },
      { table: 'gallery_items', column: 'image_url' },
      { table: 'media_items', column: 'thumbnail_url' },
      { table: 'media_items', column: 'media_url' },
      { table: 'partners', column: 'image_url' },
      { table: 'trusted_brands', column: 'image_url' },
      { table: 'testimonials', column: 'image_url' },
      { table: 'branding', column: 'logo_url' },
      { table: 'branding', column: 'footer_logo_url' },
      { table: 'branding', column: 'favicon_url' },
      { table: 'applications', column: 'resume_url' },
      { table: 'solutions', column: 'image_url' },
      { table: 'careers_settings', column: 'bg_image_url' },
      { table: 'contact_page_settings', column: 'hero_bg_image_url' },
    ];

    for (const item of textColumns) {
      try {
        const query = `
          UPDATE "${item.table}"
          SET "${item.column}" = REGEXP_REPLACE("${item.column}", '^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?', '')
          WHERE "${item.column}" ~ '^https?://(localhost|127\\.0\\.0\\.1)(:[0-9]+)?';
        `;
        const res = await pool.query(query);
        if (res.rowCount > 0) {
          console.log(`✅ Updated ${res.rowCount} rows in ${item.table}.${item.column}`);
        }
      } catch (err) {
        // table or column might not exist or be empty
      }
    }

    // 2. Clean JSON/JSONB columns (e.g. documents, gallery, etc.)
    const jsonColumns = [
      { table: 'brands', column: 'documents' },
      { table: 'products', column: 'documents' },
    ];

    for (const item of jsonColumns) {
      try {
        const selectRes = await pool.query(`SELECT id, "${item.column}" FROM "${item.table}" WHERE "${item.column}"::text LIKE '%localhost:%' OR "${item.column}"::text LIKE '%127.0.0.1:%'`);
        for (const row of selectRes.rows) {
          let rawData = row[item.column];
          let updated = false;

          if (Array.isArray(rawData)) {
            rawData = rawData.map(doc => {
              if (doc && typeof doc === 'object' && typeof doc.url === 'string') {
                const cleanedUrl = doc.url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?/, '');
                if (cleanedUrl !== doc.url) {
                  updated = true;
                  return { ...doc, url: cleanedUrl };
                }
              }
              return doc;
            });
          }

          if (updated) {
            await pool.query(`UPDATE "${item.table}" SET "${item.column}" = $1 WHERE id = $2`, [JSON.stringify(rawData), row.id]);
            console.log(`✅ Cleaned JSON document URLs in ${item.table} (ID: ${row.id})`);
          }
        }
      } catch (err) {
        console.error(`Error cleaning JSON column ${item.table}.${item.column}:`, err.message);
      }
    }

    // 3. Clean Array Columns (e.g. gallery)
    const arrayColumns = [
      { table: 'products', column: 'gallery' },
      { table: 'brands', column: 'gallery' },
    ];

    for (const item of arrayColumns) {
      try {
        const selectRes = await pool.query(`SELECT id, "${item.column}" FROM "${item.table}" WHERE "${item.column}"::text LIKE '%localhost:%' OR "${item.column}"::text LIKE '%127.0.0.1:%'`);
        for (const row of selectRes.rows) {
          let rawArr = row[item.column];
          if (Array.isArray(rawArr)) {
            const cleanedArr = rawArr.map(url => {
              if (typeof url === 'string') {
                return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?/, '');
              }
              return url;
            });
            await pool.query(`UPDATE "${item.table}" SET "${item.column}" = $1 WHERE id = $2`, [cleanedArr, row.id]);
            console.log(`✅ Cleaned Array URLs in ${item.table}.${item.column} (ID: ${row.id})`);
          }
        }
      } catch (err) {
        console.error(`Error cleaning Array column ${item.table}.${item.column}:`, err.message);
      }
    }

    console.log('🎉 Database migration complete! All asset URLs are now clean relative paths.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

cleanLocalhostUrls();
