import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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

  // Fallback Product Categories Data
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

  const activeCategories = productCategories.length > 0 ? productCategories : fallbackCategories;
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

    // Default fallback: keep newly added items at the bottom in ascending order (by ID or creation date)
    return (a.id || 0) - (b.id || 0);
  });

  const toSlug = (text: string) => (text || '').toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  return (
    <motion.header
      variants={{
        visible: { y: 0, x: "-50%" },
        hidden: { y: "-150%", x: "-50%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-3 left-1/2 -translate-x-1/2 w-[90%] sm:w-[85%] lg:w-[80%] max-w-7xl z-50 bg-gradient-to-r from-white/95 via-white/50 to-white/20 backdrop-blur-md border border-slate-200/90 shadow-lg shadow-indigo-500/10 rounded-full pr-4 sm:pr-6 lg:pr-10 pl-3 sm:pl-4 py-1 sm:py-1.5"
    >
      <div className="flex items-center justify-between">
        {/* Dynamic Company Logo Image and Mobile Hamburger Toggle */}
        <div className="flex justify-between items-center w-full lg:w-auto">
          <Link className="flex items-center gap-3" to="/" onClick={() => setIsMobileMenuOpen(false)}>
            <img
              src={logoUrl ? getAssetUrl(logoUrl) : '/logo.png'}
              alt="Kingsol Solar Energy"
              className="h-12 sm:h-14 md:h-16 w-auto max-w-[160px] sm:max-w-[200px] object-contain"
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

        {/* Ordered Navigation List with Dynamic Products and Services Dropdowns */}
        <ul className="hidden lg:flex items-center gap-8 text-lg font-medium transition-colors text-slate-800">
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
                          const isInverterCat = cSlug.toLowerCase().includes('inverter') || cat.name.toLowerCase().includes('inverter');
                          const rawSubItems = isInverterCat ? (brand.subcategories || []) : (brand.products || []);

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

                              {/* Level 4: Sub-Items (Inverter Categories or Non-Inverter Products) */}
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

          {/* DYNAMIC SERVICES DROPDOWN (Feature Flag Toggled) */}
          {featureFlags.show_services && (
            <li className="relative group py-2">
              <Link
                className="hover:text-brand-green transition-colors flex items-center gap-1.5"
                to="/services"
              >
                Services <span className="text-xs">▼</span>
              </Link>

              {/* Services Dropdown Menu */}
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
          {/* CONTENTS DROPDOWN (Blogs, Gallery, Media) */}
          <li className="relative group py-2">
            <span className="hover:text-brand-green transition-colors flex items-center gap-1.5 cursor-pointer">
              Contents <span className="text-xs">▼</span>
            </span>

            {/* Contents Dropdown Menu */}
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

        {/* CTA Button in Navbar */}
        <div className="hidden lg:block">
          <Link
            className="bg-[#b7f07a] text-slate-900 px-6 py-2.5 rounded-full font-medium text-sm transition-transform hover:-translate-y-0.5 shadow-sm inline-block"
            to="/contact"
          >
            Contact Us
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown (Framer Motion) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl rounded-2xl mt-4 p-6 flex flex-col gap-4 lg:hidden z-50 border border-slate-100 font-medium text-slate-800"
          >
            <Link
              className="hover:text-brand-green transition-colors py-1"
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1"
              to="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1"
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>

            {featureFlags.show_services && (
              <Link
                className="hover:text-brand-green transition-colors py-1"
                to="/services"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
            )}

            <Link
              className="hover:text-brand-green transition-colors py-1"
              to="/careers"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Careers
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1"
              to="/blogs"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blogs & Insights
            </Link>

            <Link
              className="hover:text-brand-green transition-colors py-1"
              to="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Photo Gallery
            </Link>

            {featureFlags.show_videos && (
              <Link
                className="hover:text-brand-green transition-colors py-1"
                to="/media"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Videos
              </Link>
            )}

            <div className="pt-2 border-t border-slate-100">
              <Link
                className="bg-[#b7f07a] text-slate-900 px-6 py-3 rounded-full font-medium text-center text-sm shadow-sm block hover:bg-[#a5e665] transition-colors"
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