import pool from '../config/db.js';

async function seedContents() {
  try {
    console.log('🌱 Seeding Gallery & Media tables...');

    // 1. Ensure tables exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'Projects',
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS media_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        youtube_url TEXT NOT NULL,
        thumbnail_url TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check if gallery_items has records
    const galleryRes = await pool.query(`SELECT COUNT(*) FROM gallery_items`);
    if (parseInt(galleryRes.rows[0].count, 10) === 0) {
      console.log('📸 Seeding initial gallery items...');
      await pool.query(`
        INSERT INTO gallery_items (title, image_url, category, is_active, sort_order) VALUES
        ('500kW Rooftop Solar Installation - Commercial Facility', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop', 'Projects', true, 1),
        ('Tier-1 Monocrystalline Bifacial Panel Inspection', 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1200&auto=format&fit=crop', 'Engineering', true, 2),
        ('Utility-Scale Ground Mounted Solar Farm', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop', 'Projects', true, 3),
        ('Kingsol Technical Expo & Green Energy Summit 2026', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop', 'Events', true, 4),
        ('High Efficiency Central String Inverter Array', 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1200&auto=format&fit=crop', 'Engineering', true, 5),
        ('C&I Battery Energy Storage System (BESS) Deployment', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop', 'Projects', true, 6)
      `);
    }

    // 3. Check if media_items has records
    const mediaRes = await pool.query(`SELECT COUNT(*) FROM media_items`);
    if (parseInt(mediaRes.rows[0].count, 10) === 0) {
      console.log('🎥 Seeding initial media items...');
      await pool.query(`
        INSERT INTO media_items (title, youtube_url, thumbnail_url, description, is_active, sort_order) VALUES
        ('Kingsol Corporate Profile - Engineering Renewable Excellence', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'An overview of Kingsol Energy procurement capabilities, rooftop solar installations, and Tier-1 partners across India.', true, 1),
        ('Utility-Scale Solar EPC Workflows & On-Site Quality Assurance', 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ', 'https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg', 'Step-by-step walkthrough of our high-voltage transformer integration and grid synchronization process.', true, 2),
        ('Smart Inverter Telemetry & Remote Monitoring Demonstration', 'https://www.youtube.com/watch?v=L_LUpnjgPso', 'https://img.youtube.com/vi/L_LUpnjgPso/maxresdefault.jpg', 'Discover how our real-time SCADA telemetry tracks MPPT efficiency and remote fault isolation.', true, 3)
      `);
    }

    console.log('✅ Contents seeding complete!');
  } catch (err) {
    console.error('❌ Error seeding contents:', err);
  }
}

seedContents().then(() => process.exit(0));
