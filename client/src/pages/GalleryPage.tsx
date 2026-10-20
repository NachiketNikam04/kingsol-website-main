import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import QuoteModal from '../components/QuoteModal';

export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export const GalleryPage: React.FC = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const tagline = 'VISUAL PORTFOLIO';
  const headline = 'Our Project & Field Gallery.';
  const highlightWord = 'Gallery.';
  const subtitle =
    'Explore real-world commercial solar installations, module quality inspections, and renewable energy exhibitions across India.';

  const renderDynamicHeadline = (text: string, word: string) => {
    if (!word) return text;
    const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, idx) =>
      part.toLowerCase() === word.toLowerCase() ? (
        <span key={idx} className="text-[#44a0e3]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-32 pb-[72px] text-slate-900 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 font-medium">
          <Link to="/" className="hover:text-slate-900 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Gallery</span>
        </div>

        {/* Clean Section Header */}
        <div className="mb-12 mt-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mb-2 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
          >
            {tagline}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
          >
            {renderDynamicHeadline(headline, highlightWord)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="mt-3 font-poppins text-base md:text-md text-slate-600 leading-relaxed whitespace-pre-line max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Coming Soon Section Implementation (BESS Pattern) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-[2.5rem] border border-slate-200/80 p-12 md:p-16 text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden bg-gradient-to-bl from-[#44a0e3]/10 via-white to-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[6px] after:bg-gradient-to-r after:from-[#44a0e3] after:via-[#60afe6] after:via-[75%] after:to-[#44a0e3]"
        >
          {/* Badge */}
          <span className="inline-block px-3.5 py-1 mb-4 text-xs font-semibold tracking-widest uppercase text-[#44a0e3] bg-[#44a0e3]/10 rounded-full font-poppins">
            Project Showcase Under Curation
          </span>

          {/* Heading */}
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-poppins text-slate-900 mb-3 tracking-tight">
            On-Site Installations & Project Portfolio
          </h3>

          {/* Description */}
          <p className="text-slate-600 font-poppins text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            We are currently compiling certified site photography, high-resolution aerial documentation, and commission logs across our utility-scale solar arrays, C&I rooftop installations, and utility BESS container deployments nationwide. Verified project case studies and site media will be available shortly.
          </p>

          {/* Action CTA / Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className="mt-6 text-sm font-semibold text-[#44a0e3] hover:underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Request our verified project docket & past commissioning reports</span> &rarr;
          </button>
        </motion.div>
      </div>

      {/* Quote Modal Component */}
      <QuoteModal isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
};

export default GalleryPage;
