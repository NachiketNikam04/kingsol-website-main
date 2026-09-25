import { API_BASE_URL, getAssetUrl, parseDatasheets } from '../utils/assetUrl';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  FileText,
  Download,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import QuoteModal from '../components/QuoteModal';
import { CTASection } from '../components/CTASection';

interface BrandDoc {
  title: string;
  url: string;
}

export interface CategorizedFeatureGroup {
  category: string;
  features: string[];
}

interface BrandHighlightItem {
  id?: number;
  title: string;
  subtitle: string;
}

interface BrandData {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  image_url: string;
  certifications?: string[];
  gallery?: string[];
  key_features?: string[];
  highlights?: string[];
  documents?: BrandDoc[];
  specs_image_url?: string;
  specifications_list?: string[];
  product_range_description?: string;
  product_range_features?: string[];
  specs_description?: string;
  certifications_list?: string[];
  product_range_subtitle?: string;
  company_profile_text?: string;
  company_profile_image_url?: string;
  categorized_features?: CategorizedFeatureGroup[];
  badges?: string[];
  capabilities_tagline?: string;
  capabilities_heading?: string;
  brand_highlights?: BrandHighlightItem[];
  footer_note?: string;
  category_name?: string;
  category_slug?: string;
}

interface ProductData {
  id: number;
  slug: string;
  title: string;
  name?: string;
  description: string;
  image_url: string;
  card_image?: string;
  datasheet_url?: string;
  brand_name?: string;
  brand_slug?: string;
  category_name?: string;
  category_slug?: string;
  specs?: Record<string, string>;
}

interface CatalogSettings {
  brand_story_tagline?: string;
  brand_story_title?: string;
  features_title?: string;
  capabilities_title?: string;
  capabilities_footer?: string;
  docs_tagline?: string;
  docs_title?: string;
  docs_subtitle?: string;
  slider_tagline?: string;
  alternate_layout?: boolean;
}

