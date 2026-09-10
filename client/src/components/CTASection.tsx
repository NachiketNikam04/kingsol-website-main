import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CtaData {
  tagline: string;
  headline: string;
  highlight_word: string;
  bg_image_url: string;
}

export const CTASection: React.FC = () => {
  const [ctaData, setCtaData] = useState<CtaData | null>(null);

  useEffect(() => {
    async function loadCtaData() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/cta`);
        const json = await res.json();
        if (json.success && json.data) {
          setCtaData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [CTASection] Live API offline, using fallback defaults:', err);
      }
    }
    loadCtaData();
  }, []);

  const currentTagline = ctaData?.tagline || 'Free Quote';
  const currentHeadline = ctaData?.headline || "Ready to go Solar? request for a quote today. It's free!";
  const currentHighlightWord = ctaData?.highlight_word || 'Solar';
  const currentBgImage = ctaData?.bg_image_url || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2070&auto=format&fit=crop';

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
    <section className="relative w-full py-16 sm:py-20 flex items-center justify-center bg-slate-900 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={getAssetUrl(currentBgImage)}
          alt="Solar Panels"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-[#78C257] font-extrabold tracking-widest text-xs sm:text-sm mb-3 uppercase drop-shadow-xs"
        >
          {currentTagline}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-5 text-5xl md:text-6xl font-bold font-lato text-white leading-tight max-w-2xl tracking-tight"
        >
          {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
        </motion.h2>

        {/* Single Button linking to contact page */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <Link
            className="mt-10 bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 ease-out hover:scale-[1.03] active:scale-[0.98] shadow-lg hover:shadow-2xl hover:shadow-[#44a0e3]/30 hover:bg-[#44a0e3] hover:text-white flex items-center gap-2.5 cursor-pointer border border-transparent"
            to="/contact"
          >
            <span>REQUEST A FREE QUOTE</span>
            <span className="text-base leading-none">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
