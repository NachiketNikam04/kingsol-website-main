import { API_BASE_URL, getAssetUrl, parseDatasheets } from '../utils/assetUrl';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  FileText,
  Download,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Check,
  ChevronDown,
  Share2,
  ArrowRight,
} from 'lucide-react';
import CTASection from '../components/CTASection';
import { InquiryModal } from '../components/InquiryModal';
import QuoteModal from '../components/QuoteModal';

/* ==========================================================================
   INTERACTIVE SOLAR INVERTER CARD COMPONENT (Task 3 Specification)
   ========================================================================== */
interface InverterCardProps {
  product: ProductData;
  onInquiry: (product: ProductData) => void;
}

const InverterCard: React.FC<InverterCardProps> = ({ product, onInquiry }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [knowMore, setKnowMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const docsRef = useRef<HTMLDivElement>(null);

  // Close docs dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (docsRef.current && !docsRef.current.contains(event.target as Node)) {
        setIsDocsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamic phaseType value
  const phaseType = product.phase_type || product.expertise || (product.specs as any)?.phase_type || (product.specs as any)?.phaseType;

  // Robust image extraction (up to 4 images from gallery & image_url)
  const images: string[] = [];
  const rawGallery = (product as any).images || product.gallery;

  if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim()) {
    images.push(product.image_url.trim());
  }

  ['image_1', 'image_2', 'image_3', 'image_4'].forEach((key) => {
    const val = (product as any)[key];
    if (val && typeof val === 'string' && val.trim() && !images.includes(val.trim())) {
      images.push(val.trim());
    }
  });

  if (Array.isArray(rawGallery)) {
    rawGallery.forEach((img) => {
      if (typeof img === 'string' && img.trim() && !images.includes(img.trim())) {
        images.push(img.trim());
      }
    });
  } else if (typeof rawGallery === 'string' && rawGallery.trim()) {
    try {
      const parsed = JSON.parse(rawGallery.trim());
      if (Array.isArray(parsed)) {
        parsed.forEach((img) => {
          if (typeof img === 'string' && img.trim() && !images.includes(img.trim())) {
            images.push(img.trim());
          }
        });
      }
    } catch {
      rawGallery.split(',').forEach((img) => {
        const trimmed = img.trim();
        if (trimmed && !images.includes(trimmed)) {
          images.push(trimmed);
        }
      });
    }
  }

  if (images.length === 0) images.push('/logo.png');

  // Key Features (handles up to 10-12 dynamic items)
  const features =
    Array.isArray(product.key_features) && product.key_features.length > 0
      ? product.key_features.filter((f) => f && typeof f === 'string' && f.trim() !== '')
      : [
          'High conversion efficiency with advanced MPPT tracking algorithms',
          'IP65 / IP66 weatherproof protection class for harsh outdoor environments',
          'Integrated AC/DC surge protection & intelligent grid monitoring capabilities',
          'Compact lightweight design with natural convection cooling & quiet operation',
        ];

  // Expansion logic: display 4 features by default, expand to all on "Know more"
  const visibleFeatures = knowMore ? features : features.slice(0, 4);
  const hasMoreFeatures = features.length > 4;

  // Technical Specs parsing
  let specsObj: Record<string, string> = {};
  if (typeof product.specs === 'object' && product.specs !== null) {
    specsObj = product.specs as Record<string, string>;
  } else if (typeof product.specs === 'string') {
    try {
      specsObj = JSON.parse(product.specs);
    } catch {
      specsObj = {};
    }
  }

  const specEntries = Object.entries(specsObj);

  // Parse all available datasheets / documents
  const parsedDocs = parseDatasheets(product.documents || (product as any).datasheets);
  if (product.datasheet_url && !parsedDocs.some((d) => d.url === getAssetUrl(product.datasheet_url))) {
    parsedDocs.unshift({
      title: 'Technical Datasheet PDF',
      url: getAssetUrl(product.datasheet_url),
    });
  }

  // Share button handler
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title || product.name || 'Solar Inverter',
          text: product.description || 'Check out this Solar Inverter on Kingsol',
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Copy link failed');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-6 md:p-8 flex flex-col justify-between mb-8">
      {/* Top Split Layout: Left Details vs Right Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Name, Subtitle, Features & Specs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Header & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {product.brand_name && (
                <span className="px-3 py-1 bg-brand-green/10 text-brand-green font-bold text-xs rounded-full uppercase tracking-wider">
                  {product.brand_name}
                </span>
              )}
              {phaseType && (
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold uppercase">
                  {phaseType}
                </span>
              )}
              {product.subcategory_name && (
                <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue font-bold text-xs rounded-full uppercase">
                  {product.subcategory_name}
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 leading-snug">
              {product.title || product.name}
            </h2>
            {product.description && (
              <p className="text-slate-600 text-base md:text-lg mt-1.5 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          {/* Key Features Bulleted List */}
          <div className="space-y-2 pt-1">
            <h3 className="text-xs font-bold font-poppins text-slate-400 uppercase tracking-wider">Key Features</h3>
            <ul className="space-y-2">
              {visibleFeatures.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 font-medium leading-normal">
                  <div className="w-5 h-5 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Know More / Less Toggle */}
            {hasMoreFeatures && (
              <button
                type="button"
                onClick={() => setKnowMore(!knowMore)}
                className="mt-2 text-xs font-bold text-brand-green hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{knowMore ? 'Know less' : 'Know more'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${knowMore ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* Technical Specs Grid */}
          {specEntries.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold font-poppins text-slate-400 uppercase tracking-wider mb-2.5">Technical Specs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {specEntries.slice(0, 6).map(([key, val], idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Full-Box Interactive Image Slider */}
        <div className="lg:col-span-5 relative w-full min-h-[350px] sm:min-h-[450px] bg-white rounded-[2.5rem] border border-slate-200 flex flex-col items-center justify-between overflow-hidden group self-stretch">
          
          {/* Floating Top Header: Brand Pill & Logo */}
          <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-20 gap-2 pointer-events-none">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-xs text-slate-800 border border-slate-200/80 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs truncate pointer-events-auto">
              {product.brand_name || 'Inverter Series'}
            </span>
            
            {/* Renders Brand Logo if it exists. OEM Certified fallback is REMOVED. */}
            {product.brand_logo_url && (
              <div className="h-8 max-w-[120px] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0 pointer-events-auto">
                <img
                  src={getAssetUrl(product.brand_logo_url)}
                  alt={product.brand_name || 'Brand Logo'}
                  className="h-full w-auto max-h-6 object-contain"
                />
              </div>
            )}
          </div>

          {/* Full-Box Image View Area (Maximized Size) */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center p-8 z-10 mt-6">
            <img
              key={activeImageIndex}
              src={getAssetUrl(images[activeImageIndex])}
              alt={`${product.title || product.name} - Photo ${activeImageIndex + 1}`}
              className="w-full h-full object-contain transition-transform duration-500 transform group-hover:scale-105 select-none"
            />

            {/* Left / Right Carousel Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition-all cursor-pointer z-10 active:scale-95"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 shadow-md border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-900 hover:text-white transition-all cursor-pointer z-10 active:scale-95"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Carousel Indicator Dots */}
          {images.length > 1 ? (
            <div className="flex items-center gap-2 z-10">
              {images.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(dotIdx);
                  }}
                  className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    dotIdx === activeImageIndex
                      ? 'w-6 bg-brand-green shadow-xs'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to image ${dotIdx + 1}`}
                />
              ))}
            </div>
          ) : (
            <div className="h-2" />
          )}
        </div>
      </div>

      {/* CARD FOOTER: Actions (Share, Download Datasheets, Send Inquiry) */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors flex items-center justify-center cursor-pointer shrink-0"
            title="Share Inverter Product"
          >
            <Share2 className="w-4 h-4" />
          </button>
          {copied && (
            <span className="text-xs font-bold text-brand-green animate-pulse">
              Link Copied!
            </span>
          )}

          {/* Multiple Datasheets Action Buttons / Dropdown */}
          {parsedDocs.length === 0 ? (
            <span className="text-xs text-slate-400 font-medium italic">
              Datasheet Available on Request
            </span>
          ) : parsedDocs.length === 1 ? (
            <a
              href={parsedDocs[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-full transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-brand-blue" />
              <span>{parsedDocs[0].title || 'Download Datasheet'}</span>
            </a>
          ) : (
            <div className="relative" ref={docsRef}>
              <button
                type="button"
                onClick={() => setIsDocsOpen(!isDocsOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-brand-blue" />
                <span>Download Datasheets ({parsedDocs.length})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDocsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDocsOpen && (
                <div className="absolute left-0 bottom-full mb-2 w-64 sm:w-72 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-30 space-y-1">
                  <span className="block px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Available Datasheets & Specs
                  </span>
                  {parsedDocs.map((doc, dIdx) => (
                    <a
                      key={dIdx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDocsOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors group/doc"
                    >
                      <span className="truncate pr-2">{doc.title || `Datasheet ${dIdx + 1}`}</span>
                      <Download className="w-3.5 h-3.5 text-slate-400 group-hover/doc:text-brand-green shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Inquiry Action Button */}
        <button
          onClick={() => onInquiry(product)}
          className="w-full sm:w-auto px-6 py-3 bg-brand-green hover:bg-emerald-600 text-slate-900 font-extrabold text-xs rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
        >
          <span>Send Inquiry</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface ProductDoc {
  title: string;
  url: string;
}

interface ProductData {
  id: number;
  slug: string;
  title: string;
  name?: string;
  description: string;
  short_description?: string;
  long_description?: string;
  image_1?: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  image_url: string;
  card_image?: string;
  datasheet_url?: string;
  expertise?: string;
  gallery?: string[];
  key_features?: string[];
  documents?: ProductDoc[];
  specs?: Record<string, string>;
  brand_id?: number;
  brand_name?: string;
  brand_slug?: string;
  brand_logo_url?: string;
  phase_type?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  subcategory_id?: number;
  subcategory_name?: string;
  subcategory_slug?: string;
  capabilities_tagline?: string;
  capabilities_heading?: string;
  brand_highlights?: any;
  footer_note?: string;
  category_banner_image?: string;
  banner_images?: string[];
  brand_certifications?: string | string[];
  brand_certifications_list?: string[];
  certifications?: string | string[];
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
  alternate_layout?: boolean;
}

/**
 * Helper to extract a normalized numerical rating/capacity value for sorting inverters.
 * Normalizes kW / kVA / W / Wp into numeric Watts (e.g., 3.3kW -> 3300, 50kW -> 50000).
 */
function extractInverterSortValue(product: any): number {
  if (!product) return 0;

  // 1. Explicit sort order or numerical fields
  if (typeof product.sort_order === 'number' && !isNaN(product.sort_order)) return product.sort_order;
  if (typeof product.sortOrder === 'number' && !isNaN(product.sortOrder)) return product.sortOrder;
  if (product.sort_order && !isNaN(Number(product.sort_order))) return Number(product.sort_order);
  if (product.sortOrder && !isNaN(Number(product.sortOrder))) return Number(product.sortOrder);
  if (typeof product.wattage === 'number' && !isNaN(product.wattage)) return product.wattage;
  if (product.wattage && !isNaN(Number(product.wattage))) return Number(product.wattage);
  if (typeof product.capacity === 'number' && !isNaN(product.capacity)) return product.capacity;
  if (product.capacity && !isNaN(Number(product.capacity))) return Number(product.capacity);

  const parseNumWithUnits = (str: string): number | null => {
    if (!str || typeof str !== 'string') return null;
    const clean = str.trim().toLowerCase();

    // Check kW / kVA / kWp / k (e.g., 3.3kW, 50 kw, 10kva, 3.6k)
    const kwMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:kw|kva|kwp|k)\b/i);
    if (kwMatch && kwMatch[1]) {
      const parsed = parseFloat(kwMatch[1]);
      if (!isNaN(parsed)) return parsed * 1000;
    }

    // Check W / Wp / VA (e.g., 3300w, 550 wp, 5000 va)
    const wMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:w|wp|va)\b/i);
    if (wMatch && wMatch[1]) {
      const parsed = parseFloat(wMatch[1]);
      if (!isNaN(parsed)) return parsed;
    }

    // Raw number
    const numMatch = clean.match(/(\d+(?:\.\d+)?)/);
    if (numMatch && numMatch[1]) {
      const parsed = parseFloat(numMatch[1]);
      if (!isNaN(parsed)) return parsed;
    }

    return null;
  };

  // 2. Check Specs Object
  let specsObj: Record<string, any> = {};
  if (typeof product.specs === 'object' && product.specs !== null) {
    specsObj = product.specs;
  } else if (typeof product.specs === 'string') {
    try {
      specsObj = JSON.parse(product.specs);
    } catch {
      specsObj = {};
    }
  }

  const candidateSpecKeys = [
    'wattage',
    'power',
    'capacity',
    'rating',
    'rated_power',
    'rated_output_power',
    'rated power',
    'ac_output_power',
    'ac output power',
    'max_output_power',
    'output_power',
    'output power',
    'nominal_power',
    'nominal power',
    'kw',
    'kva',
  ];

  for (const key of candidateSpecKeys) {
    const matchedKey = Object.keys(specsObj).find(
      (k) => k.toLowerCase() === key.toLowerCase() || k.toLowerCase().includes(key.toLowerCase())
    );
    if (matchedKey && specsObj[matchedKey] !== undefined && specsObj[matchedKey] !== null) {
      const val = specsObj[matchedKey];
      if (typeof val === 'number' && !isNaN(val)) {
        return val < 100 ? val * 1000 : val; // e.g. 5 (kW) -> 5000
      }
      const parsed = parseNumWithUnits(String(val));
      if (parsed !== null) return parsed;
    }
  }

  // 3. Check Title / Name (e.g., "Festone 3.3kW Solar Inverter", "Growatt 5000TL-X 5kW")
  const titleVal = parseNumWithUnits(product.title || product.name || '');
  if (titleVal !== null) return titleVal;

  // 4. Fallback to ID or 0
  return Number(product.id) || 0;
}

export default function ProductDetail() {
  const { categorySlug, brandSlug, productSlug, slug } = useParams<{
    categorySlug?: string;
    brandSlug?: string;
    productSlug?: string;
    slug?: string;
  }>();

  const targetSlug = productSlug || slug;
  const navigate = useNavigate();

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [settings, setSettings] = useState<CatalogSettings>({
    brand_story_tagline: 'BRAND BACKGROUND & ARCHITECTURE',
    brand_story_title: 'Engineering & Technology Story',
    features_title: 'Key Features & Standards',
    capabilities_title: 'Brand Highlights',
    capabilities_footer: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
    docs_tagline: 'TECHNICAL DOCUMENTATION',
    docs_title: 'Downloadable Specs & Certifications',
    docs_subtitle: 'Official Manufacturer Datasheets & Compliance PDFs',
    alternate_layout: true,
  });
  const [loading, setLoading] = useState(true);
  const [inverterCategoryProducts, setInverterCategoryProducts] = useState<ProductData[]>([]);
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('All');
  const [bannerIndex, setBannerIndex] = useState<number>(0);

  // Auto-rotate Category / Portfolio banner every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Inquiry & Quote Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProductForInquiry, setSelectedProductForInquiry] = useState<ProductData | null>(null);
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

  // Dynamic product datasheets (shared between top action button and bottom section)
  const productDatasheets = useMemo(() => {
    if (!product) return [];
    const docs = parseDatasheets(product.documents || (product as any).datasheets);
    if (product.datasheet_url && !docs.some((d) => d.url === getAssetUrl(product.datasheet_url))) {
      docs.unshift({
        title: 'Master Technical Datasheet',
        url: getAssetUrl(product.datasheet_url),
        file_url: getAssetUrl(product.datasheet_url),
      });
    }
    return docs;
  }, [product]);

  // Dynamic product gallery parser (up to 4 unique images)
  const activeGallery = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    const rawGallery = (product as any).images || product.gallery;

    if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim()) {
      list.push(product.image_url.trim());
    }

    ['image_1', 'image_2', 'image_3', 'image_4'].forEach((key) => {
      const val = (product as any)[key];
      if (val && typeof val === 'string' && val.trim() && !list.includes(val.trim())) {
        list.push(val.trim());
      }
    });

    if (Array.isArray(rawGallery)) {
      rawGallery.forEach((img) => {
        if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
          list.push(img.trim());
        }
      });
    } else if (typeof rawGallery === 'string' && rawGallery.trim()) {
      try {
        const parsed = JSON.parse(rawGallery.trim());
        if (Array.isArray(parsed)) {
          parsed.forEach((img) => {
            if (typeof img === 'string' && img.trim() && !list.includes(img.trim())) {
              list.push(img.trim());
            }
          });
        }
      } catch {
        rawGallery.split(',').forEach((img) => {
          const trimmed = img.trim();
          if (trimmed && !list.includes(trimmed)) {
            list.push(trimmed);
          }
        });
      }
    }

    return list.slice(0, 4);
  }, [product]);

  // Auto-rotating image carousel interval
  useEffect(() => {
    if (activeGallery.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % activeGallery.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeGallery.length]);

  const isBessRoute = categorySlug?.toLowerCase() === 'bess' || categorySlug?.toLowerCase().includes('bess');
  const isInverterRoute = categorySlug?.toLowerCase().includes('inverter') || categorySlug === 'solar-inverters';
  const isCardLayoutRoute = isInverterRoute || isBessRoute;

  useEffect(() => {
    async function loadData() {
      if (!targetSlug && !categorySlug) return;
      setLoading(true);
      setCurrentImageIndex(0);
      try {
        if (isCardLayoutRoute) {
          const [allProdRes, bessRes, settingsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/products`),
            fetch(`${API_BASE_URL}/bess`).catch(() => null),
            fetch(`${API_BASE_URL}/catalog/page-settings`).then((r) => r.json()).catch(() => null),
          ]);

          const combinedData: any[] = [];
          if (allProdRes.ok) {
            const json = await allProdRes.json();
            if (json.success && Array.isArray(json.data)) {
              combinedData.push(...json.data);
            }
          }
          if (bessRes && bessRes.ok) {
            const bJson = await bessRes.json();
            if (bJson.success && Array.isArray(bJson.data)) {
              combinedData.push(...bJson.data);
            }
          }

          if (combinedData.length > 0) {
            const cleanCategory = (categorySlug || '').toLowerCase();
            const cleanBrand = (brandSlug || '').toLowerCase().replace(/-(inverters?|bess)$/, '');
            const cleanTarget = (targetSlug || '').toLowerCase().replace(/-(inverters?|bess)$/, '').replace(/[^a-z0-9]/g, '');

            const matched = combinedData.filter((p: any) => {
              // Category match
              const pCatSlug = (p.category_slug || '').toLowerCase();
              const matchCategory =
                !categorySlug ||
                pCatSlug === cleanCategory ||
                (isBessRoute && (pCatSlug === 'bess' || pCatSlug.includes('bess'))) ||
                (isInverterRoute && (pCatSlug.includes('inverter') || cleanCategory.includes('inverter')));

              // Brand match
              const pBrandSlug = (p.brand_slug || '').toLowerCase().replace(/-(inverters?|bess)$/, '');
              const pBrandName = (p.brand_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const matchBrand =
                !brandSlug ||
                pBrandSlug === cleanBrand ||
                pBrandName.includes(cleanBrand) ||
                cleanBrand.includes(pBrandSlug);

              // Subcategory / Category match
              const pSubSlug = (p.subcategory_slug || '').toLowerCase().replace(/-(inverters?|bess)$/, '').replace(/[^a-z0-9]/g, '');
              const pSubName = (p.subcategory_name || '').toLowerCase().replace(/-(inverters?|bess)$/, '').replace(/[^a-z0-9]/g, '');

              const matchSub =
                !targetSlug ||
                (pSubSlug && pSubSlug === cleanTarget) ||
                (pSubName && pSubName === cleanTarget) ||
                (pSubSlug && cleanTarget.includes(pSubSlug)) ||
                (pSubName && cleanTarget.includes(pSubName)) ||
                (pSubSlug && pSubSlug.includes(cleanTarget));

              return matchCategory && matchBrand && matchSub;
            });

            setInverterCategoryProducts(matched);
          }

          if (settingsRes && settingsRes.success && settingsRes.data) {
            setSettings((prev) => ({ ...prev, ...settingsRes.data }));
          }
        } else {
          // Standard single product fetch for non-inverters
          const [prodRes, settingsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/products/${targetSlug}`),
            fetch(`${API_BASE_URL}/catalog/page-settings`).then((r) => r.json()).catch(() => null),
          ]);

          if (prodRes.ok) {
            const json = await prodRes.json();
            if (json.success && json.data) {
              setProduct(json.data.product);
            }
          }

          if (settingsRes && settingsRes.success && settingsRes.data) {
            setSettings((prev) => ({ ...prev, ...settingsRes.data }));
          }
        }
      } catch (err) {
        console.warn('⚠️ [ProductDetail] Offline or fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [targetSlug, categorySlug, brandSlug, isInverterRoute]);

  const handleOpenInquiry = (prod?: ProductData) => {
    setSelectedProductForInquiry(prod || null);
    setSelectedProductForQuote(prod?.title || prod?.name || product?.title || product?.name || '');
    setIsQuoteOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-24 flex items-center justify-center text-slate-500 font-medium">
        Loading solar component details...
      </div>
    );
  }

  // Inverter & BESS Category Page View with Wide Horizontal Cards
  if (isCardLayoutRoute) {
    const rawBrand = brandSlug ? brandSlug.replace(/-/g, ' ') : 'All Brands';
    const cleanBrand = rawBrand.replace(/\s*(inverters?|bess)$/gi, '').trim() || 'All Brands';
    const formattedBrand = cleanBrand;

    // Safely extract and sanitize category / subcategory string (prevents "Inverters Inverters" duplication)
    const rawCategory = targetSlug
      ? targetSlug.replace(/-/g, ' ')
      : (inverterCategoryProducts[0]?.subcategory_name || inverterCategoryProducts[0]?.category_name || (isBessRoute ? 'BESS' : 'Solar'));
    const sanitizedCategory = rawCategory.replace(/\s*(inverters?|bess)/gi, '').trim();
    const formattedCategory = isBessRoute
      ? (sanitizedCategory ? `${sanitizedCategory} BESS` : 'BESS')
      : (sanitizedCategory ? `${sanitizedCategory} Inverters` : 'Solar Inverters');

    // Extract unique phase / system types from category products dynamically
    const availablePhaseTypes = Array.from(
      new Set(
        inverterCategoryProducts
          .map((inv) => inv.phase_type || inv.expertise || (inv.specs as any)?.phase_type || (inv.specs as any)?.phaseType)
          .filter(Boolean)
          .map((s: string) => s.trim())
      )
    );

    // Filter displayed products by selectedPhaseFilter
    const filteredInverters = inverterCategoryProducts.filter((inv) => {
      if (selectedPhaseFilter === 'All') return true;
      const pType = (
        inv.phase_type ||
        inv.expertise ||
        (inv.specs as any)?.phase_type ||
        (inv.specs as any)?.phaseType ||
        ''
      )
        .trim()
        .toLowerCase();
      return pType === selectedPhaseFilter.trim().toLowerCase();
    });

    // Numerically sort products from lowest specification to highest (e.g., 3.3kW -> 5kW -> 10kW -> 100kW / 100kWh)
    const displayedInverters = [...filteredInverters].sort((a, b) => {
      const valA = extractInverterSortValue(a);
      const valB = extractInverterSortValue(b);
      if (valA !== valB) return valA - valB;
      return (a.title || a.name || '').localeCompare(b.title || b.name || '');
    });

    // Extract dynamic Category / Portfolio Banner Images (up to 4 images)
    const activeCategoryBanners = (() => {
      const list: string[] = [];
      for (const p of inverterCategoryProducts) {
        if (p.banner_images && Array.isArray(p.banner_images)) {
          for (const url of p.banner_images) {
            if (typeof url === 'string' && url.trim() && !list.includes(url.trim())) {
              list.push(url.trim());
            }
          }
        } else if (typeof (p as any).banner_images === 'string') {
          try {
            const parsed = JSON.parse((p as any).banner_images);
            if (Array.isArray(parsed)) {
              for (const url of parsed) {
                if (typeof url === 'string' && url.trim() && !list.includes(url.trim())) {
                  list.push(url.trim());
                }
              }
            }
          } catch {}
        }
      }

      if (list.length === 0) {
        for (const p of inverterCategoryProducts) {
          if (p.category_banner_image && typeof p.category_banner_image === 'string' && p.category_banner_image.trim()) {
            if (!list.includes(p.category_banner_image.trim())) {
              list.push(p.category_banner_image.trim());
            }
          }
        }
      }

      if (list.length === 0) {
        list.push(
          isBessRoute
            ? 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=80'
            : 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?auto=format&fit=crop&w=1600&q=80'
        );
      }

      return list.slice(0, 4);
    })();

    const safeBannerIndex = bannerIndex % (activeCategoryBanners.length || 1);

    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-32 flex flex-col justify-between">
        {/* Main Content Area */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 flex-wrap">
            <Link to="/products" className="hover:text-brand-green transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link 
              to={isBessRoute ? "/products/bess" : "/products/solar-inverters"} 
              className="hover:text-brand-green transition-colors"
            >
              {isBessRoute ? "BESS" : "Solar Inverters"}
            </Link>
            {brandSlug && (
              <>
                <span>/</span>
                <Link 
                  to={isBessRoute ? `/products/bess/${brandSlug}` : `/products/solar-inverters/${brandSlug}`} 
                  className="capitalize text-slate-700 hover:text-brand-green transition-colors"
                >
                  {formattedBrand}
                </Link>
              </>
            )}
            {targetSlug && (
              <>
                <span>/</span>
                <span className="capitalize text-slate-900 font-bold">{formattedCategory}</span>
              </>
            )}
          </div>

          {/* Split-Layout Editorial Banner */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative overflow-hidden bg-white rounded-[2rem] shadow-xl min-h-[350px] md:min-h-[450px] flex items-center mb-8 border border-slate-200/90"
          >
            {/* The Image & Fade Effect Carousel */}
            <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeCategoryBanners[safeBannerIndex]}
                  src={getAssetUrl(activeCategoryBanners[safeBannerIndex])}
                  alt={`${formattedCategory} Banner ${safeBannerIndex + 1}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute right-0 top-0 w-full md:w-3/4 h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent w-full md:w-3/4 z-10 pointer-events-none" />

              {/* Navigation Dots (Only shown when multiple banner images exist) */}
              {activeCategoryBanners.length > 1 && (
                <div className="absolute bottom-5 right-6 md:right-10 z-30 flex items-center gap-2 bg-slate-900/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
                  {activeCategoryBanners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBannerIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === safeBannerIndex
                          ? 'w-6 h-2 bg-brand-green'
                          : 'w-2 h-2 bg-white/60 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* The Content (Text & Badges) */}
            <div className="relative z-20 p-8 md:p-12 lg:p-16 max-w-3xl">
              <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green inline-block">
                {isBessRoute ? 'BESS Portfolio' : 'Solar Inverters Portfolio'}
              </span>
              <h1 className="font-poppins text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900 capitalize">
                {formattedBrand} — {formattedCategory}
              </h1>
              <p className="text-slate-600 text-sm md:text-base mt-3 leading-relaxed">
                {isBessRoute
                  ? 'Explore high-density scalable LiFePO4 battery energy storage systems (BESS) engineered for peak shaving, backup power, and C&I microgrids backed by manufacturer warranties.'
                  : 'Explore high-efficiency grid-tied, hybrid, and off-grid solar string inverters backed by manufacturer direct warranties and complete technical datasheets.'}
              </p>

              {/* Dynamic Brand Certifications Pill Badges */}
              {(() => {
                const rawCerts =
                  inverterCategoryProducts.find((p: any) => p.brand_certifications || p.certifications || p.brand_certifications_list)?.brand_certifications ||
                  inverterCategoryProducts.find((p: any) => p.brand_certifications_list)?.brand_certifications_list ||
                  inverterCategoryProducts.find((p: any) => p.certifications)?.certifications ||
                  'Tier-1 Listed, ALMM Approved, TUV Certified, 10-Year Warranty';

                const certsList = Array.isArray(rawCerts)
                  ? rawCerts
                  : typeof rawCerts === 'string'
                    ? rawCerts.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : [];

                if (certsList.length === 0) return null;

                return (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {certsList.map((cert: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-full shadow-xs"
                      >
                        {cert.trim()}
                      </span>
                    ))}
                  </div>
                );
              })()}

              {/* Free Quote CTA Button */}
              <div className="mt-8 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuoteOpen(true)}
                  className="bg-[#78C257] hover:bg-[#68ac49] text-white px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 inline-block cursor-pointer shadow-xs"
                >
                  Get a Free Quote
                </button>
              </div>
            </div>
          </motion.div>

          {/* Dynamic Page-Level Phase Type Filter */}
          {availablePhaseTypes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-3 mb-8"
            >
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Phase Type:
              </span>
              <motion.button
                type="button"
                layout
                whileTap={{ scale: 0.95 }}
                transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                onClick={() => setSelectedPhaseFilter('All')}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  selectedPhaseFilter === 'All'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span
                    key={selectedPhaseFilter === 'All' ? "active" : "inactive"}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                    className="whitespace-nowrap inline-block"
                  >
                    All ({inverterCategoryProducts.length})
                  </motion.span>
                </AnimatePresence>
              </motion.button>
              {availablePhaseTypes.map((phase, idx) => {
                const count = inverterCategoryProducts.filter((inv) => {
                  const pType = (
                    inv.phase_type ||
                    inv.expertise ||
                    (inv.specs as any)?.phase_type ||
                    (inv.specs as any)?.phaseType ||
                    ''
                  )
                    .trim()
                    .toLowerCase();
                  return pType === phase.trim().toLowerCase();
                }).length;

                const isSelected = selectedPhaseFilter.trim().toLowerCase() === phase.trim().toLowerCase();

                return (
                  <motion.button
                    key={idx}
                    type="button"
                    layout
                    whileTap={{ scale: 0.95 }}
                    transition={{ layout: { duration: 0.3, type: "spring", bounce: 0.2 } }}
                    onClick={() => setSelectedPhaseFilter(phase)}
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span
                        key={isSelected ? "active" : "inactive"}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -30, opacity: 0 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
                        className="whitespace-nowrap inline-block"
                      >
                        {phase} ({count})
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
          
          {/* Inverter Cards List Container */}
          <div className="space-y-8">
            {displayedInverters.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-lg font-bold font-poppins text-slate-800">No Inverters Found</h3>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  {selectedPhaseFilter !== 'All'
                    ? `No ${selectedPhaseFilter} inverter models found under category '${formattedCategory}'.`
                    : `There are currently no inverter models listed under category '${formattedCategory}' for brand '${formattedBrand}'.`}
                </p>
                {selectedPhaseFilter !== 'All' ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPhaseFilter('All')}
                    className="inline-block px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-full hover:bg-brand-green hover:text-slate-900 transition-colors mt-2 cursor-pointer"
                  >
                    Show All Inverters
                  </button>
                ) : (
                  <Link
                    to="/products"
                    className="inline-block px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-full hover:bg-brand-green hover:text-slate-900 transition-colors mt-2"
                  >
                    View All Products Catalog
                  </Link>
                )}
              </div>
            ) : (
              displayedInverters.map((inv, idx) => (
                <motion.div
                  key={inv.id || idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                >
                  <InverterCard product={inv} onInquiry={handleOpenInquiry} />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Existing Working CTA Banner (Edge-to-Edge Full Width) */}
        <div className="w-full">
          <CTASection onQuoteClick={() => {
            setSelectedProductForQuote(formattedBrand);
            setIsQuoteOpen(true);
          }} />
        </div>

        {/* Inquiry Modal */}
        <InquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          product={selectedProductForInquiry || undefined}
        />

        {/* Free Quote Modal */}
        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => setIsQuoteOpen(false)}
          initialProduct={selectedProductForQuote || formattedBrand}
        />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-24 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-poppins text-slate-900 mb-2">Product Specification Not Found</h2>
          <p className="text-slate-600 text-sm mb-6">
            The requested product component slug does not exist in our catalog database.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="inline-block px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-full hover:bg-brand-green hover:text-slate-900 transition-colors cursor-pointer"
          >
            ← Return to Products Catalog
          </button>
        </div>
      </div>
    );
  }

  const catSlug = product.category_slug || categorySlug || 'solar-modules';
  const brSlug = product.brand_slug || brandSlug || 'goldi-solar';
  const catName = product.category_name || (categorySlug ? categorySlug.replace(/-/g, ' ') : 'Category');
  const brName = product.brand_name || (brandSlug ? brandSlug.replace(/-/g, ' ') : 'Brand');
  const prodTitle = product.title || product.name || '';

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-36 pb-0 text-slate-900 flex flex-col justify-between overflow-x-clip">
      <div className="max-w-7xl mx-auto px-6 w-full mb-20">
        {/* Dynamic Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <Link to="/products" className="hover:text-brand-green transition-colors">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to={`/products/${catSlug}`} className="text-slate-700 capitalize hover:text-brand-green transition-colors">
            {catName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to={`/products/${catSlug}/${brSlug}`} className="text-slate-700 hover:text-brand-green transition-colors">
            {brName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">{prodTitle}</span>
        </div>

        {/* HERO SECTION: IMAGE ON LEFT (lg:col-span-6), TEXT ON RIGHT (lg:col-span-6) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-10">
          {/* Main Hero Cover Image & Auto-Rotating Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <div className="w-full aspect-square md:h-[500px] rounded-[2.5rem] overflow-hidden bg-white border border-slate-200 relative flex items-center justify-center">
              <img
                src={getAssetUrl(activeGallery[currentImageIndex] || product.image_url || '/logo.png')}
                alt={prodTitle || 'Product View'}
                className="w-full h-full object-contain p-4 transition-opacity duration-500 select-none"
              />

              {/* Dot Navigation */}
              {activeGallery.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2.5 z-10">
                  {activeGallery.map((_, index) =>
                    index === currentImageIndex ? (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className="w-2.5 h-2.5 rounded-full bg-slate-900 transition-all scale-125 cursor-pointer"
                      />
                    ) : (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className="w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-400 transition-all cursor-pointer"
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Hero Content & Specs Table */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold text-[#44a0e3] tracking-widest uppercase">
                {catName}
              </span>
              <span className="text-slate-300">•</span>
              <Link
                to={`/products/${catSlug}/${brSlug}`}
                className="text-xs font-bold text-slate-700 hover:underline flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5 text-brand-green" />
                <span>{brName}</span>
              </Link>
            </div>

            <h1 className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl">
              {prodTitle}
            </h1>

            <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal mb-5">
              {product.short_description || product.description}
            </p>

            {/* Technical Specs Key Highlights Table */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">{key}</span>
                    <span className="text-xs md:text-sm font-bold text-slate-900 truncate block">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => {
                  setSelectedProductForQuote(prodTitle);
                  setIsQuoteOpen(true);
                }}
                className="bg-brand-green text-slate-900 hover:bg-slate-900 hover:text-white px-8 py-3.5 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>Get Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Top Expandable Datasheet Action Button & Dropdown */}
              {productDatasheets.length > 0 && (
                <div className="relative" ref={datasheetRef}>
                  <button
                    type="button"
                    onClick={() => setIsDatasheetOpen((prev) => !prev)}
                    className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 px-5 py-3.5 rounded-full font-bold text-xs md:text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#0078C8]" />
                    <span>Datasheets & Specs ({productDatasheets.length})</span>
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
                            Available Documents ({productDatasheets.length})
                          </span>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
                          {productDatasheets.map((sheet, idx) => (
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
                                  {sheet.title || 'Product Datasheet'}
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
          className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-xs mb-20 w-full max-w-none"
        >
          <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
            {settings.brand_story_tagline || 'BRAND BACKGROUND & ARCHITECTURE'}
          </span>
          <h2 className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl">
            {settings.brand_story_title || 'Engineering & Technology Story'}
          </h2>
          <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
            {product.long_description || product.description || product.expertise}
          </p>

          {/* Key Features & Standards Checklist (2-Column Grid) */}
          <div className="pt-8 border-t mb-5 mt-6 border-slate-100">
            <h3 className="mb-4 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight">
              {settings.features_title || 'Key Features & Standards'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(product.key_features && product.key_features.length > 0
                ? product.key_features
                : [
                    'High power density rating',
                    'Advanced thermal management architecture',
                    'IP68 Weatherproof rating',
                    '25-Year performance linear warranty',
                  ]
              ).map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span className="text-slate-800 leading-relaxed">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        productName={selectedProductForInquiry?.title || selectedProductForInquiry?.name || prodTitle}
      />

      {/* Free Quote Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialProduct={selectedProductForQuote || prodTitle}
      />

      {/* CTA Section */}
      <CTASection onQuoteClick={() => {
        setSelectedProductForQuote(prodTitle);
        setIsQuoteOpen(true);
      }} />
    </div>
  );
}

export { ProductDetail };