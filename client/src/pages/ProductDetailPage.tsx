import { getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchLiveCatalog, Product, Brand, Category } from '../data/productsData';
import InquiryModal from '../components/InquiryModal';
import CTASection from '../components/CTASection';
import { shareUrl } from '../utils/share';

export default function ProductDetailPage() {
  const { categorySlug, brandSlug, productSlug } = useParams<{
    categorySlug: string;
    brandSlug: string;
    productSlug: string;
  }>();
  const navigate = useNavigate();
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const [category, setCategory] = useState<Category | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchLiveCatalog();
      const matchedCat = data.categories.find((c) => c.slug === categorySlug);
      const matchedBrand = data.brands.find((b) => b.slug === brandSlug);
      const matchedProd = data.products.find((p) => p.slug === productSlug);

      setCategory(matchedCat || null);
      setBrand(matchedBrand || null);
      setProduct(matchedProd || null);
      if (matchedProd) {
        setSelectedImage(matchedProd.image);
      }
      setLoading(false);
    }
    loadData();
  }, [categorySlug, brandSlug, productSlug]);

  if (loading) {
    return <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-center text-slate-500 font-medium">Loading product specs...</div>;
  }

  if (!product || !brand || !category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf8] text-slate-900 pt-48 pb-24">
        <h1 className="text-3xl font-extrabold font-lato mb-4">Product Not Found</h1>
        <p className="text-slate-600 mb-8">The requested component does not exist in our catalog database.</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-[#44a0e3] transition-colors cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const handleShare = async () => {
    await shareUrl(
      product.name,
      `Check out ${product.name} from ${brand.name} on Kingsol`,
      window.location.href
    );
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
          <Link
            className="hover:text-slate-900 transition-colors"
            to={`/products/${category.slug}`}
          >
            {category.name}
          </Link>
          <span>/</span>
          <Link
            className="hover:text-slate-900 transition-colors"
            to={`/products/${category.slug}/${brand.slug}`}
          >
            {brand.name}
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{product.name}</span>
        </div>

        {/* Product Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 items-start">
          {/* Left: Image Gallery (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col gap-4"
          >
            <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 shadow-lg relative">
              <img src={getAssetUrl(selectedImage || product.image)} alt={product.name} className="w-full h-full object-cover" />
            </div>

            {/* Thumbnail Selectors */}
            {gallery.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {gallery.map((imgUrl: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === imgUrl ? 'border-[#44a0e3] scale-105 shadow-md' : 'border-slate-200 opacity-70'
                    }`}
                  >
                    <img src={getAssetUrl(imgUrl)} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Technical Details & CTA (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#44a0e3]/10 text-[#44a0e3] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
                  {brand.name}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500 uppercase">{category.name}</span>
              </div>

              <h1 className="mt-5 text-4xl md:text-5xl font-extrabold font-lato text-slate-900 leading-tight max-w-3xl tracking-tight">
                {product.name}
              </h1>

              <p className="text-slate-600 text-lg leading-relaxed mb-8">{product.description}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <button
                  onClick={() => setInquiryOpen(true)}
                  className="bg-white text-slate-900 px-8 py-4 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-1 shadow-md hover:bg-[#9beb46] hover:text-slate-900 hover:shadow-[0_20px_40px_rgba(243,156,18,0.15)] flex items-center gap-2 cursor-pointer border border-slate-200/60 hover:border-transparent justify-center"
                >
                  <span>Request Quote / Inquiry</span>
                  <span>→</span>
                </button>

                {product.datasheetUrl && (
                  <a
                    href={getAssetUrl(product.datasheetUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-colors gap-2 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                    <span>Download PDF Datasheet</span>
                  </a>
                )}

                <button
                  onClick={handleShare}
                  className="px-5 py-4 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 text-sm font-semibold hover:bg-slate-900 hover:text-white transition-colors gap-2 cursor-pointer"
                  title="Share Product"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            {/* Technical Track Record & Expertise */}
            {product.expertise && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs mb-8"
              >
                <h3 className="text-xl font-bold font-lato text-slate-900 mb-3">Engineering Expertise & Track Record</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{product.expertise}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Specifications Table Section */}
        <div className="mb-24 border-t border-slate-200 pt-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl font-bold font-lato text-slate-900 mb-8"
          >
            Full Technical Specifications
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-xs"
          >
            <table className="w-full text-left border-collapse">
              <tbody>
                {Object.entries(product.specs || {}).map(([key, val], idx) => {
                  if (!val) return null;
                  const label = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase());
                  return (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70 border-y border-slate-100'}
                    >
                      <td className="px-8 py-4 text-sm font-semibold text-slate-500 w-1/3 uppercase tracking-wider">
                        {label}
                      </td>
                      <td className="px-8 py-4 text-base font-bold text-slate-900">{val}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        prefilledItem={`${product.name} (${brand.name})`}
      />

      <CTASection />
    </div>
  );
}

export { ProductDetailPage };
