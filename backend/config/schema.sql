CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tagline VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS tagline VARCHAR(255);

-- 2. Brands Table (Linked to Category)
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  logo_url TEXT,
  description TEXT,
  image_url TEXT,
  certifications JSONB DEFAULT '[]'::jsonb,
  gallery TEXT[] DEFAULT '{}',
  long_description TEXT DEFAULT '',
  key_features TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]'::jsonb,
  specs_image_url TEXT DEFAULT '',
  specifications_list TEXT[] DEFAULT '{}',
  product_range_description TEXT DEFAULT '',
  product_range_features TEXT[] DEFAULT '{}',
  specs_description TEXT DEFAULT '',
  certifications_list TEXT[] DEFAULT '{}',
  product_range_subtitle TEXT DEFAULT '',
  company_profile_text TEXT DEFAULT '',
  company_profile_image_url TEXT DEFAULT '',
  categorized_features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE brands DROP COLUMN IF EXISTS gallery;
ALTER TABLE brands ADD COLUMN gallery TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS long_description TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS key_features TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS highlights TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS specs_image_url TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS specifications_list TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS product_range_description TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS product_range_features TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS specs_description TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS certifications_list TEXT[] DEFAULT '{}';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS product_range_subtitle TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS company_profile_text TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS company_profile_image_url TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS categorized_features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS card_image TEXT DEFAULT '';

-- Explicitly enforce composite unique constraint for brands
ALTER TABLE brands DROP CONSTRAINT IF EXISTS brands_category_id_slug_key;
ALTER TABLE brands ADD CONSTRAINT brands_category_id_slug_key UNIQUE (category_id, slug);

-- 3. Subcategories / Series Table (Linked to Category & Brand)
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Explicitly enforce composite unique constraint for subcategories
ALTER TABLE subcategories DROP CONSTRAINT IF EXISTS subcategories_brand_id_slug_key;
ALTER TABLE subcategories ADD CONSTRAINT subcategories_brand_id_slug_key UNIQUE (brand_id, slug);

-- 4. Products Table (Linked to Category, Brand & Subcategory)
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
  subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  image_url TEXT,
  datasheet_url TEXT,
  expertise TEXT,
  gallery TEXT[] DEFAULT '{}',
  long_description TEXT DEFAULT '',
  key_features TEXT[] DEFAULT '{}',
  documents JSONB DEFAULT '[]'::jsonb,
  specs JSONB DEFAULT '{}'::jsonb,
  features TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products DROP COLUMN IF EXISTS gallery;
ALTER TABLE products ADD COLUMN gallery TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS key_features TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS phase_type VARCHAR(255) DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS card_image TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_banner_image TEXT DEFAULT '';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS category_banner_image TEXT DEFAULT '';
ALTER TABLE brands ADD COLUMN IF NOT EXISTS category_banner_image TEXT DEFAULT '';

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_slug_key;
ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);

-- 5. Contact Inquiries / Quotes Table (UUID for Enumeration Prevention)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  message TEXT,
  inquiry_type VARCHAR(100) DEFAULT 'Contact Inquiry',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;
ALTER TABLE contact_inquiries ADD COLUMN IF NOT EXISTS inquiry_type VARCHAR(100) DEFAULT 'Contact Inquiry';

-- 6. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER,
  job_role VARCHAR(255) DEFAULT 'General Application',
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  resume_url TEXT,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'New',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Blogs & News Table
CREATE TABLE IF NOT EXISTS blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  author VARCHAR(100) DEFAULT 'Kingsol Team',
  image_url TEXT,
  excerpt TEXT,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Hero Settings Singleton Table