export default function BrandDetail() {
  const { categorySlug, brandSlug } = useParams<{ categorySlug: string; brandSlug: string }>();

  const [brand, setBrand] = useState<BrandData | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [settings, setSettings] = useState<CatalogSettings>({
    brand_story_tagline: 'BRAND BACKGROUND & ARCHITECTURE',
    brand_story_title: 'Engineering & Technology Story',
    features_title: 'Key Features & Standards',
    capabilities_title: 'Brand Highlights',
    capabilities_footer: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
    docs_tagline: 'TECHNICAL DOCUMENTATION',
    docs_title: 'Downloadable Specs & Certifications',
    docs_subtitle: 'Official Manufacturer Datasheets & Compliance PDFs',
    slider_tagline: 'COMPONENT CATALOG PORTFOLIO',
    alternate_layout: true,
  });
  const [loading, setLoading] = useState(true);

  // Horizontal Slider Ref
  const sliderRef = useRef<HTMLDivElement>(null);

  // Quote Modal State
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState<string>('');

  // Top Expandable Datasheets State & Ref
  const [isDatasheetOpen, setIsDatasheetOpen] = useState<boolean>(false);
  const datasheetRef = useRef<HTMLDivElement>(null);

  // Close datasheet dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datasheetRef.current && !datasheetRef.current.contains(event.target as Node)) {
        setIsDatasheetOpen(false);
      }
    }
    if (isDatasheetOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatasheetOpen]);

  // Dynamic brand datasheets (shared between top action button and bottom section)
  const brandDatasheets = useMemo(() => {
    if (!brand) return [];
    return parseDatasheets(brand.documents || (brand as any).datasheets);
  }, [brand]);

  // Dynamic brand product categories filter
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const availableCategories = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => {
      const slug = p.category_slug || (p.specs?.type ? p.specs.type.toLowerCase().replace(/\s+/g, '-') : null);
      const name = p.category_name || p.specs?.type || (slug ? slug.replace(/-/g, ' ') : null);
      if (slug && name && !map.has(slug)) {
        map.set(slug, name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (activeCategoryFilter === 'all') return products;
    return products.filter((p) => {
      const slug = p.category_slug || (p.specs?.type ? p.specs.type.toLowerCase().replace(/\s+/g, '-') : null);
      return slug === activeCategoryFilter;
    });
  }, [products, activeCategoryFilter]);

  useEffect(() => {
    async function loadBrandDetails() {
      if (!brandSlug) return;
      setLoading(true);
      try {
        const [brandRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/brands/${brandSlug}`),
          fetch(`${API_BASE_URL}/catalog/page-settings`).then((r) => r.json()).catch(() => null),
        ]);

        if (!brandRes.ok) throw new Error('Failed to fetch brand details');
        const json = await brandRes.json();
        if (json.success && json.data) {
          setBrand(json.data.brand);
          setProducts(json.data.products || []);
        }

        if (settingsRes && settingsRes.success && settingsRes.data) {
          setSettings((prev) => ({ ...prev, ...settingsRes.data }));
        }
      } catch (err) {
        console.warn('⚠️ [BrandDetail] Offline or fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrandDetails();
  }, [brandSlug]);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-24 flex items-center justify-center text-slate-500 font-medium">
        Loading enterprise brand showcase...
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-24 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-poppins text-slate-900 mb-2">Brand Showcase Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">
            The requested manufacturer brand slug does not exist in our catalog database.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-full hover:bg-brand-green hover:text-slate-900 transition-colors"
          >
            ← Return to Products Catalog
          </Link>
        </div>
      </div>
    );
  }

  const formattedCategoryName = brand.category_name || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Category');

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-36 pb-[72px] text-slate-900 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/products" className="hover:text-brand-green transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link
            to={`/products/${brand.category_slug || categorySlug}`}
            className="text-slate-700 capitalize hover:text-brand-green transition-colors"
          >
            {formattedCategoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{brand.name}</span>
        </div>

        {/* HERO SECTION: IMAGE ON LEFT (lg:col-span-6), TEXT ON RIGHT (lg:col-span-6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-10">
          {/* Main Hero Cover Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <div className="bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-xs">
              <div className="h-80 md:h-[26rem] rounded-[2rem] overflow-hidden bg-white p-6 relative group border border-slate-100">
                <img
                  src={getAssetUrl(brand.image_url)}
                  alt={brand.name}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </motion.div>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
                AUTHORIZED MANUFACTURER SHOWCASE
              </span>
            </div>

            <h1 className="mt-5 font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900 leading-tight max-w-3xl">
              {brand.name}
            </h1>

            {/* 1. Rendering Pill Badges */}
            <div className="flex flex-wrap gap-2.5 my-5">
              {(brand.badges && brand.badges.length > 0
                ? brand.badges
                : (brand.certifications && brand.certifications.length > 0 ? brand.certifications : ['Tier-1 Listed', 'ALMM Approved', 'TUV Certified', '25-Year Warranty'])
              ).map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50/60 border border-blue-200/60 text-slate-800 rounded-full text-xs font-medium"
                >
                  <Award className="w-4 h-4 text-green-600" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>

            <p className="mt-4 font-poppins text-base md:text-lg text-slate-700 leading-relaxed mb-5">
              {brand.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForQuote(brand.name);
                  setIsQuoteOpen(true);
                }}
                className="bg-brand-green text-slate-900 hover:bg-slate-900 hover:text-white px-8 py-3.5 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>Get Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Top Expandable Datasheet Action Button & Dropdown */}
              {brandDatasheets.length > 0 && (
                <div className="relative" ref={datasheetRef}>
                  <button
                    type="button"
                    onClick={() => setIsDatasheetOpen((prev) => !prev)}
                    className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 px-5 py-3.5 rounded-full font-bold text-xs md:text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#0078C8]" />
                    <span>Datasheets & Specs ({brandDatasheets.length})</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        isDatasheetOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isDatasheetOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white border border-slate-200 shadow-xl rounded-2xl p-3 z-30 space-y-2"
                      >
                        <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Available Documents ({brandDatasheets.length})
                          </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                          {brandDatasheets.map((sheet, idx) => (
                            <a
                              key={idx}
                              href={getAssetUrl(sheet.file_url || sheet.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition border border-slate-150 group/sheet"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <FileText className="w-4 h-4 text-[#0078C8] shrink-0" />
                                <span className="font-medium text-slate-800 text-sm truncate group-hover/sheet:text-[#0078C8] transition-colors">
                                  {sheet.title || 'Brand Datasheet'}
                                </span>
                              </div>
                              <Download className="w-4 h-4 text-[#0078C8] shrink-0 group-hover/sheet:scale-110 transition-transform" />
                            </a>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* BRAND BACKGROUND & ARCHITECTURE / ENGINEERING STORY (Text-Only Full-Width Container) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xs mb-10 w-full max-w-none"
        >
          <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
            {settings.brand_story_tagline || 'BRAND BACKGROUND & ARCHITECTURE'}
          </span>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight">
            {settings.brand_story_title || 'Engineering & Technology Story'}
          </h2>
          <p className="text-slate-600 leading-relaxed font-normal text-base md:text-lg mt-6 mb-8">
            {brand.long_description || brand.description}
          </p>

          {/* Key Features & Standards Checklist (2-Column Grid) */}
          <div className="pt-8 border-t border-slate-100 mt-6">
            <h3 className="mb-4 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight">
              {settings.features_title || 'Key Features & Standards'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(brand.key_features && brand.key_features.length > 0
                ? brand.key_features
                : [
                    'Multi-busbar cell technology for reduced internal resistance',
                    'IEC 61215 & IEC 61730 International Quality Standards',
                    'High wind pressure (2400 Pa) and snow load (5400 Pa) compliance',
                    'Anti-PID cell technology preventing potential induced degradation',
                  ]
              ).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span className="text-slate-800 text-sm leading-relaxed font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CORPORATE CAPABILITIES HIGHLIGHTS CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="bg-white text-slate-900 border border-slate-100 rounded-[2.5rem] p-8 sm:p-10 shadow-xs mb-20"
        >
          <div className="max-w-3xl mb-8">
            <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block">
              {brand.capabilities_tagline || (typeof brand.brand_highlights === 'object' && !Array.isArray(brand.brand_highlights) ? (brand.brand_highlights as any)?.tagline : null) || 'CORPORATE CAPABILITIES'}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mt-2">
              {brand.capabilities_heading || (typeof brand.brand_highlights === 'object' && !Array.isArray(brand.brand_highlights) ? (brand.brand_highlights as any)?.heading : null) || settings.capabilities_title || 'Brand Highlights'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {((Array.isArray(brand.brand_highlights) && brand.brand_highlights.length > 0)
              ? brand.brand_highlights
              : (typeof brand.brand_highlights === 'object' && (brand.brand_highlights as any)?.cards?.length > 0)
              ? (brand.brand_highlights as any).cards
              : (brand.highlights && brand.highlights.length > 0
                  ? brand.highlights.map((h) => (typeof h === 'string' ? { title: h, subtitle: '' } : h))
                  : [
                      { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
                      { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
                      { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
                      { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
                    ]
                )
            ).map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/50 text-amber-600 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900 leading-tight">{typeof item === 'string' ? item : item.title}</p>
                  {typeof item === 'object' && item.subtitle && <p className="text-slate-700 mt-0.5">{item.subtitle}</p>}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400 mt-8 pt-4 border-t border-slate-100">
            {brand.footer_note || settings.capabilities_footer || 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.'}
          </p>
        </motion.div>

        {/* DOWNLOADABLE TECH DOCUMENTS TABLE */}
        {(() => {
          if (brandDatasheets.length === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xs mb-20"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                  <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block">
                    {settings.docs_tagline || 'TECHNICAL DOCUMENTATION'}
                  </span>
                  <h2 className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight">
                    {settings.docs_title || 'Downloadable Specs & Certifications'}
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {settings.docs_subtitle || 'Official Manufacturer Datasheets & Compliance PDFs'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brandDatasheets.map((doc, idx) => (
                  <a
                    key={idx}
                    href={getAssetUrl(doc.file_url || doc.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-slate-50 hover:bg-[#44a0e3]/10 border border-slate-200 hover:border-[#44a0e3] rounded-2xl transition-all group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-[#44a0e3] transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-bold font-poppins text-slate-600 leading-relaxed line-clamp-1 group-hover:text-[#44a0e3] transition-colors">
                          {doc.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">PDF Document</span>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 group-hover:text-[#44a0e3] transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          );
        })()}

        {/* 1. PRODUCT SPECIFICATIONS & CERTIFICATIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-10 mt-8">
          {/* Left: Text & Bullets */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7"
          >
            <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
              PRODUCT SPECIFICATIONS
            </span>
            <h2 className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-4">
              {brand.name} Certifications & Specs
            </h2>
            <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal mb-8">
              {brand.specs_description || 'Engineered with high quality component architecture and tested thoroughly to verify solar absorption and load resistance under extreme climatic conditions.'}
            </p>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 mb-3">
                Standards & Certifications
              </h3>
              <ul className="space-y-3">
                {(brand.certifications_list?.length ? brand.certifications_list : [
                  'IEC CB Scheme', 'IEC 61215:2021', 'IEC 61730:2023', 'IS 14286 & IS/IEC 61730', 'ISO 14001'
                ]).map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-600 text-sm font-medium leading-relaxed mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5 shrink-0"></span>
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            {/* Added p-8 for breathing room and changed bg-slate-100 to bg-white for a seamless blend */}
            <div className="h-full min-h-[400px] rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 p-8 flex items-center justify-center">
              <img
                src={(brand.specs_image_url ? getAssetUrl(brand.specs_image_url) : '') || 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop'}
                alt={`${brand.name} Specifications`}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </div>

        {/* 2. AVAILABLE PRODUCT RANGES & COMPANY PROFILE */}
        <div className="mb-10">
          {/* Centered Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
            >
              PRODUCT RANGE
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-2 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
            >
              Available Product Ranges
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-slate-700 text-base md:text-lg mt-3 leading-relaxed font-normal"
            >
              {brand.product_range_subtitle || `Explore high-performance modules and systems distributed by Kingsol Energy India.`}
            </motion.p>
          </div>

          {/* Split Profile & Features */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Profile & Features */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-7"
            >
              <h3 className="mt-5 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-2">
                {brand.name} Company Profile
              </h3>
              <p className="mt-1 text-slate-700 text-base md:text-lg leading-relaxed font-normal mb-5">
                {brand.company_profile_text || `${brand.name} is one of India's leading and trusted solar photovoltaic (PV) module manufacturers, with extensive experience in the renewable energy sector.`}
              </p>

              <h4 className="mt-5 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-2">Features:</h4>

              {/* Dynamic Categorized Features */}
              <div className="space-y-8">
                {(brand.categorized_features?.length ? brand.categorized_features : [
                  { 
                    category: 'DCR Modules', 
                    features: [
                      'Ideal for Commercial, Residential, Utility, and Industrial Applications.', 
                      'High efficiency of up to 21.30%.',
                      'IP68-rated protection for enhanced durability.'
                    ] 
                  },
                  { 
                    category: 'NDCR Modules', 
                    features: [
                      'Available in module ratings from 600 Wp to 620 Wp.', 
                      'High efficiency of up to 22.95%.'
                    ] 
                  }
                ]).map((block, idx) => (
                  <div key={idx}>
                    <h5 className="text-lg font-bold text-slate-900 mb-4">{block.category}</h5>
                    <ul className="space-y-2">
                      {block.features.map((feat: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-start gap-3 text-slate-600 text-sm font-medium leading-relaxed mb-5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5 shrink-0"></span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Profile Image (Sticky to stay visible while scrolling features) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
               <div className="sticky top-24 h-[450px] rounded-[2.5rem] overflow-hidden bg-white p-1 border border-slate-200 shadow-sm">
                 <img
                   src={(brand.company_profile_image_url ? getAssetUrl(brand.company_profile_image_url) : '') || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop'}
                   alt={`${brand.name} Company Profile`}
                   className="w-full h-full object-contain"
                 />
               </div>
            </motion.div>
          </div>
        </div>

        {/* DYNAMIC HORIZONTAL PRODUCT SLIDER SECTION */}
        <div id="products-slider" className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
              >
                {settings.slider_tagline || 'COMPONENT CATALOG PORTFOLIO'}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
              >
                {brand.name} Components Range
              </motion.h2>
            </div>

            {/* Slider Controls */}
            {displayedProducts.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProductForQuote(brand.name);
                    setIsQuoteOpen(true);
                  }}
                  className="bg-brand-green text-slate-900 hover:bg-slate-900 hover:text-white px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Get Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => scrollSlider('left')}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                    aria-label="Scroll Left"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollSlider('right')}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 hover:border-slate-400 flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                    aria-label="Scroll Right"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Component Portfolio Category Filter */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <motion.button
                type="button"
                layout
                whileTap={{ scale: 0.95 }}
                transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                onClick={() => setActiveCategoryFilter('all')}
                className={`px-7 py-3 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  activeCategoryFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={activeCategoryFilter === 'all' ? "active" : "inactive"}
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

              {availableCategories.map((cat) => {
                const isActive = activeCategoryFilter === cat.slug;
                return (
                  <motion.button
                    key={cat.slug}
                    type="button"
                    layout
                    whileTap={{ scale: 0.95 }}
                    transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                    onClick={() => setActiveCategoryFilter(cat.slug)}
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
            </div>
          )}

          {displayedProducts.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-12 text-center text-slate-500 border border-slate-200">
              No products found for this manufacturer brand.
            </div>
          ) : (
            /* Premium Drag-to-Scroll Horizontal Slider Container */
            <div
              ref={sliderRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory scroll-smooth"
            >
              {displayedProducts.map((product, idx) => {
                const prodCatSlug = product.category_slug || brand.category_slug || categorySlug || 'solar-modules';
                const prodBrSlug = product.brand_slug || brand.slug || brandSlug || 'goldi-solar';
                const prodItemSlug = product.slug || product.id;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="w-[280px] md:w-[320px] shrink-0 snap-start flex flex-col"
                  >
                    <Link
                      to={`/products/${prodCatSlug}/${prodBrSlug}/${prodItemSlug}`}
                      className="w-full h-full bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-[0_25px_50px_rgba(243,156,18,0.25)] transition-all group cursor-pointer"
                    >
                      <div>
                        <div className="h-44 rounded-2xl overflow-hidden mb-4 bg-white p-4 border border-slate-100 relative flex items-center justify-center">
                          <img
                            src={getAssetUrl(product.card_image || product.image_url)}
                            alt={product.title || product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs border border-slate-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-800">
                            {product.brand_name || brand.name}
                          </span>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 mb-3">
                          {product.title || product.name}
                        </h3>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        {product.specs && Object.keys(product.specs).length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 mb-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                            {Object.entries(product.specs).slice(0, 4).map(([key, val]) => (
                              <div key={key}>
                                <span className="text-[9px] text-slate-400 uppercase font-medium block truncate">{key}</span>
                                <span className="font-bold text-slate-800 text-[11px] truncate block">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <div className="w-1/2 bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-full text-center hover:bg-[#44a0e3] hover:text-slate-900 transition-colors">
                          View Specs
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedProductForQuote(product.title || product.name || brand.name);
                            setIsQuoteOpen(true);
                          }}
                          className="w-1/2 bg-brand-green text-slate-900 text-xs font-bold py-2.5 rounded-full text-center hover:bg-slate-900 hover:text-white transition-colors cursor-pointer z-10 relative"
                        >
                          Get Quote
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div> {/* <-- This was the missing closing tag! */}

      {/* Free Quote Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialProduct={selectedProductForQuote || brand.name}
      />

      {/* CTA Section Banner */}
      <CTASection onQuoteClick={() => {
        setSelectedProductForQuote(brand.name);
        setIsQuoteOpen(true);
      }} />
    </div>
  );
}

export { BrandDetail };