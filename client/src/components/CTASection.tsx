import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import QuoteModal from '../components/QuoteModal';
import { motion } from 'framer-motion';

interface CtaData {
  tagline: string;
  headline: string;
  highlight_word: string;
  bg_image_url: string;
}

interface CTASectionProps {
  onQuoteClick?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onQuoteClick }) => {
  const [ctaData, setCtaData] = useState<CtaData | null>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

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

  // Unified click handler to either use parent prop or open local modal
  const handleOpenQuote = () => {
    if (onQuoteClick) {
      onQuoteClick();
    } else {
      setIsQuoteOpen(true);
    }
  };

  return (
    <section className="relative w-full py-[72px] flex items-center justify-center bg-slate-900 overflow-hidden">
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
          className="mb-1 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-2"
        >
          {currentTagline}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-1 text-2xl font-poppins font-bold tracking-tight text-white leading-tight sm:text-3xl md:text-4xl shrink-0"
        >
          {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
        </motion.h2>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <button
            type="button"
            onClick={handleOpenQuote}
            className="mt-8 bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-1 shadow-md hover:bg-[#44a0e3] hover:text-white hover:shadow-[0_20px_40px_rgba(68,160,227,0.2)] inline-flex w-fit items-center justify-center gap-2 cursor-pointer border border-slate-200/60 hover:border-transparent"
          >
            <span>REQUEST A FREE QUOTE</span>
            <span className="text-base leading-none">
              <svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>
        </motion.div>
      </div>

      {/* Quote Modal Component */}
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </section>
  );
};

export default CTASection;