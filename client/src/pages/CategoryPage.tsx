import { getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchLiveCatalog, Product, Brand, Category } from '../data/productsData';
import { InquiryModal } from '../components/InquiryModal';
import { CTASection } from '../components/CTASection';

function getSpecValue(specs: any, keyNames: string[], fallback: string): string {
  if (!specs || typeof specs !== 'object') return fallback;
  for (const k of keyNames) {
    const matched = Object.keys(specs).find(
      (key) => key.toLowerCase() === k.toLowerCase() || key.toLowerCase().includes(k.toLowerCase())
    );
    if (matched && specs[matched]) return String(specs[matched]);
  }
  return fallback;
}

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquiry Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<Product | null>(null);

  useEffect(() => {
    async function loadCategoryData() {
      setLoading(true);
      const data = await fetchLiveCatalog();

      const matchedCategory = data.categories.find((c) => c.slug === categorySlug);
      if (matchedCategory) {
        setCategory(matchedCategory);
        setBrands(data.brands.filter((b) => b.category === categorySlug));
        setProducts(data.products.filter((p) => p.category === categorySlug));
      } else {
        setCategory(null);
      }
      setLoading(false);
    }
    loadCategoryData();
  }, [categorySlug]);

  if (loading) {
    return <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-center text-slate-500 font-medium">Loading category...</div>;
  }

  // Dynamic Routing Resilience: Render 404 fallback if invalid category URL
  if (!category) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-slate-900 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-2xl mb-4">
          ?
        </div>
        <h1 className="text-4xl font-extrabold font-poppins mb-3">Category Not Found</h1>
        <p className="text-slate-600 mb-8 max-w-md">
          The product category <strong className="text-slate-900">'{categorySlug}'</strong> does not exist in our catalog database.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#44a0e3] hover:text-slate-900 transition-colors cursor-pointer"
        >
          Return to Product Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-[72px] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-8 font-medium">
          <Link to="/products" className="hover:text-slate-900 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{category.name}</span>
        </div>

        {/* Category Header Banner */}
        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
          >
            PRODUCT CATEGORY
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-5 font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900 leading-tight max-w-3xl"
          >
            {category.name} <span className="text-[#44a0e3]">Catalog</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal"
          >
            {category.tagline || category.description || 'Explore authorized products and partner brands.'}
          </motion.p>
        </div>

        {/* PARTNER BRANDS FOR THIS CATEGORY */}
        {brands.length > 0 && (
          <section className="mb-12">
            <div className="mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-1 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
              >
                Authorized Brands in {category.name}
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brands.map((brand, idx) => (
                <motion.div
                  key={brand.slug}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: (idx % 3) * 0.1, ease: "easeOut" }}
                  className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all group"
                >
                  <div>
                    {/* 1. Large Enriched Image Container */}
                    <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 bg-slate-50 border border-slate-100 flex items-center justify-center relative">
                      <img
                        src={getAssetUrl(brand.card_image || brand.cardImage || brand.image || (brand as any).image_url)}
                        alt={brand.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* 2. Brand Name & Truncated Description */}
                    <h3 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 mb-2 tracking-tight">
                      {brand.name}
                    </h3>
                    <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1 line-clamp-3 mb-4">
                      {brand.description || 'Authorized tier-1 solar component manufacturer providing high-performance equipment and factory support.'}
                    </p>

                    {/* 3. Certificates Trust Badges */}
                    <div className="mb-6 pt-3 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Certifications:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(brand.certifications && brand.certifications.length > 0
                          ? brand.certifications
                          : ['IEC 61215', 'ALMM', 'ISO 9001', 'CE']
                        ).slice(0, 4).map((cert: string, i: number) => (
                          <span
                            key={i}
                            className="bg-slate-100/80 text-slate-700 text-[10px] md:text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200/60 flex items-center gap-1 shadow-2xs"
                          >
                            <span className="text-brand-green font-bold text-xs">✓</span> {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/products/${category.slug}/${brand.slug}`}
                    className="w-full bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white text-xs font-bold py-3 rounded-full block text-center transition-colors shadow-xs"
                  >
                    View {brand.name} Products <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* PRODUCTS LIST IN THIS CATEGORY */}
        <section className="mb-12">
          <div className="mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
            >
              All {category.name} Components
            </motion.h2>
          </div>
          {products.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center text-slate-500 border border-slate-200">
              No products currently available in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {products.map((product, idx) => {
                const ratingVal = getSpecValue(product.specs, ['rating', 'efficiency', 'eff'], '21.5%');
                const wattageVal = getSpecValue(product.specs, ['wattage', 'power', 'watt', 'power output'], '550W');
                const cellTypeVal = getSpecValue(product.specs, ['celltype', 'cell type', 'cell', 'type', 'technology'], 'Mono PERC');
                const warrantyVal = getSpecValue(product.specs, ['warranty', 'guarantee'], '25 Years');

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: (idx % 3) * 0.1, ease: "easeOut" }}
                    className="bg-white rounded-[2rem] p-4 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group"
                  >
                    <div>
                      {/* 1. Image Area with Floating Brand Pill */}
                      <div className="h-44 rounded-2xl overflow-hidden mb-3 bg-slate-50 relative border border-slate-100">
                        <img
                          src={getAssetUrl(product.card_image || product.cardImage || product.image)}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-slate-800 border border-slate-200/60 shadow-xs z-10">
                          {product.brandName || 'Solar Brand'}
                        </span>
                      </div>

                      {/* 2. Text & Description Truncation */}
                      <h3 className="text-base md:text-lg font-bold font-poppins text-slate-900 leading-snug truncate mb-1">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1 line-clamp-2 mb-3">
                        {product.description || 'High-efficiency engineered solar component with factory direct warranty support.'}
                      </p>

                      {/* 3. Technical Specs 2x2 Grid */}
                      <div className="bg-slate-50 rounded-2xl p-3 mb-4 border border-slate-100/80">
                        <div className="grid grid-cols-2 gap-2 text-left">
                          <div className="bg-white rounded-xl p-2 border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">RATING</span>
                            <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">{ratingVal}</span>
                          </div>
                          <div className="bg-white rounded-xl p-2 border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WATTAGE</span>
                            <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">{wattageVal}</span>
                          </div>
                          <div className="bg-white rounded-xl p-2 border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">CELLTYPE</span>
                            <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">{cellTypeVal}</span>
                          </div>
                          <div className="bg-white rounded-xl p-2 border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">WARRANTY</span>
                            <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">{warrantyVal}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4. Action Buttons */}
                    <div className="flex items-center gap-2 mt-auto pt-1">
                      <Link
                        to={`/products/${product.category}/${product.brand}/${product.slug}`}
                        className="w-1/2 py-2.5 px-3 rounded-full bg-slate-900 text-white text-xs font-bold text-center hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        View Specs
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProductForInquiry(product);
                          setIsInquiryModalOpen(true);
                        }}
                        className="w-1/2 py-2.5 px-3 rounded-full bg-brand-green text-slate-900 text-xs font-bold text-center hover:bg-[#8ee036] transition-colors shadow-xs cursor-pointer"
                      >
                        Quick Quote
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        productName={selectedProductForInquiry?.name}
      />

      {/* CTA Section Banner */}
      <CTASection />
    </div>
  );
}

export { CategoryPage };
