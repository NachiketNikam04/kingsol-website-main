import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchLiveCatalog, Product, Brand, Category } from '../data/productsData';
import { InquiryModal } from '../components/InquiryModal';

interface ProductsPageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
  brands_tagline: string;
  brands_title: string;
  products_tagline: string;
  products_title: string;
}

export default function Products() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<ProductsPageSettings>({
    tagline: 'PORTFOLIO & PRODUCTS',
    headline: 'Authorized Tier-1 Solar Catalog.',
    highlight_word: 'Catalog.',
    subtitle: 'Explore authorized photovoltaic modules, string & hybrid inverters, and DC cabling systems engineered for commercial and industrial energy projects.',
    brands_tagline: 'AUTHORIZED MANUFACTURERS',
    brands_title: 'Partner Brands',
    products_tagline: 'COMPONENT SPECIFICATIONS',
    products_title: 'Featured Components',
  });
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeBrandFilter, setActiveBrandFilter] = useState<string>('all');

  // Inquiry Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const [catalogData, settingsRes] = await Promise.all([
          fetchLiveCatalog(),
          fetch(`${API_BASE_URL}/catalog/page-settings`).then((res) => res.json()).catch(() => null),
        ]);

        setCategories(catalogData.categories);
        setBrands(catalogData.brands);
        setProducts(catalogData.products);

        if (settingsRes && settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data);
        }
      } catch (err) {
        console.warn('⚠️ [Products] Error loading products data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Case-Insensitive Regex Splitter for Headline
  const renderHeadline = () => {
    const rawHeadline = settings.headline || 'Authorized Tier-1 Solar Catalog.';
    const highlightWord = settings.highlight_word?.trim();

    if (!highlightWord) return rawHeadline;

    const escapedHighlight = highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = rawHeadline.split(regex);

    return parts.map((part, idx) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={idx} className="text-[#44a0e3]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Filter out empty categories for public view with robust slug & name matching
  const activeNonEmptyCategories = categories.filter((cat) => {
    const hasBrands = brands.some((b) => b.category === cat.slug || b.category === cat.name || b.categorySlug === cat.slug);
    const hasProducts = products.some((p) => p.category === cat.slug || p.category === cat.name || p.categorySlug === cat.slug);
    const countCheck = (cat.brand_count && cat.brand_count > 0) || (cat.product_count && cat.product_count > 0);
    return hasBrands || hasProducts || countCheck;
  });

  // Filtered Brands
  const filteredBrands = brands.filter((b) => {
    if (activeCategory === 'all') return true;
    const catName = categories.find((c) => c.slug === activeCategory)?.name;
    return b.category === activeCategory || b.category === catName || b.categorySlug === activeCategory;
  });

  // Filtered Products (Bulletproof category & brand matching)
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      activeCategory === 'all' ||
      p.category === activeCategory ||
      p.category === categories.find((c) => c.slug === activeCategory)?.name ||
      p.categorySlug === activeCategory;

    const matchesBrand =
      activeBrandFilter === 'all' ||
      p.brand === activeBrandFilter ||
      p.brand === brands.find((b) => b.slug === activeBrandFilter)?.name ||
      p.brandSlug === activeBrandFilter;

    return matchesCat && matchesBrand;
  });

  const handleOpenInquiry = (product?: Product) => {
    setSelectedProductForInquiry(product || null);
    setIsInquiryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-[72px] text-slate-900 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            {settings.tagline || 'PORTFOLIO & PRODUCTS'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
          >
            {renderHeadline()}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal"
          >
            {settings.subtitle}
          </motion.p>
        </div>

        {/* Dynamic Category Tabs Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap items-center gap-3 mb-12"
        >
          <motion.button
            layout
            whileTap={{ scale: 0.95 }}
            transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
            onClick={() => {
              setActiveCategory('all');
              setActiveBrandFilter('all');
            }}
            className={`px-7 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
              activeCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={activeCategory === 'all' ? "active" : "inactive"}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                className="whitespace-nowrap inline-block"
              >
                All Categories
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {activeNonEmptyCategories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <motion.button
                key={cat.slug}
                layout
                whileTap={{ scale: 0.95 }}
                transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                onClick={() => {
                  setActiveCategory(cat.slug);
                  setActiveBrandFilter('all');
                }}
                className={`px-7 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={isActive ? "active" : "inactive"}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                    className="whitespace-nowrap inline-block"
                  >
                    {cat.name}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading live solar component catalog...</div>
        ) : (
          <>
            {/* PARTNER BRANDS SECTION */}
            <section className="mb-12">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <motion.span
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
                  >
                    {settings.brands_tagline || 'AUTHORIZED MANUFACTURERS'}
                  </motion.span>
                  <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mt-5 text-2xl font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-tight"
                  >
                    {settings.brands_title || 'Partner Brands'}
                  </motion.h2>
                </div>
                {activeCategory !== 'all' && (
                  <Link
                    to={`/products/${activeCategory}`}
                    className="text-xs font-bold text-[#44a0e3] hover:underline"
                  >
                    View Dedicated Category Page →
                  </Link>
                )}
              </div>

              {/* Brand Cards Layout (Larger, Left-Aligned Auto-Wrap, 3 per row) */}
              <div className="flex flex-wrap justify-start gap-8">
                {filteredBrands.map((brand, idx) => (
                  <motion.div
                    key={brand.slug}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: (idx % 3) * 0.1, ease: "easeOut" }}
                    className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] flex flex-col"
                  >
                    <Link
                      to={`/products/${brand.category}/${brand.slug}`}
                      className="w-full h-full bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div>
                        {/* 1. Large Enriched Image Container (No p-4, uses object-contain) */}
                        <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                          <img
                            src={getAssetUrl(brand.card_image || brand.cardImage || brand.image || (brand as any).image_url)}
                            alt={brand.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>

                        {/* 2. Brand Name & Truncated Description */}
                        <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-2 tracking-tight">
                          {brand.name}
                        </h3>
                        <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
                          {brand.description || 'Authorized tier-1 solar component manufacturer providing high-performance equipment and factory support.'}
                        </p>

                        {/* 3. Certificates Trust Badges (Strictly Dynamic & Field-Agnostic) */}
                        {(() => {
                          // Bypass strict TS interface to safely check all possible backend fields
                          const b = brand as any; 
                          const activeCerts = (b.certifications && b.certifications.length > 0) ? b.certifications
                                            : (b.certifications_list && b.certifications_list.length > 0) ? b.certifications_list
                                            : (b.badges && b.badges.length > 0) ? b.badges
                                            : [];

                          // If the final array is empty or not an array, hide the section entirely
                          if (!Array.isArray(activeCerts) || activeCerts.length === 0) return null;

                          return (
                            <div className="mb-6 pt-3 border-t border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Certifications:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {/* Slices exactly 3 real certifications */}
                                {activeCerts.slice(0, 3).map((cert: string, i: number) => (
                                  <span
                                    key={i}
                                    className="bg-slate-100/80 text-slate-700 text-[10px] md:text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/60 flex items-center gap-1 shadow-2xs"
                                  >
                                    <span className="text-brand-green font-bold text-xs">✓</span> {cert}
                                  </span>
                                ))}
                                
                                {/* Renders a "+X more" badge if the array exceeds 3 items */}
                                {activeCerts.length > 3 && (
                                  <span className="bg-slate-50 text-slate-500 text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 flex items-center shadow-2xs tracking-widest">
                                    +{activeCerts.length - 3} MORE
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="w-full bg-slate-900 group-hover:bg-brand-green group-hover:text-slate-900 text-white text-xs font-bold py-3 rounded-full block text-center transition-colors shadow-xs">
                        Explore {brand.name} Range →
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* INDIVIDUAL PRODUCTS GRID */}
            <section className="mb-12">
              {/* Top Row: Section Title & Kicker */}
              <div className="mb-6">
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
                >
                  {settings.products_tagline || 'COMPONENT SPECIFICATIONS'}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mt-5 text-2xl font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-tight"
                >
                  {settings.products_title || 'Featured Components'}
                </motion.h2>
              </div>

              {/* Bottom Row: Modern Horizontal Scrolling Brand Filter (Only shows if brands exist) */}
              {filteredBrands.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 w-full py-3 mb-8 bg-white/60 backdrop-blur-xs rounded-2xl px-4 border border-slate-200/60 shadow-2xs">
                  <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase shrink-0">
                    Filter Brand:
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2.5 py-1 w-full sm:w-auto">
                    <motion.button
                      layout
                      whileTap={{ scale: 0.95 }}
                      transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                      onClick={() => setActiveBrandFilter('all')}
                      className={`text-sm px-6 py-2.5 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                        activeBrandFilter === 'all'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <AnimatePresence initial={false} mode="popLayout">
                        <motion.span
                          key={activeBrandFilter === 'all' ? "active" : "inactive"}
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -30, opacity: 0 }}
                          transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                          className="whitespace-nowrap inline-block"
                        >
                          All Brands
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>

                    {filteredBrands.map((b) => {
                      const isActive = activeBrandFilter === b.slug;
                      return (
                        <motion.button
                          key={b.slug}
                          layout
                          whileTap={{ scale: 0.95 }}
                          transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                          onClick={() => setActiveBrandFilter(b.slug)}
                          className={`text-sm px-6 py-2.5 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 border flex items-center gap-2 ${
                            isActive
                              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
                          }`}
                        >
                          <AnimatePresence initial={false} mode="popLayout">
                            <motion.span
                              key={isActive ? "active" : "inactive"}
                              initial={{ y: 30, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -30, opacity: 0 }}
                              transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                              className="whitespace-nowrap inline-block"
                            >
                              {b.name}
                            </motion.span>
                          </AnimatePresence>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-12 text-center text-slate-500 border border-slate-200">
                  No products found for the selected category filter.
                </div>
              ) : (
                /* Product Cards Layout (Smaller, Left-Aligned Auto-Wrap, 4 per row) */
                <div className="flex flex-wrap justify-start gap-6">
                  {filteredProducts.map((product, idx) => {
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, delay: (idx % 4) * 0.1, ease: "easeOut" }}
                        className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.2rem)] flex flex-col"
                      >
                        {/* Main Card Container */}
                        <div className="w-full h-full bg-white rounded-[2rem] p-4 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group">
                          <div>
                            {/* 1. Image Area with Floating Brand Pill (Uses object-contain and flex-center) */}
                            <div className="h-44 rounded-2xl overflow-hidden mb-3 bg-slate-50 relative border border-slate-100 flex items-center justify-center">
                              <img
                                src={getAssetUrl(product.card_image || product.cardImage || product.image)}
                                alt={product.name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-slate-800 shadow-xs border border-slate-200/80 z-10 uppercase tracking-wider">
                                {product.brandName || 'Solar Brand'}
                              </span>
                            </div>

                            {/* 2. Title & Description Truncation */}
                            <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-snug line-clamp-1 mb-1">
                              {product.name}
                            </h3>
                            <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1 line-clamp-2 mb-3">
                              {product.description || 'High-efficiency engineered solar component with factory direct warranty support.'}
                            </p>

                            {/* 3. Technical Specs Box (Dynamic 2x2 Grid) */}
                            {product.specs && Object.keys(product.specs).length > 0 ? (
                              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/80 mb-4">
                                <div className="grid grid-cols-2 gap-2 text-left">
                                  {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                                    <div key={key} className="p-2 bg-white rounded-xl border border-slate-100">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                                        {key}
                                      </span>
                                      <span className="text-xs font-bold text-slate-900 truncate block mt-0.5" title={String(val)}>
                                        {String(val)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              /* Empty State Placeholder to keep card heights uniform */
                              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/80 mb-4 h-[76px] flex items-center justify-center">
                                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                  Specifications Pending
                                </span>
                              </div>
                            )}
                          </div>

                          {/* 4. Action Buttons (Side-by-Side) */}
                          <div className="flex items-center gap-2 mt-auto pt-1">
                            <Link
                              to={`/products/${product.category}/${product.brand}/${product.slug}`}
                              className="flex-1 py-2.5 px-3 rounded-full bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition-colors shadow-xs"
                            >
                              View Specs
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenInquiry(product)}
                              className="flex-1 py-2.5 px-3 rounded-full bg-brand-green text-slate-900 text-xs font-bold text-center hover:bg-[#8ee036] transition-colors shadow-xs cursor-pointer"
                            >
                              Quick Quote
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        productName={selectedProductForInquiry?.name}
      />
    </div>
  );
}

export { Products };