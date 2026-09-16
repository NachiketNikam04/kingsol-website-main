import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Phone, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';

interface ProductNav {
  id: number;
  name: string;
  slug: string;
}

interface BrandNav {
  id: number;
  name: string;
  slug: string;
  products?: ProductNav[];
  subcategories?: { id: number; name: string; slug: string }[];
}

interface CategoryNav {
  id: number;
  name: string;
  slug: string;
  brands?: BrandNav[];
}

interface ServiceNav {
  title: string;
  slug: string;
}

export const Navbar: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [productCategories, setProductCategories] = useState<CategoryNav[]>([]);
  const [servicesList, setServicesList] = useState<ServiceNav[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<{ show_services: boolean; show_videos: boolean }>({
    show_services: false,
    show_videos: false,
  });

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious();
    // If we are at the very top, always show it
    if (latest <= 50) {
      setHidden(false);
      return;
    }
    // Keep visible if mobile menu is open
    if (isMobileMenuOpen) {
      setHidden(false);
      return;
    }
    // If scrolling down, hide it
    if (latest > (previous ?? 0) && latest > 150) {
      setHidden(true);
    } 
    // If scrolling up, show it
    else {
      setHidden(false);
    }
  });

  useEffect(() => {
    // 1. Fetch Branding
    async function loadBranding() {
      try {
        const res = await fetch(`${API_BASE_URL}/branding`);
        const json = await res.json();
        if (json.success && json.data) {
          setLogoUrl(json.data.logo_url || '');
        }
      } catch (err) {
        console.warn('⚠️ [Navbar] Branding API offline:', err);
      }
    }

    // 2. Fetch Navigation Menu
    async function loadNavigation() {
      try {
        const res = await fetch(`${API_BASE_URL}/navigation/menu`);
        const json = await res.json();
        if (json.success && json.data) {
          if (Array.isArray(json.data.productCategories) && json.data.productCategories.length > 0) {
            setProductCategories(json.data.productCategories);
          }
          if (Array.isArray(json.data.services) && json.data.services.length > 0) {
            setServicesList(json.data.services);
          }
        }
      } catch (err) {
        console.warn('⚠️ [Navbar] Navigation API offline, using fallback defaults:', err);
      }
    }

    // 3. Fetch Navigation Feature Flags
    async function loadFeatureFlags() {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/features`);
        const json = await res.json();
        if (json.success && json.data) {
          setFeatureFlags({
            show_services: Boolean(json.data.show_services),
            show_videos: Boolean(json.data.show_videos),
          });
        }
      } catch (err) {
        console.warn('⚠️ [Navbar] Feature flags API offline:', err);
      }
    }

    loadBranding();
    loadNavigation();
    loadFeatureFlags();
  }, []);

  // Fallback Product Categories Data (Pure fallback defaults if API offline, NO hardcoded BESS)
  const fallbackCategories: CategoryNav[] = [
    {
      id: 1,
      name: 'Solar Inverters',
      slug: 'solar-inverters',
      brands: [
        {
          id: 1,
          name: 'Feston Inverters',
          slug: 'feston-inverters',
          subcategories: [
            { id: 1, name: 'On-Grid Inverters', slug: 'on-grid-inverters' },
          ],
          products: [
            { id: 1, name: 'On-Grid Inverters - Single Phase (1.5kW to 4 kW)', slug: 'on-grid-inverters-single-phase-1-5kw-to-4-kw' },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Solar Modules',
      slug: 'solar-modules',
      brands: [
        {
          id: 2,
          name: 'Goldi Solar',
          slug: 'goldi-solar',
          products: [
            { id: 1, name: 'Goldi HELOC Pro 550W Mono PERC', slug: 'goldi-heloc-pro-550w' },
            { id: 2, name: 'Goldi HELOC Plus 540W Bifacial Module', slug: 'goldi-heloc-plus-540w' },
          ],
        },
        {
          id: 3,
          name: 'Vikram Solar',
          slug: 'vikram-solar',
          products: [
            { id: 1, name: 'Vikram Somera Grand Ultima 545W', slug: 'vikram-somera-545w' },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Solar Cables',
      slug: 'solar-cables',
      brands: [
        {
          id: 4,
          name: 'Apar Cables',
          slug: 'apar-cables',
          products: [
            { id: 1, name: 'Apar 4 sq mm Single Core DC Solar Cable', slug: 'apar-4sqmm-dc-cable' },
          ],
        },
      ],
    },
  ];

  // Fallback Services Data
  const fallbackServices: ServiceNav[] = [
    { title: 'Solar panel cleaning services', slug: 'solar-panel-cleaning' },
    { title: 'Off-grid solar installation', slug: 'off-grid-installation' },
    { title: 'Solar inverter repair services', slug: 'solar-inverter-repair' },
    { title: 'Solar system maintenance', slug: 'solar-system-maintenance' },
    { title: 'Wind turbine repair services', slug: 'wind-turbine-repair' },
    { title: 'Rooftop solar panel installation', slug: 'rooftop-solar-installation' },
  ];

  const isBessCat = (cat: CategoryNav) => {
    const slug = (cat.slug || '').toLowerCase();
    const name = (cat.name || '').toLowerCase();
    return slug === 'bess' || name === 'bess' || name.includes('battery energy');
  };

  // Purely dynamic BESS category & brands from backend database
  const bessCategory = productCategories.find(isBessCat);
  const bessBrands = bessCategory?.brands || [];
  const bessSlug = bessCategory?.slug || 'bess';

  // Products dropdown strictly excludes BESS and sorts active categories
  const rawProductCategories = productCategories.length > 0
    ? productCategories.filter((cat) => !isBessCat(cat))
    : fallbackCategories;

  const activeCategories = rawProductCategories;
  const activeServices = servicesList.length > 0 ? servicesList : fallbackServices;

  const priorityOrder = ['Solar Module', 'Solar Inverter', 'Solar Cable'];

  const sortedCategories = [...activeCategories].sort((a, b) => {
    const indexA = priorityOrder.findIndex((name) =>
      a.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(a.name.toLowerCase())
    );
    const indexB = priorityOrder.findIndex((name) =>
      b.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(b.name.toLowerCase())
    );

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return (a.id || 0) - (b.id || 0);
  });

  const toSlug = (text: string) => (text || '').toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 w-full z-50 shadow-md font-poppins"
    >
      {/* TIER 1: TOP CONTACT BAR (Dark Background) */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-6 lg:px-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Contact Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium">
            <a
              href="tel:18002037228"
              className="flex items-center gap-1.5 hover:text-brand-green transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>Toll Free: 1800 203 7228</span>
            </a>

            <span className="text-slate-600 hidden sm:inline">|</span>

            <a
              href="tel:8530853317"
              className="flex items-center gap-1.5 hover:text-brand-green transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>Sales: 8530853317</span>
            </a>

            <span className="text-slate-600 hidden md:inline">|</span>

            <span className="text-slate-400 hidden md:inline">
              Solar solutions across PAN India
            </span>
          </div>

          {/* Right: Social Media Icons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://facebook.com/kingsolenergy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-slate-400 hover:text-brand-green transition-colors"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://linkedin.com/company/kingsol-energy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-brand-green transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://instagram.com/kingsolenergy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-slate-400 hover:text-brand-green transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://youtube.com/@kingsolenergy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-slate-400 hover:text-brand-green transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://x.com/kingsolenergy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="text-slate-400 hover:text-brand-green transition-colors"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* TIER 2: MAIN NAVBAR (Crisp White Background) */}
      <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Dynamic Company Logo & Mobile Toggle */}
          <div className="flex justify-between items-center w-full lg:w-auto">
            <Link className="flex items-center gap-3" to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <img
                src={logoUrl ? getAssetUrl(logoUrl) : '/logo.png'}
                alt="Kingsol Solar Energy"
                className="h-10 sm:h-12 md:h-14 w-auto max-w-[160px] sm:max-w-[200px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </Link>

            {/* Mobile Hamburger Button */}
            <button 
              className="lg:hidden p-2 text-slate-700 hover:text-brand-green transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Center: Main Navigation Menu */}
          <ul className="hidden lg:flex items-center gap-8 text-base font-medium transition-colors text-slate-800">
            <li>
              <Link className="hover:text-brand-green transition-colors" to="/">
                Home
              </Link>
            </li>
            <li>
              <Link className="hover:text-brand-green transition-colors" to="/about">
                About Us
              </Link>
            </li>

            {/* Products Dropdown */}
            <li className="relative group py-2">
              <Link
                className="hover:text-brand-green transition-colors flex items-center gap-1.5"
                to="/products"
              >
                Products <span className="text-xs">▼</span>
              </Link>

              {/* Level 1: Main Dropdown */}
              <ul className="absolute top-full left-0 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-[60] text-slate-800 mt-2">
                <li>
                  <Link
                    className="block px-5 py-3.5 hover:bg-slate-50 border-b border-slate-100 font-bold text-base text-slate-900 rounded-t-2xl"
                    to="/products"
                  >
                    All Products
                  </Link>
                </li>

                {/* Level 2: Dynamic Categories */}
                {sortedCategories.map((cat, catIdx) => {
                  const cSlug = cat.slug || toSlug(cat.name);

                  return (
                    <li key={cat.id || catIdx} className="relative group/category">
                      <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium">
                        <Link to={`/products/${cSlug}`} className="hover:text-slate-900 flex-1">
                          {cat.name}
                        </Link>
                        {cat.brands && cat.brands.length > 0 && (
                          <span className="text-xl font-light leading-none transition-transform group-hover/category:translate-x-1 shrink-0 ml-2">
                            →
                          </span>
                        )}
                      </div>

                      {/* Level 3: Dynamic Brands under Category */}
                      {cat.brands && cat.brands.length > 0 && (
                        <ul className="absolute top-0 left-full -ml-2 w-64 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover/category:opacity-100 group-hover/category:visible transition-all duration-200">
                          {cat.brands.map((brand, brandIdx) => {
                            const bSlug = brand.slug || toSlug(brand.name);
                            const isSeriesCat = cSlug.toLowerCase().includes('inverter') || cat.name.toLowerCase().includes('inverter');
                            const rawSubItems = isSeriesCat ? (brand.subcategories && brand.subcategories.length > 0 ? brand.subcategories : (brand.products || [])) : (brand.products || []);

                            // Strictly deduplicate by lowercase name / slug
                            const uniqueItemsMap = new Map<string, any>();
                            rawSubItems.forEach((item: any) => {
                              const nameKey = (item.name || item.title || '').trim().toLowerCase();
                              if (nameKey && !uniqueItemsMap.has(nameKey)) {
                                uniqueItemsMap.set(nameKey, item);
                              }
                            });
                            const itemsToMap = Array.from(uniqueItemsMap.values());
                            const hasSubItems = itemsToMap.length > 0;

                            return (
                              <li key={brand.id || brandIdx} className="relative group/brand">
                                <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium">
                                  <Link to={`/products/${cSlug}/${bSlug}`} className="hover:text-slate-900 flex-1">
                                    {brand.name}
                                  </Link>
                                  {hasSubItems && (
                                    <span className="text-xl font-light leading-none transition-transform group-hover/brand:translate-x-1 shrink-0 ml-2">
                                      →
                                    </span>
                                  )}
                                </div>

                                {/* Level 4: Sub-Items */}
                                {hasSubItems && (
                                  <ul className="absolute top-0 left-full -ml-2 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover/brand:opacity-100 group-hover/brand:visible transition-all duration-200">
                                    {itemsToMap.map((item: any, itemIdx: number) => {
                                      const subSlug = item.slug || toSlug(item.name);
                                      return (
                                        <li key={item.id || itemIdx}>
                                          <Link
                                            className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium leading-tight"
                                            to={`/products/${cSlug}/${bSlug}/${subSlug}`}
                                          >
                                            <span className="line-clamp-2">{item.name}</span>
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* BESS Dropdown */}
            <li className="relative group py-2">
              <Link
                className="hover:text-brand-green transition-colors flex items-center gap-1.5"
                to={`/products/${bessSlug}`}
              >
                BESS <span className="text-xs">▼</span>
              </Link>

              {/* Level 1: Main Dropdown */}
              <ul className="absolute top-full left-0 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-[60] text-slate-800 mt-2">
                <li>
                  <Link
                    className="block px-5 py-3.5 hover:bg-slate-50 border-b border-slate-100 font-bold text-base text-slate-900 rounded-t-2xl"
                    to={`/products/${bessSlug}`}
                  >
                    All BESS
                  </Link>
                </li>

                {/* Level 2: Dynamic BESS Brands */}
                {bessBrands.map((brand, brandIdx) => {
                  const bSlug = brand.slug || toSlug(brand.name);
                  const rawSubItems = (brand.subcategories && brand.subcategories.length > 0)
                    ? brand.subcategories
                    : (brand.products || []);

                  // Strictly deduplicate by lowercase name / slug
                  const uniqueItemsMap = new Map<string, any>();
                  rawSubItems.forEach((item: any) => {
                    const nameKey = (item.name || item.title || '').trim().toLowerCase();
                    if (nameKey && !uniqueItemsMap.has(nameKey)) {
                      uniqueItemsMap.set(nameKey, item);
                    }
                  });
                  const itemsToMap = Array.from(uniqueItemsMap.values());
                  const hasSubItems = itemsToMap.length > 0;

                  return (
                    <li key={brand.id || brandIdx} className="relative group/bessBrand">
                      <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium">
                        <Link to={`/products/${bessSlug}/${bSlug}`} className="hover:text-slate-900 flex-1">
                          {brand.name}
                        </Link>
                        {hasSubItems && (
                          <span className="text-xl font-light leading-none transition-transform group-hover/bessBrand:translate-x-1 shrink-0 ml-2">
                            →
                          </span>
                        )}
                      </div>

                      {/* Level 3: Sub-Categories / Series / Products under Brand */}
                      {hasSubItems && (
                        <ul className="absolute top-0 left-full -ml-2 w-72 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover/bessBrand:opacity-100 group-hover/bessBrand:visible transition-all duration-200">
                          {itemsToMap.map((item: any, itemIdx: number) => {
                            const subSlug = item.slug || toSlug(item.name);
                            return (
                              <li key={item.id || itemIdx}>
                                <Link
                                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium leading-tight"
                                  to={`/products/${bessSlug}/${bSlug}/${subSlug}`}
                                >
                                  <span className="line-clamp-2">{item.name}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </li>

            {/* Services Dropdown (Feature Flag Toggled) */}
            {featureFlags.show_services && (
              <li className="relative group py-2">
                <Link
                  className="hover:text-brand-green transition-colors flex items-center gap-1.5"
                  to="/services"
                >
                  Services <span className="text-xs">▼</span>
                </Link>

                <ul className="absolute top-full left-0 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-[60] text-slate-800 py-2 mt-2">
                  <li>
                    <Link
                      className="block px-5 py-3 hover:bg-slate-50 border-b border-slate-100 font-bold text-base text-slate-900"
                      to="/services"
                    >
                      All Services
                    </Link>
                  </li>
                  {activeServices.map((service, sIdx) => (
                    <li key={sIdx}>
                      <Link
                        className="block px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium"
                        to={`/services/${service.slug}`}
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            )}

            <li>
              <Link className="hover:text-brand-green transition-colors" to="/careers">
                Careers
              </Link>
            </li>

            {/* Contents Dropdown */}
            <li className="relative group py-2">
              <span className="hover:text-brand-green transition-colors flex items-center gap-1.5 cursor-pointer">
                Contents <span className="text-xs">▼</span>
              </span>

              <ul className="absolute top-full left-0 w-60 bg-white border border-slate-200 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col z-[60] text-slate-800 py-2 mt-2">
                <li>
                  <Link
                    className="block px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium border-b border-slate-100"
                    to="/blogs"
                  >
                    Blogs & Insights
                  </Link>
                </li>
                <li>
                  <Link
                    className={`block px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium ${
                      featureFlags.show_videos ? 'border-b border-slate-100' : ''
                    }`}
                    to="/gallery"
                  >
                    Photo Gallery
                  </Link>
                </li>
                {featureFlags.show_videos && (
                  <li>
                    <Link
                      className="block px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-sm font-medium"
                      to="/media"
                    >
                      Video & Media Center
                    </Link>
                  </li>
                )}
              </ul>
            </li>
          </ul>

          {/* Right: Green Contact Us Button */}
          <div className="hidden lg:block">
            <Link
              className="bg-[#78C257] hover:bg-[#68ac49] text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 inline-block cursor-pointer"
              to="/contact"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full bg-white shadow-2xl border-b border-slate-200 px-6 py-6 flex flex-col gap-4 lg:hidden z-50 overflow-hidden font-medium text-slate-800"
          >
            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to={`/products/${bessSlug}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              BESS
            </Link>

            {featureFlags.show_services && (
              <Link
                className="hover:text-brand-green transition-colors py-1 text-base"
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
            )}

            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to="/careers"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Careers
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to="/blogs"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blogs & Insights
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1 text-base"
              to="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Photo Gallery
            </Link>

            {featureFlags.show_videos && (
              <Link
                className="hover:text-brand-green transition-colors py-1 text-base"
                to="/media"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Videos
              </Link>
            )}

            {/* Contact Quick Info on Mobile */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-xs text-slate-600 font-medium">
              <a href="tel:18002037228" className="flex items-center gap-2 hover:text-brand-green">
                <Phone className="w-3.5 h-3.5 text-brand-green" />
                <span>Toll Free: 1800 203 7228</span>
              </a>
              <a href="tel:8530853317" className="flex items-center gap-2 hover:text-brand-green">
                <Phone className="w-3.5 h-3.5 text-brand-green" />
                <span>Sales: 8530853317</span>
              </a>
              <span className="text-slate-400">Solar solutions across PAN India</span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                className="bg-[#78C257] hover:bg-[#68ac49] text-white px-6 py-3 rounded-full font-medium text-center text-sm shadow-sm block transition-colors"
                to="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;