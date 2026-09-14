import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';

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
      staggerChildren: 0.15, // Delay between each logo sliding up
      delayChildren: 0.1,    // Initial delay before the first element animates
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const PartnersSection: React.FC = () => {
  const [partnersData, setPartnersData] = useState<PartnersData | null>(null);

  // Ref used to track this section's own scroll position, so the headline can
  // fade from faint to fully bold as the section rides into view (matching the
  // reference "sliding overlap" animation) instead of only reacting to a fixed
  // in-view threshold.
  const sectionRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start 0.35'],
  });

  const headlineOpacity = useTransform(scrollYProgress, [0, 1], [0.15, 1]);
  const headlineColor = useTransform(scrollYProgress, [0, 1], ['#cbd5e1', '#0f172a']);

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
      ref={sectionRef}
      key={activeLogos.length}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="relative w-full py-16 lg:py-5"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <motion.div variants={itemVariants}>
          <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
            {currentTagline}
          </span>

          <motion.h2
            style={{ opacity: headlineOpacity, color: headlineColor }}
            className="mt-1 text-2xl font-poppins font-bold tracking-tight text-white leading-tight sm:text-3xl md:text-4xl shrink-0"
          >
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </motion.h2>
        </motion.div>

        {/* Strict 4-Column Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-14">
          {activeLogos.map((logo, idx) => {
            const destination = logo.linked_brand
              ? `/brands/${logo.linked_brand.slug || logo.linked_brand.id}`
              : (logo.route_url?.trim() || null);

            const isExternal =
              destination ? (destination.startsWith('http://') || destination.startsWith('https://')) : false;

            const cardClasses = `bg-white rounded-2xl p-6 sm:p-8 flex items-center justify-center shadow-sm transition-all duration-300 group border border-slate-200/60 ${
              destination
                ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:shadow-brand-orange/20'
                : 'hover:shadow-brand-orange'
            }`;

            const logoImg = (
              <img
                src={getAssetUrl(logo.image_url)}
                alt={logo.name}
                className="h-16 sm:h-24 w-full object-contain transition-transform duration-300 group-hover:scale-105"
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