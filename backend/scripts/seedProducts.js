import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initialCatalogData = [
  {
    categoryName: 'Solar Inverters',
    categorySlug: 'solar-inverters',
    tagline: 'High-efficiency string, hybrid, and micro inverters with smart telemetry and grid management.',
    description: 'On-grid, hybrid, and micro solar inverters for grid synchronization and telemetry.',
    brands: [
      {
        brandName: 'Feston Inverters',
        brandSlug: 'feston-inverters',
        desc: 'Advanced on-grid, hybrid, and micro inverters designed for seamless grid tie and energy storage.',
        long_description:
          'Feston Inverters is a global technology pioneer specializing in high-frequency PV string inverters, hybrid energy storage architectures, and smart micro-grid management systems. Founded with a mission to simplify power conversion, Feston combines aerospace-grade power electronics with real-time cloud telemetry. Every inverter passes 100% full-load burn-in testing and IP65 environmental stress tests before dispatch.',
        img: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
        ],
        certifications: ['CE Certified', 'IP65 Weatherproof', 'Grid Compliant', '10-Year Warranty'],
        key_features: [
          'Dual & Multi MPPT trackers with 98.8% peak efficiency',
          'Sub-10ms UPS grade transfer for uninterruptible power continuity',
          'Die-cast aluminum housing engineered for passive fanless heat dissipation',
          'Built-in Type II AC/DC Surge Protection Devices (SPD)',
          'Integrated RS485, Wi-Fi, and 4G IoT cloud monitoring gateway',
          'Anti-islanding protection and smart grid voltage regulation',
          'High surge capacity for inductive motor load start-ups',
          'CE, VDE, IEC 62109, and EN 50549 certified compliant',
        ],
        highlights: [
          '15+ Years Inverter R&D Excellence',
          'Sub-10ms Uninterrupted UPS Switching',
          '500,000+ Units Deployed Worldwide',
          '10-Year Standard Extendable Warranty',
        ],
        documents: [
          { title: 'Feston Corporate Catalog & Product Matrix 2026', url: '/datasheets/sample.pdf' },
          { title: 'Feston Technical Compliance & Grid Certification (CE/IEC)', url: '/datasheets/sample.pdf' },
          { title: 'Feston Inverter Installation & Safety Guidelines', url: '/datasheets/sample.pdf' },
        ],
        subcategories: [
          {
            name: 'On-Grid Inverters',
            slug: 'on-grid',
            desc: 'Grid-tied string inverters for commercial and residential rooftop solar arrays.',
            products: [
              {
                title: 'Feston On-Grid Commercial Inverter 10kW',
                productSlug: 'feston-ongrid-10kw',
                desc: 'Dual MPPT string inverter with 98.6% peak efficiency and built-in Wi-Fi monitoring.',
                long_description:
                  'The Feston 10kW On-Grid String Inverter is precision-engineered for commercial rooftop and ground-mounted solar plants. Featuring dual independent MPPT channels, it maximizes energy yield even under complex multi-angle shading conditions. The unit operates with zero noise using natural convection cooling and communicates directly with the Kingsol Telemetry Cloud via 4G/Wi-Fi.',
                img: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
                datasheetUrl: '/datasheets/feston-10kw-ongrid.pdf',
                expertise: 'Feston On-Grid 10kW features fanless natural cooling and surge protection devices.',
                gallery: [
                  'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1200&auto=format&fit=crop',
                  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
                ],
                isFeatured: true,
                key_features: [
                  '98.6% Maximum Efficiency rating',
                  'Dual MPPT with wide operating voltage window (160V - 950V)',
                  'Die-cast IP65 enclosure rated for ambient operating temps up to 60°C',
                  'Touch-button OLED display interface for quick commissioning',
                  'Integrated Type II DC & AC Surge Protection',
                  'Real-time string level I-V curve diagnostic scan',
                ],
                documents: [
                  { title: 'Feston 10kW On-Grid Technical Datasheet PDF', url: '/datasheets/feston-10kw-ongrid.pdf' },
                  { title: 'User Operations & Wiring SLD Manual', url: '/datasheets/sample.pdf' },
                ],
                specs: {
                  wattage: '10kW',
                  efficiency: '98.6%',
                  mpptTrackers: 'Dual MPPT',
                  warranty: '10-Year Standard',
                  protection: 'IP65 Rated',
                },
              },
            ],
          },
          {
            name: 'Hybrid Inverters',
            slug: 'hybrid',
            desc: 'Bi-directional hybrid inverters with energy storage battery integration.',
            products: [
              {
                title: 'Feston Hybrid Storage Inverter 5kW',
                productSlug: 'feston-hybrid-5kw',
                desc: '5kW Single Phase hybrid solar inverter supporting high-voltage battery storage.',
                long_description:
                  'The Feston 5kW Hybrid Energy Storage Inverter bridges renewable generation with advanced battery backup. Capable of managing lithium LiFePO4 batteries with sub-10ms UPS transfer time, it ensures seamless power during grid outages while maximizing self-consumption.',
                img: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
                datasheetUrl: '/datasheets/feston-5kw-hybrid.pdf',
                expertise: 'Seamless 10ms UPS grade transfer time for zero uninterrupted power supply.',
                gallery: [
                  'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1200&auto=format&fit=crop',
                ],
                isFeatured: true,
                key_features: [
                  'Bi-directional power flow with 48V LFP battery compatibility',
                  '< 10ms seamless transfer to backup mode during power outages',
                  'Programmable charge & discharge time-of-use schedules',
                  'Smart load management with generator auto-start contacts',
                ],
                documents: [
                  { title: 'Feston 5kW Hybrid Datasheet PDF', url: '/datasheets/feston-5kw-hybrid.pdf' },
                  { title: 'Battery Compatibility Guide (LiFePO4)', url: '/datasheets/sample.pdf' },
                ],
                specs: {
                  wattage: '5kW',
                  efficiency: '97.6%',
                  batteryVoltage: '48V LFP',
                  warranty: '10-Year Warranty',
                  protection: 'IP65 Rated',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    categoryName: 'Solar Modules',
    categorySlug: 'solar-modules',
    tagline: 'Tier-1 photovoltaic modules engineered for maximum energy yield and extreme durability.',
    description: 'Monocrystalline, Bifacial, and PERC high-efficiency photovoltaic solar modules.',
    brands: [
      {
        brandName: 'Goldi Solar',
        brandSlug: 'goldi-solar',
        desc: 'High-efficiency PV modules engineered for extreme durability and maximum output across commercial arrays.',
        long_description:
          'Goldi Solar is one of India’s fastest-growing Tier-1 solar PV module manufacturers, serving over 20 countries. With state-of-the-art robotic manufacturing lines in Gujarat, Goldi produces ultra-high-efficiency Mono PERC and Bifacial modules designed for extreme wind loads, high ambient temperatures, and harsh environmental conditions. Every module is backed by ALMM approval and a 25-year performance warranty.',
        img: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=1200&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1200&auto=format&fit=crop',
        ],
        certifications: ['Tier-1 Listed', 'ALMM Approved', 'TUV Certified', '25-Year Warranty'],
        key_features: [
          'High-density M10 182mm mono PERC cell technology',
          'Up to 21.5% module efficiency with multi-busbar (MBB) design',
          'Excellent low-light irradiance response during dawn, dusk, and overcast days',
          'Certified to withstand wind pressure of 2400 Pa and snow loads of 5400 Pa',
          'Anti-PID cell technology minimizing potential induced degradation',
          'IP68 rated junction box with bypass diodes for hotspot protection',
          'ALMM & BIS compliant for DISCOM grid-tied projects',
          '25-Year 84.8% linear power output output warranty',
        ],
        highlights: [
          'Tier-1 BloombergNEF Recognized',
          '2.5GW+ Manufacturing Capacity',
          'ALMM & BIS Government Approved',
          '25-Year Linear Yield Output Backing',
        ],
        documents: [
          { title: 'Goldi Solar Master Product Portfolio 2026', url: '/datasheets/sample.pdf' },
          { title: 'Goldi Technical Warranty & Installation Guidelines', url: '/datasheets/sample.pdf' },
          { title: 'ALMM & BIS Quality Certificates', url: '/datasheets/sample.pdf' },
        ],
        subcategories: [
          {
            name: 'Mono PERC Series',
            slug: 'mono-perc',
            desc: 'High-efficiency monocrystalline PERC solar panels.',
            products: [
              {
                title: 'Goldi HELOC Pro 550W Mono PERC',
                productSlug: 'goldi-heloc-pro-550w',
                desc: '144-cell monocrystalline module with up to 21.3% efficiency and multi-busbar technology.',
                long_description:
                  'The Goldi HELOC Pro 550W Mono PERC module combines 144 half-cut monocrystalline cells with multi-busbar technology to minimize internal resistive power losses. Engineered specifically for high ambient temperature industrial rooftops, it maintains exceptional energy yields under intense sunlight.',
                img: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
                datasheetUrl: '/datasheets/goldi-550w.pdf',
                expertise: 'Goldi HELOC Pro series delivers exceptional performance under high ambient temperature conditions.',
                gallery: [
                  'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=1200&auto=format&fit=crop',
                ],
                isFeatured: true,
                key_features: [
                  '550W Nominal Power Output with +3% positive tolerance',
                  '21.3% Peak Module Efficiency',
                  'Half-cut cell design lowers cell operating temperature',
                  'Robust 35mm anodized aluminum frame for high wind loading',
                ],
                documents: [
                  { title: 'Goldi HELOC Pro 550W Technical Datasheet PDF', url: '/datasheets/goldi-550w.pdf' },
                  { title: 'PVSyst Simulation PAN File', url: '/datasheets/sample.pdf' },
                ],
                specs: {
                  wattage: '550W',
                  efficiency: '21.3%',
                  cellType: 'Mono PERC',
                  warranty: '25-Year Performance',
                  rating: 'IP68 Junction Box',
                },
              },
            ],
          },
          {
            name: 'Bifacial Series',
            slug: 'bifacial',
            desc: 'Dual-glass bifacial PV modules generating extra rear-side energy yield.',
            products: [
              {
                title: 'Goldi HELOC Plus 540W Bifacial Module',
                productSlug: 'goldi-heloc-plus-540w',
                desc: 'Dual-glass bifacial PV module generating up to 25% extra energy yield from ground reflection.',
                long_description:
                  'The Goldi HELOC Plus 540W Dual-Glass Bifacial panel harnesses sunlight from both front and rear surfaces, producing up to 25% additional power yield when installed over reflective ground, white roofs, or elevated sheds.',
                img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&auto=format&fit=crop',
                datasheetUrl: '/datasheets/goldi-540w-bifacial.pdf',
                expertise: 'Designed for utility-scale solar farms and elevated commercial sheds.',
                gallery: [
                  'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&auto=format&fit=crop',
                ],
                isFeatured: true,
                key_features: [
                  'Bifaciality factor up to 70% ± 5%',
                  '30-Year dual-glass linear warranty',
                  'Zero micro-crack risk with 2.0mm tempered front & rear glass',
                ],
                documents: [
                  { title: 'Goldi 540W Bifacial Datasheet PDF', url: '/datasheets/goldi-540w-bifacial.pdf' },
                ],
                specs: {
                  wattage: '540W',
                  efficiency: '21.0%',
                  cellType: 'Bifacial Mono PERC',
                  warranty: '30-Year Performance',
                  rating: '1500V DC System',
                },
              },
            ],
          },
        ],
      },
      {
        brandName: 'Vikram Solar',
        brandSlug: 'vikram-solar',
        desc: 'Tier-1 solar panels with robust performance records across global utility-scale projects.',
        long_description:
          'Vikram Solar is one of India’s largest solar module manufacturers with an international footprint spanning 32+ nations. Renowned for utility-scale EPC installations, Vikram Solar modules feature stringent quality checks, PID-free solar cells, and high structural resilience.',
        img: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=1200&auto=format&fit=crop',
        ],
        certifications: ['Tier-1 Listed', 'BIS Certified', 'PID Resistant', '27-Year Warranty'],
        key_features: [
          'Somera Series M10 half-cut technology',
          'Certified PID-free under 85°C / 85% RH test conditions',
          'Heavy-duty alloy frame with corrosion-resistant coating',
          'Highest power generation performance density per sq. meter',
        ],
        highlights: [
          '3.5GW+ Global Manufacturing Footprint',
          'Tier-1 Rated Solar Panel Brand',
          '27-Year Extended Performance Backing',
        ],
        documents: [
          { title: 'Vikram Solar Master Catalog 2026', url: '/datasheets/sample.pdf' },
        ],
        subcategories: [
          {
            name: 'Somera Series',
            slug: 'somera-series',
            desc: 'Half-cut monocrystalline solar panels.',
            products: [
              {
                title: 'Vikram Somera Grand Ultima 545W',
                productSlug: 'vikram-somera-545w',
                desc: 'Ultra-high efficiency monocrystalline module with advanced anti-PID cell technology.',
                long_description:
                  'Vikram Somera Grand Ultima 545W delivers exceptional power density for commercial rooftops and ground utility farms. Built with anti-reflective coated glass and heavy-duty frame alloy.',
                img: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
                datasheetUrl: '/datasheets/vikram-545w.pdf',
                expertise: 'Vikram Somera modules are engineered with heavy-duty anodized aluminum alloy frames.',
                gallery: [
                  'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=1200&auto=format&fit=crop',
                ],
                isFeatured: true,
                key_features: [
                  '545W Power rating',
                  'Multi-busbar half-cut PERC cell technology',
                  'Class A fire safety rating',
                ],
                documents: [
                  { title: 'Vikram Somera 545W Datasheet PDF', url: '/datasheets/vikram-545w.pdf' },
                ],
                specs: {
                  wattage: '545W',
                  efficiency: '21.1%',
                  cellType: 'Mono PERC Half-Cut',
                  warranty: '27-Year Linear Performance',
                  rating: 'Class A Fire Safety',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    categoryName: 'Solar Cables',
    categorySlug: 'solar-cables',
    tagline: 'TUV-certified DC solar cables designed to minimize transmission loss and endure extreme weather.',
    description: 'TUV-certified cross-linked polyolefin insulated copper DC solar cables.',
    brands: [
      {
        brandName: 'Apar Cables',
        brandSlug: 'apar-cables',
        desc: 'TUV-certified DC solar cables engineered for electron-beam cross-linked insulation.',
        long_description:
          'Apar Industries is a global leader in power transmission conductors and specialized cables. Apar Solar DC Cables feature electron-beam cross-linked polyolefin (XLPO) insulation, offering unparalleled resistance to UV, ozone, thermal stress, and chemical degradation.',
        img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
        ],
        certifications: ['TUV 2PfG 1169', 'EN 50618', 'Halogen Free', '25-Year Lifespan'],
        key_features: [
          'Tinned flexible copper conductor Class 5',
          'Electron-beam cross-linked XLPO insulation & sheath',
          'Halogen-free, flame retardant, and low smoke emission (LSZH)',
          'Designed for 25+ years operating lifespan in outdoor solar environments',
        ],
        highlights: [
          'TUV Rheinland Certified',
          '25-Year Design Service Lifespan',
          'Extreme Outdoor Weather & UV Proof',
        ],
        documents: [
          { title: 'Apar Solar DC Cable Catalog & Technical Datasheet', url: '/datasheets/sample.pdf' },
        ],
        subcategories: [
          {
            name: 'DC Solar Cables',
            slug: 'dc-solar-cables',
            desc: 'Single core tinned copper flexible solar cables.',
            products: [
              {
                title: 'Apar 4 sq mm Single Core DC Solar Cable',
                productSlug: 'apar-4sqmm-dc-cable',
                desc: 'Cross-linked polyolefin insulated copper DC solar cable for panel-to-inverter wiring.',
                long_description:
                  'Apar 4 sq mm Single Core DC Cable is designed specifically for interconnecting PV modules and string inverters. Engineered with high-purity tinned copper conductors to prevent oxidation and energy loss over 25 years.',
                img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
                datasheetUrl: '/datasheets/apar-4sqmm-cable.pdf',
                expertise: 'Features tinned flexible copper conductors with XLPO insulation.',
                gallery: [
                  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
                ],
                isFeatured: true,
                key_features: [
                  '4 sq mm cross-section area',
                  '1500V DC working voltage rating',
                  'TUV EN 50618 certified compliance',
                ],
                documents: [
                  { title: 'Apar 4sqmm DC Cable Datasheet PDF', url: '/datasheets/apar-4sqmm-cable.pdf' },
                ],
                specs: {
                  cableSize: '4 sq mm',
                  conductor: 'Tinned Annealed Copper',
                  rating: '1500V DC Working Voltage',
                  warranty: '25-Year Lifespan',
                  protection: 'UV & Flame Retardant',
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

async function seedDatabase() {
  try {
    console.log('🚀 Executing Schema & Seeding All Database Records...');

    // 1. Read & Execute schema.sql
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const sqlScript = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(sqlScript);
    console.log('✅ Database Schema Executed Successfully.');

    // 2. Populate Catalog Data
    for (const catData of initialCatalogData) {
      const catRes = await pool.query(
        `INSERT INTO categories (name, slug, tagline, description)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO UPDATE 
         SET name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description
         RETURNING id;`,
        [catData.categoryName, catData.categorySlug, catData.tagline, catData.description]
      );
      const categoryId = catRes.rows[0].id;

      for (const brandData of catData.brands) {
        const brandRes = await pool.query(
          `INSERT INTO brands (category_id, name, slug, description, image_url, certifications, gallery, long_description, key_features, highlights, documents)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (category_id, slug) DO UPDATE
           SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url,
               certifications = EXCLUDED.certifications, gallery = EXCLUDED.gallery, long_description = EXCLUDED.long_description,
               key_features = EXCLUDED.key_features, highlights = EXCLUDED.highlights, documents = EXCLUDED.documents
           RETURNING id;`,
          [
            categoryId,
            brandData.brandName,
            brandData.brandSlug,
            brandData.desc,
            brandData.img,
            JSON.stringify(brandData.certifications || []),
            brandData.gallery || [],
            brandData.long_description || '',
            brandData.key_features || [],
            brandData.highlights || [],
            JSON.stringify(brandData.documents || []),
          ]
        );
        const brandId = brandRes.rows[0].id;

        for (const subCatData of brandData.subcategories || []) {
          const subRes = await pool.query(
            `INSERT INTO subcategories (category_id, brand_id, name, slug, description)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (brand_id, slug) DO UPDATE
             SET name = EXCLUDED.name, description = EXCLUDED.description
             RETURNING id;`,
            [categoryId, brandId, subCatData.name, subCatData.slug, subCatData.desc || '']
          );
          const subcategoryId = subRes.rows[0].id;

          for (const prodData of subCatData.products || []) {
            await pool.query(
              `INSERT INTO products (category_id, brand_id, subcategory_id, title, name, slug, description, short_description, image_url, datasheet_url, expertise, gallery, long_description, key_features, documents, specs, is_featured)
               VALUES ($1, $2, $3, $4, $4, $5, $6, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
               ON CONFLICT (slug) DO UPDATE
               SET category_id = EXCLUDED.category_id, brand_id = EXCLUDED.brand_id, subcategory_id = EXCLUDED.subcategory_id,
                   title = EXCLUDED.title, name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url,
                   datasheet_url = EXCLUDED.datasheet_url, expertise = EXCLUDED.expertise,
                   gallery = EXCLUDED.gallery, long_description = EXCLUDED.long_description, key_features = EXCLUDED.key_features,
                   documents = EXCLUDED.documents, specs = EXCLUDED.specs, is_featured = EXCLUDED.is_featured;`,
              [
                categoryId,
                brandId,
                subcategoryId,
                prodData.title,
                prodData.productSlug,
                prodData.desc,
                prodData.img,
                prodData.datasheetUrl,
                prodData.expertise,
                prodData.gallery || [prodData.img],
                prodData.long_description || prodData.desc,
                prodData.key_features || [],
                JSON.stringify(prodData.documents || []),
                JSON.stringify(prodData.specs || {}),
                prodData.isFeatured ?? true,
              ]
            );
          }
        }
      }
    }

    // 3. Singleton Products Page Settings
    await pool.query(
      `INSERT INTO products_page_settings (id, tagline, headline, highlight_word, subtitle, brands_tagline, brands_title, products_tagline, products_title)
       VALUES (1, 'PORTFOLIO & PRODUCTS', 'Authorized Tier-1 Solar Catalog.', 'Catalog.', 'Explore authorized photovoltaic modules, string & hybrid inverters, and DC cabling systems engineered for commercial and industrial energy projects.', 'AUTHORIZED MANUFACTURERS', 'Partner Brands', 'COMPONENT SPECIFICATIONS', 'Featured Components')
       ON CONFLICT (id) DO NOTHING;`
    );

    // 4. Singleton Footer Content Settings & Initial Social Links
    await pool.query(
      `INSERT INTO footer_settings (id, description, hq_label, address, phone, email)
       VALUES (1, 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.', 'Global HQ', 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.', '+1 (800) 555-SOLAR', 'b2b@kingsol-energy.com')
       ON CONFLICT (id) DO NOTHING;`
    );

    const socialLinksCount = await pool.query(`SELECT COUNT(*) FROM social_links`);
    if (parseInt(socialLinksCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO social_links (platform_name, url, icon_name, sort_order) VALUES
        ('Instagram', 'https://instagram.com/kingsolenergy', 'Instagram', 1),
        ('Facebook', 'https://facebook.com/kingsolenergy', 'Facebook', 2),
        ('LinkedIn', 'https://linkedin.com/company/kingsol-energy', 'Linkedin', 3),
        ('YouTube', 'https://youtube.com/@kingsolenergy', 'Youtube', 4),
        ('X (Twitter)', 'https://x.com/kingsolenergy', 'Twitter', 5);
      `);
    }

    // 5. Singleton Contact Page Settings
    await pool.query(
      `INSERT INTO contact_page_settings (id, tagline, headline, highlight_word, subtitle)
       VALUES (1, 'GET IN TOUCH', 'Let us engineer your clean energy future.', 'energy', 'Reach out to our B2B engineering and procurement team for utility-scale solar consultations, component inquiries, or technical support.')
       ON CONFLICT (id) DO NOTHING;`
    );

    // 6. Singleton Solutions Settings & Initial Cards
    await pool.query(
      `INSERT INTO solutions_settings (id, tagline, headline, highlight_word)
       VALUES (1, 'OUR SOLUTIONS', 'Powering the Future , one panel at a time.', 'Future')
       ON CONFLICT (id) DO NOTHING;`
    );

    const solutionsCardsCount = await pool.query(`SELECT COUNT(*) FROM solutions_cards`);
    if (parseInt(solutionsCardsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO solutions_cards (tag, title, description, image_url, category_slug, sort_order) VALUES
        ('PV MODULES', 'Monocrystalline Solar Modules', 'Authorized Tier-1 photovoltaic panels with up to 22.8% module efficiency and 25-year performance warranty.', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80', 'solar-modules', 1),
        ('POWER CONVERSION', 'Grid-Tie & Hybrid Inverters', 'High-efficiency string and central inverters with integrated smart telemetry, MPPT trackers, and grid sync.', 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?auto=format&fit=crop&w=800&q=80', 'solar-inverters', 2),
        ('ENERGY STORAGE', 'C&I Battery Storage Systems', 'Scalable LiFePO4 battery energy storage solutions (BESS) for peak shaving, load shifting, and microgrids.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', 'solar-inverters', 3),
        ('ELECTRICAL BOS', 'Solar DC Cables & Connectors', 'TÜV certified 1500V DC cabling, MC4 connectors, combiner boxes, and DC isolator switches.', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80', 'solar-cables', 4);
      `);
    }

    // 7. Initial Admin User
    const adminEmail = 'admin@kingsol.com';
    const initialPassHash = await bcrypt.hash('123456', 12);
    await pool.query(
      `INSERT INTO admin_users (email, password_hash, is_verified)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (email) DO NOTHING;`,
      [adminEmail, initialPassHash]
    );

    console.log('🎉 Database Seeding & Rich Enterprise Catalog Data Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database Seeding Error:', error);
    process.exit(1);
  }
}

seedDatabase();
