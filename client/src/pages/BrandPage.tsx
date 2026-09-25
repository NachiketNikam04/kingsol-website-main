import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchLiveCatalog, Product, Brand, Category } from '../data/productsData';
import InquiryModal from '../components/InquiryModal';
import QuoteModal from '../components/QuoteModal';
import CTASection from '../components/CTASection';
import { shareUrl } from '../utils/share';

interface SubcategoryItem {
  id: number;
  name: string;
  slug: string;
}

export default function BrandPage() {
  const { categorySlug, brandSlug, subcategorySlug } = useParams<{
    categorySlug: string;
    brandSlug: string;
    subcategorySlug?: string;
  }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>(subcategorySlug || 'all');

  const [loading, setLoading] = useState(true);
  const [inquiryProduct, setInquiryProduct] = useState<string | null>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<string>('');

  useEffect(() => {
    async function loadBrandPageData() {
      setLoading(true);
      const data = await fetchLiveCatalog();
      const matchedCat = data.categories.find((c) => c.slug === categorySlug);
      const matchedBrand = data.brands.find((b) => b.slug === brandSlug);
      const matchedProducts = data.products.filter((p) => p.brand === brandSlug);

      setCategory(matchedCat || null);
      setBrand(matchedBrand || null);
      setProducts(matchedProducts);

      // Fetch subcategories for this brand
      if (matchedBrand) {
        try {
          const res = await fetch(`${API_BASE_URL}/subcategories?brandId=${matchedBrand.id || ''}`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setSubcategories(json.data);
          }
        } catch {
          // Fallback empty subcategories
        }
      }

      setLoading(false);
    }

    loadBrandPageData();
  }, [categorySlug, brandSlug]);

  useEffect(() => {
    if (subcategorySlug) {
      setActiveSubcategory(subcategorySlug);
    }
  }, [subcategorySlug]);

  if (loading) {
    return <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-center text-slate-500 font-medium">Loading brand page...</div>;
  }

  if (!brand || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf8] text-slate-900 pt-48 pb-24">
        <h1 className="text-3xl font-extrabold font-poppins mb-4">Brand Not Found</h1>
        <p className="text-slate-600 mb-8">The requested brand or category listing could not be found.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-[#44a0e3] transition-colors cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  // Filter products based on selected Subcategory ("All" includes all products, even those without a subcategory)
  const filteredProducts = products.filter((p: any) => {
    if (activeSubcategory === 'all') return true;
    return p.subcategory_slug === activeSubcategory || p.specs?.type?.toLowerCase() === activeSubcategory.toLowerCase();
  });

  const handleShareClick = async (productTitle: string, productSlug: string) => {
    const fullUrl = `${window.location.origin}/products/${category.slug}/${brand.slug}/${productSlug}`;
    await shareUrl(productTitle, `Check out ${productTitle} from ${brand.name} on Kingsol`, fullUrl);
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-0 text-slate-900 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-12 flex-wrap">
          <Link className="hover:text-slate-900 transition-colors" to="/">
            Home
          </Link>
          <span>/</span>
          <Link className="hover:text-slate-900 transition-colors" to="/products">
            Products
          </Link>
          <span>/</span>
          <Link className="hover:text-[#44a0e3] transition-colors" to={`/products/${category.slug}`}>
            {category.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{brand.name}</span>
        </div>

        {/* Brand Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xs mb-12 flex flex-col lg:flex-row gap-8 items-start justify-between"
        >
          <div className="max-w-3xl">
            <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
              AUTHORIZED MANUFACTURER
            </span>
            <h1 className="mt-2 text-4xl md:text-6xl font-extrabold font-poppins text-slate-900 mb-4">{brand.name}</h1>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">{brand.description}</p>

            {/* Certifications Badges */}
            {brand.certifications && (
              <div className="flex flex-wrap gap-2">
                {brand.certifications.map((cert: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-slate-50 text-slate-700 px-4 py-1.5 rounded-full border border-slate-200"
                  >
                    <span className="text-brand-orange">✓</span> {cert}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForQuote(brand.name);
                  setIsQuoteOpen(true);
                }}
                className="bg-brand-green text-slate-900 hover:bg-slate-900 hover:text-white px-7 py-3 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                <span>Get Quote</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0 self-center lg:self-start shadow-sm">
            <img src={getAssetUrl(brand.image)} alt={brand.name} className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Subcategory Series Tabs (e.g. All, On-Grid, Hybrid, Off-Grid) */}
        {subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex flex-wrap items-center gap-3 pb-4 mb-10"
          >
            <motion.button
              layout
              whileTap={{ scale: 0.95 }}
              transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
              onClick={() => {
                setActiveSubcategory('all');
                navigate(`/products/${category.slug}/${brand.slug}`);
              }}
              className={`px-7 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                activeSubcategory === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
              }`}
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.span
                  key={activeSubcategory === 'all' ? "active" : "inactive"}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -30, opacity: 0 }}
                  transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                  className="whitespace-nowrap inline-block"
                >
                  All {brand.name} Products
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {subcategories.map((sub) => {
              const isActive = activeSubcategory === sub.slug;
              return (
                <motion.button
                  key={sub.slug}
                  layout
                  whileTap={{ scale: 0.95 }}
                  transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                  onClick={() => {
                    setActiveSubcategory(sub.slug);
                    navigate(`/products/${category.slug}/${brand.slug}/${sub.slug}`);
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
                      {sub.name}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {/* Product Catalog Grid */}
        <div className="mb-24">
          <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-3xl font-bold font-poppins text-slate-900"
            >
              {activeSubcategory === 'all' ? 'All Products' : `${subcategories.find((s) => s.slug === activeSubcategory)?.name || activeSubcategory}`}
            </motion.h2>
            <button
              type="button"
              onClick={() => {
                setSelectedProductForQuote(brand.name);
                setIsQuoteOpen(true);
              }}
              className="bg-brand-green text-slate-900 hover:bg-slate-900 hover:text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Get Quote</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center text-slate-500 border border-slate-200">
              No products found under the selected subcategory. Select the "All" tab to view the complete range.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product: Product, pIdx: number) => (
                <motion.div
                  key={product.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: (pIdx % 3) * 0.1, ease: "easeOut" }}
                  className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col group hover:shadow-[0_20px_40px_rgba(243,156,18,0.15)] transition-all duration-300"
                >
                  <Link
                    to={`/products/${category.slug}/${brand.slug}/${product.slug}`}
                    className="w-full h-60 rounded-2xl overflow-hidden bg-slate-100 mb-6 relative block cursor-pointer"
                  >
                    <img
                      src={getAssetUrl(product.image)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>

                  <div className="flex-grow">
                    <Link to={`/products/${category.slug}/${brand.slug}/${product.slug}`}>
                      <h3 className="text-2xl font-bold font-poppins text-slate-900 mb-3 group-hover:text-[#44a0e3] transition-colors leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1 mb-6 line-clamp-2">{product.description}</p>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6 flex flex-col gap-2 text-xs text-slate-700 font-medium">
                      {product.specs?.wattage && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Power Rating:</span>
                          <span className="text-slate-900 font-bold">{product.specs.wattage}</span>
                        </div>
                      )}
                      {product.specs?.efficiency && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Efficiency:</span>
                          <span className="text-slate-900 font-bold">{product.specs.efficiency}</span>
                        </div>
                      )}
                      {product.specs?.warranty && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Warranty:</span>
                          <span className="text-[#78C257] font-bold">{product.specs.warranty}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleShareClick(product.name, product.slug)}
                        className="px-4 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                        title="Share Product"
                      >
                        Share
                      </button>

                      {product.datasheetUrl && (
                        <a
                          href={product.datasheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                        >
                          PDF
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProductForQuote(product.name);
                        setIsQuoteOpen(true);
                      }}
                      className="bg-brand-green text-slate-900 px-5 h-10 rounded-full text-xs font-bold hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                    >
                      Get Quote
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InquiryModal
        isOpen={Boolean(inquiryProduct)}
        onClose={() => setInquiryProduct(null)}
        prefilledItem={inquiryProduct || ''}
      />

      {/* Free Quote Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialProduct={selectedProductForQuote || brand.name}
      />

      <CTASection onQuoteClick={() => {
        setSelectedProductForQuote(brand.name);
        setIsQuoteOpen(true);
      }} />
    </div>
  );
}

export { BrandPage };