CREATE TABLE IF NOT EXISTS hero_settings (
  id SERIAL PRIMARY KEY,
  bg_image_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80',
  headline TEXT NOT NULL DEFAULT 'Powering the future of the world',
  highlight_word VARCHAR(100) DEFAULT 'future',
  subtitle TEXT NOT NULL DEFAULT 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
  hero_slides JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hero_settings ADD COLUMN IF NOT EXISTS hero_slides JSONB DEFAULT '[]'::jsonb;

INSERT INTO hero_settings (id, bg_image_url, headline, highlight_word, subtitle)
VALUES (1, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80', 'Powering the future of the world', 'future', 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.')
ON CONFLICT (id) DO NOTHING;

-- 9. Products Page Settings Singleton Table
CREATE TABLE IF NOT EXISTS products_page_settings (
  id SERIAL PRIMARY KEY,
  tagline VARCHAR(255) DEFAULT 'PORTFOLIO & PRODUCTS',
  headline TEXT DEFAULT 'Authorized Tier-1 Solar Catalog.',
  highlight_word VARCHAR(100) DEFAULT 'Catalog.',
  subtitle TEXT DEFAULT 'Explore authorized photovoltaic modules, string & hybrid inverters, and DC cabling systems engineered for commercial and industrial energy projects.',
  brands_tagline VARCHAR(255) DEFAULT 'AUTHORIZED MANUFACTURERS',
  brands_title VARCHAR(255) DEFAULT 'Partner Brands',
  products_tagline VARCHAR(255) DEFAULT 'COMPONENT SPECIFICATIONS',
  products_title VARCHAR(255) DEFAULT 'Featured Components',
  brand_story_tagline VARCHAR(255) DEFAULT 'BRAND BACKGROUND & ARCHITECTURE',
  brand_story_title VARCHAR(255) DEFAULT 'Engineering & Technology Story',
  features_title VARCHAR(255) DEFAULT 'Key Features & Standards',
  capabilities_title VARCHAR(255) DEFAULT 'Brand Highlights',
  capabilities_footer TEXT DEFAULT 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
  docs_tagline VARCHAR(255) DEFAULT 'TECHNICAL DOCUMENTATION',
  docs_title VARCHAR(255) DEFAULT 'Downloadable Specs & Certifications',
  docs_subtitle VARCHAR(255) DEFAULT 'Official Manufacturer Datasheets & Compliance PDFs',
  slider_tagline VARCHAR(255) DEFAULT 'COMPONENT CATALOG PORTFOLIO',
  alternate_layout BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products_page_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 10. Footer Content Settings Singleton Table
CREATE TABLE IF NOT EXISTS footer_settings (
  id SERIAL PRIMARY KEY,
  description TEXT DEFAULT 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
  hq_label VARCHAR(255) DEFAULT 'Global HQ',
  address TEXT DEFAULT 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.',
  phone VARCHAR(100) DEFAULT '+1 (800) 555-SOLAR',
  email VARCHAR(255) DEFAULT 'b2b@kingsol-energy.com',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO footer_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 11. Social Links Management Table
CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform_name VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon_name VARCHAR(50) DEFAULT 'Globe',
  sort_order INTEGER DEFAULT 0
);

-- 12. Contact Page Settings Singleton Table & Infrastructure Tables
CREATE TABLE IF NOT EXISTS contact_page_settings (
  id SERIAL PRIMARY KEY,
  hero_tagline VARCHAR(255) DEFAULT 'GET IN TOUCH',
  hero_headline TEXT DEFAULT 'Connect with Kingsol.',
  hero_highlight VARCHAR(100) DEFAULT 'Kingsol.',
  form_headline VARCHAR(255) DEFAULT 'Send us a message',
  form_subtitle TEXT DEFAULT 'Fill out the form below and our team will get back to you shortly.',
  form_success_msg TEXT DEFAULT 'Thank you for reaching out. An automated Email & WhatsApp alert has been sent to our admin team.',
  hq_tagline VARCHAR(255) DEFAULT 'GLOBAL HQ',
  hq_headline VARCHAR(255) DEFAULT 'Head Office Location',
  hq_highlight VARCHAR(100) DEFAULT 'Location',
  hq_address TEXT DEFAULT 'Third floor Shop. no. 326, Vardhaman Moonstone, Opposite to JSPM Tathawade, Pune.',
  hq_map_url TEXT DEFAULT 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.81745771891!2d73.7479708752074!3d18.627254582487445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e6f3df8ebf%3A0x889db4c803362a74!2sVardhaman%20Moonstone!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
  hq_hours VARCHAR(255) DEFAULT 'Mon - Sat: 10:00 AM - 6:00 PM',
  hq_certification VARCHAR(255) DEFAULT 'ISO 9001 Certified',
  infra_tagline VARCHAR(255) DEFAULT 'INFRASTRUCTURE & REACH',
  infra_headline VARCHAR(255) DEFAULT 'Nationwide Service Networks & Areas',
  infra_highlight VARCHAR(100) DEFAULT 'Networks',
  faq_tagline VARCHAR(255) DEFAULT 'FAQ',
  faq_headline VARCHAR(255) DEFAULT 'Frequently Asked Questions',
  quote_text TEXT DEFAULT '"Engineering a world where clean, renewable energy is the undisputed baseline for every home and industry."',
  quote_author VARCHAR(255) DEFAULT '— THE KINGSOL PROMISE',
  tagline VARCHAR(255) DEFAULT 'GET IN TOUCH',
  headline TEXT DEFAULT 'Let us engineer your clean energy future.',
  highlight_word VARCHAR(100) DEFAULT 'energy',
  subtitle TEXT DEFAULT 'Reach out to our B2B engineering and procurement team for utility-scale solar consultations, component inquiries, or technical support.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_departments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(100),
  email VARCHAR(255),
  whatsapp VARCHAR(100),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_infrastructure (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contact_faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO contact_page_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 13. Solutions Section Settings Singleton Table
CREATE TABLE IF NOT EXISTS solutions_settings (
  id SERIAL PRIMARY KEY,
  tagline VARCHAR(255) DEFAULT 'OUR SOLUTIONS',
  headline TEXT DEFAULT 'Powering the Future , one panel at a time.',
  highlight_word VARCHAR(100) DEFAULT 'Future',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO solutions_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 14. Solutions Cards (Dynamic Data) Table
CREATE TABLE IF NOT EXISTS solutions_cards (
  id SERIAL PRIMARY KEY,
  tag VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category_slug VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Home About Settings Table (Includes Layout Toggle)
CREATE TABLE IF NOT EXISTS home_about_settings (
  id SERIAL PRIMARY KEY,
  tagline VARCHAR(255) DEFAULT 'WHAT WE DO',
  headline TEXT DEFAULT 'We are dedicated to making clean power accessible, affordable, and effective.',
  highlight_word VARCHAR(100) DEFAULT 'clean power',
  subtitle TEXT DEFAULT 'Kingsol Energy is a premier solar procurement partner across India, driving rooftop solar installations, commercial PV plants, and grid-tie microgrids with Tier-1 components.',
  main_image_url TEXT DEFAULT 'https://cdn.britannica.com/94/192794-050-3F3F3DDD/panels-electricity-order-sunlight.jpg',
  card_heading VARCHAR(255) DEFAULT 'SUNERGY VISION',
  card_body TEXT DEFAULT 'Sunergy was founded with a vision to drive sustainable energy solutions that empower individuals, businesses, and communities.',
  bg_image_url TEXT DEFAULT 'https://static.vecteezy.com/system/resources/previews/027/662/778/large_2x/solar-panel-on-sky-sunset-background-free-photo.jpg',
  image_on_left BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE home_about_settings ADD COLUMN IF NOT EXISTS image_on_left BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS about_settings (
  id SERIAL PRIMARY KEY,
  tagline VARCHAR(255) DEFAULT 'WHAT WE DO',
  headline TEXT DEFAULT 'We are dedicated to making clean power accessible, affordable, and effective.',
  highlight_word VARCHAR(100) DEFAULT 'clean power',
  subtitle TEXT DEFAULT 'Kingsol Energy is a premier solar procurement partner across India, driving rooftop solar installations, commercial PV plants, and grid-tie microgrids with Tier-1 components.',
  main_image_url TEXT DEFAULT 'https://cdn.britannica.com/94/192794-050-3F3F3DDD/panels-electricity-order-sunlight.jpg',
  card_heading VARCHAR(255) DEFAULT 'SUNERGY VISION',
  card_body TEXT DEFAULT 'Sunergy was founded with a vision to drive sustainable energy solutions that empower individuals, businesses, and communities.',
  bg_image_url TEXT DEFAULT 'https://static.vecteezy.com/system/resources/previews/027/662/778/large_2x/solar-panel-on-sky-sunset-background-free-photo.jpg',
  image_on_left BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE about_settings ADD COLUMN IF NOT EXISTS image_on_left BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS about_warehouse_settings (
  id SERIAL PRIMARY KEY,
  tagline VARCHAR(255) DEFAULT 'PAN-INDIA PRESENCE',
  headline TEXT DEFAULT 'Strategic warehousing across High-demand renewable corridors.',
  highlight_word VARCHAR(100) DEFAULT 'High-demand',
  description TEXT DEFAULT 'To guarantee rapid dispatch and zero transit bottlenecks, Kingsol maintains strategically positioned regional fulfillment hubs stocked with Tier-1 modules, inverters, and BOS infrastructure.',
  map_image_url TEXT DEFAULT '/uploads/india-warehouse-map.jpg',
  locations JSONB DEFAULT '["Bhiwandi, Maharashtra", "Ahmedabad, Gujarat", "Bengaluru, Karnataka", "Chennai, Tamil Nadu", "Jaipur, Rajasthan", "Kolkata, West Bengal", "Hyderabad, Telangana", "Noida, Delhi NCR"]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO home_about_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO about_settings (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO about_warehouse_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- 16. Admin Users Table (UUID v4 for IDOR & Enumeration Prevention)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_verified BOOLEAN DEFAULT TRUE,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'admin';

-- 17. Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(100) DEFAULT 'Projects',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Media Items Table (YouTube Videos)
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

-- 19. Home Partners Logos Schema & Migrations
CREATE TABLE IF NOT EXISTS home_partners_logos (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  route_url TEXT DEFAULT '',
  linked_brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. Site Settings / Feature Flags Table
CREATE TABLE IF NOT EXISTS site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  show_services BOOLEAN DEFAULT false,
  show_videos BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO site_settings (id, show_services, show_videos)
VALUES (1, false, false)
ON CONFLICT (id) DO NOTHING;


