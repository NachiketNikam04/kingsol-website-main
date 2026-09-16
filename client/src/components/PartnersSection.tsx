import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

interface PartnersSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
}

interface PartnerLogo {
  id?: number;
  name: string;
  image_url: string;
  sort_order?: number;
  route_url?: string;
  linked_brand_id?: number | null;
  linked_brand?: {
    id: number;
    name: string;
    slug: string;
    category_slug?: string;
  } | null;
}

interface PartnersData {
  settings: PartnersSettings;
  logos: PartnerLogo[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const PartnersSection: React.FC = () => {
  const [partnersData, setPartnersData] = useState<PartnersData | null>(null);

  useEffect(() => {
    async function loadPartnersData() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/partners`);
        const json = await res.json();
        if (json.success && json.data) {
          setPartnersData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [PartnersSection] Live API offline, using fallback defaults:', err);
      }
    }
    loadPartnersData();
  }, []);

  const defaultLogos: PartnerLogo[] = [
    { name: 'SunPower', image_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=400&auto=format&fit=crop' },
    { name: 'Tesla Energy', image_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=400&auto=format&fit=crop' },
    { name: 'Enphase Energy', image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=400&auto=format&fit=crop' },
    { name: 'Canadian Solar', image_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=400&auto=format&fit=crop' },
    { name: 'First Solar', image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop' },
    { name: 'Goldi Solar', image_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=400&auto=format&fit=crop' },
    { name: 'Vikram Solar', image_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=400&auto=format&fit=crop' },
  ];

  const currentTagline = partnersData?.settings?.tagline || 'WHO WE TRUST';
  const currentHeadline = partnersData?.settings?.headline || 'Integrated seamlessly with Trusted industry partners';
  const currentHighlightWord = partnersData?.settings?.highlight_word || 'Trusted';

  const activeLogos = partnersData?.logos && partnersData.logos.length > 0 ? partnersData.logos : defaultLogos;

  // Case-Insensitive Headline Splitting Helper
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

  return (
    <motion.section
      key={activeLogos.length}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative w-full py-12 bg-[#fdfcf8]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <motion.div variants={itemVariants} className="mb-10">
          <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block">
            {currentTagline}
          </span>

          <h2 className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0">
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </h2>
        </motion.div>

        {/* Strict 4-Column Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {activeLogos.map((logo, idx) => {
            const destination = logo.linked_brand
              ? `/brands/${logo.linked_brand.slug || logo.linked_brand.id}`
              : (logo.route_url?.trim() || null);

            const isExternal =
              destination ? (destination.startsWith('http://') || destination.startsWith('https://')) : false;

            const cardClasses = `bg-white rounded-2xl p-6 sm:p-8 flex items-center justify-center shadow-xs transition-all duration-300 group border border-slate-200/70 ${
              destination
                ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-brand-green/50'
                : 'hover:shadow-md'
            }`;

            const logoImg = (
              <img
                src={getAssetUrl(logo.image_url)}
                alt={logo.name}
                className="h-14 sm:h-20 w-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            );

            return (
              <motion.div key={logo.id || idx} variants={itemVariants}>
                {destination ? (
                  isExternal ? (
                    <a
                      href={destination}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cardClasses}
                    >
                      {logoImg}
                    </a>
                  ) : (
                    <Link
                      to={destination}
                      className={cardClasses}
                    >
                      {logoImg}
                    </Link>
                  )
                ) : (
                  <div className={cardClasses}>
                    {logoImg}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default PartnersSection;