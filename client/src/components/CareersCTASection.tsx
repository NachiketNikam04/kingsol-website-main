import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CareersCtaSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  bg_image_url: string;
}

export default function CareersCTASection() {
  const [data, setData] = useState<CareersCtaSettings | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE_URL}/about/careers-cta`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [CareersCTASection] API offline, using fallbacks:', err);
      }
    }
    loadData();
  }, []);

  const currentTagline = data?.tagline || "WE'RE GROWING OUR TEAM";
  const currentHeadline = data?.headline || 'Explore current Openings and find your place at Kingsol.';
  const currentHighlightWord = data?.highlight_word || 'Openings';
  const currentBgImage =
    data?.bg_image_url ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop';

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
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-[#FDFCF8]">
      {/* Redesigned Premium "Bento" Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="max-w-7xl mx-auto rounded-[2.5rem] pt-12 sm:pt-16 px-6 sm:px-12 md:px-16 pb-12 sm:pb-16 text-center flex flex-col items-center overflow-hidden relative shadow-2xl shadow-slate-200/60 border border-slate-200/80 group"
      >
        {/* Dynamic Background Image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          style={{
            backgroundImage: `url('${getAssetUrl(currentBgImage)}')`,
          }}
        />
        
        {/* Smooth Fade Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-white/85 z-10" />

        {/* Tagline (Added relative z-20) */}
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="relative z-20 mb-8 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
        >
          <span>{currentTagline}</span>
        </motion.span>
        
        {/* Headline (Added relative z-20) */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-20 mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
        >
          {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
        </motion.h2>

        <Link
          className="mt-8 sm:mt-10 bg-slate-900 hover:bg-[#44a0e3] text-white px-9 py-4 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-[#44a0e3]/25 flex items-center gap-3 cursor-pointer border border-transparent relative z-20 group/btn"
          to="/careers"
        >
          <span>CAREERS AT KINGSOL</span>
          <span className="transform transition-transform duration-200 group-hover/btn:translate-x-1">→</span>
        </Link>
      </motion.div>
    </section>
  );
}

export { CareersCTASection };