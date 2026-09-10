import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAssetUrl } from '../utils/assetUrl';

export interface CallToActionBannerProps {
  tagline?: string;
  headline?: string;
  highlightWord?: string;
  bgImageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const CallToActionBanner: React.FC<CallToActionBannerProps> = ({
  tagline = 'FREE QUOTE',
  headline = "Ready to go Solar? request for a quote today. It's free!",
  highlightWord = 'Solar',
  bgImageUrl = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2070&auto=format&fit=crop',
  buttonText = 'REQUEST A FREE QUOTE',
  buttonLink = '/contact',
  onButtonClick,
  className = '',
}) => {
  // Case-Insensitive Headline Splitting Helper
  const renderDynamicHeadline = (text: string, highlight: string) => {
    if (!highlight || !text) return text;

    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={index} className="text-[#44a0e3]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <section className={`relative w-full py-20 sm:py-24 flex items-center justify-center bg-slate-900 overflow-hidden ${className}`}>
      {/* Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={getAssetUrl(bgImageUrl)}
          alt="Solar Panels Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
      </div>

      {/* Center Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
        {/* Tagline */}
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-[#78C257] font-extrabold tracking-widest text-xs sm:text-sm uppercase mb-3 drop-shadow-xs"
        >
          {tagline}
        </motion.span>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-lato text-white leading-tight max-w-3xl tracking-tight drop-shadow-sm"
        >
          {renderDynamicHeadline(headline, highlightWord)}
        </motion.h2>

        {/* CTA Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {onButtonClick ? (
            <button
              type="button"
              onClick={onButtonClick}
              className="mt-8 sm:mt-10 bg-white hover:bg-[#44a0e3] text-slate-900 hover:text-white px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2.5 cursor-pointer border border-transparent"
            >
              <span>{buttonText}</span>
              <span className="text-base leading-none">→</span>
            </button>
          ) : (
            <Link
              to={buttonLink}
              className="mt-8 sm:mt-10 bg-white hover:bg-[#44a0e3] text-slate-900 hover:text-white px-8 py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-xl flex items-center gap-2.5 cursor-pointer border border-transparent"
            >
              <span>{buttonText}</span>
              <span className="text-base leading-none">→</span>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionBanner;
