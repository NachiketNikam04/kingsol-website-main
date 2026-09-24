import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ExternalLink, X, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';

export interface CertificateItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  created_at?: string;
}

export const CertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  // Dynamic header settings with fallbacks
  const currentTagline = 'OUR CREDENTIALS';
  const currentHeadline = 'Industry Certifications & Compliance';
  const currentHighlightWord = 'Certifications';

  const renderDynamicHeadline = (headline: string, highlightWord: string) => {
    if (!highlightWord || !headline) return headline;
    const regex = new RegExp(`(${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = headline.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={index} className="text-[#44a0e3]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const fallbackCertificates: CertificateItem[] = [
    {
      id: 1,
      title: 'ISO 9001:2015 Quality Management',
      description: 'Certified standard ensuring supreme manufacturing quality, operational safety, and continuous process optimization.',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      sort_order: 1,
    },
    {
      id: 2,
      title: 'ALMM Approved PV Supply Chain',
      description: 'MNRE Approved List of Models and Manufacturers certification for utility-grade and government rooftop installations.',
      image_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?auto=format&fit=crop&w=800&q=80',
      sort_order: 2,
    },
    {
      id: 3,
      title: 'BIS Certification (IS 14286 / IEC 61215)',
      description: 'Bureau of Indian Standards compliance verified for crystalline silicon terrestrial photovoltaic module reliability.',
      image_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80',
      sort_order: 3,
    },
    {
      id: 4,
      title: 'TUV Rheinland Certified Safety',
      description: 'International laboratory certification for electrical insulation, high-voltage endurance, and extreme weather resilience.',
      image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      sort_order: 4,
    },
    {
      id: 5,
      title: 'IEC 61730 Photovoltaic Module Safety',
      description: 'Global standard qualification certifying Class A fire hazard rating and electrical shock protection.',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      sort_order: 5,
    },
    {
      id: 6,
      title: 'Tier-1 BNEF Manufacturer Alliance',
      description: 'Recognized bankability credentials partnered directly with Tier-1 BloombergNEF solar hardware manufacturers.',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      sort_order: 6,
    },
  ];

  useEffect(() => {
    async function loadCertificates() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/certificates`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCertificates(json.data);
        } else {
          setCertificates(fallbackCertificates);
        }
      } catch (err) {
        console.warn('⚠️ [CertificatesPage] Live fetch offline, using fallback credentials:', err);
        setCertificates(fallbackCertificates);
      } finally {
        setLoading(false);
      }
    }

    loadCertificates();
  }, []);

  const displayList = certificates.length > 0 ? certificates : fallbackCertificates;

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-24 pb-24 text-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-brand-green transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <Link to="/about" className="hover:text-brand-green transition-colors">
            Company
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">Certifications</span>
        </div>

        {/* Phase 4 Required Centered Header */}
        <div className="max-w-3xl mx-auto text-center pt-24 mb-16">
          <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block">
            {currentTagline}
          </span>
          <h2 className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl">
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </h2>
          <p className="text-slate-600 text-sm md:text-base mt-4 max-w-2xl mx-auto font-normal">
            Explore our certified standards, international laboratory compliance qualifications, and Tier-1 factory accreditations.
          </p>
        </div>

        {/* Responsive Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-brand-green" />
            <span className="text-sm font-medium">Loading credentials...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayList.map((cert, index) => (
              <motion.div
                key={cert.id || index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col cursor-pointer"
                onClick={() => setSelectedImage({ url: cert.image_url, title: cert.title })}
              >
                {/* Prominent Certificate Image Display */}
                <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                  <img
                    src={getAssetUrl(cert.image_url)}
                    alt={cert.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md transition-opacity duration-300 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </span>
                  </div>
                </div>

                {/* Title and Clean Description Below */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-poppins text-lg font-bold text-slate-900 group-hover:text-brand-green transition-colors leading-snug">
                      {cert.title}
                    </h3>
                  </div>
                  {cert.description && (
                    <p className="text-slate-600 font-montserrat text-sm leading-relaxed mt-1">
                      {cert.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Full View */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-4 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-3 px-2">
                <h3 className="font-bold text-slate-900 font-poppins text-base truncate pr-4">
                  {selectedImage.title}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[75vh] overflow-auto flex items-center justify-center">
                <img
                  src={getAssetUrl(selectedImage.url)}
                  alt={selectedImage.title}
                  className="max-h-[72vh] w-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CertificatesPage;
