import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AboutDetailsSection from '../components/AboutDetailsSection';
import ValuesMissionSection from '../components/ValuesMissionSection';
import WarehousePresenceSection from '../components/WarehousePresenceSection';
import CareersCTASection from '../components/CareersCTASection';
import CTASection from '../components/CTASection';

interface AboutHeroData {
  tagline: string;
  headline: string;
  highlight_word: string;
  description: string;
  image_url: string;
}

export default function AboutUs() {
  const [heroData, setHeroData] = useState<AboutHeroData | null>(null);

  useEffect(() => {
    async function loadAboutHero() {
      try {
        const res = await fetch(`${API_BASE_URL}/about/hero`);
        const json = await res.json();
        if (json.success && json.data) {
          setHeroData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [AboutUs] Live hero API offline, using fallback defaults:', err);
      }
    }
    loadAboutHero();
  }, []);

  const currentTagline = heroData?.tagline || 'ABOUT';
  const currentHeadline = heroData?.headline || 'A better way to deliver Clean energy';
  const currentHighlightWord = heroData?.highlight_word || 'Clean';
  const currentDescription =
    heroData?.description ||
    'Kingsol designs, installs, and supports high-performance solar and storage systems for homes, businesses, and large-scale projects. Our work is grounded in engineering rigor, transparency, and a commitment to long-term performance.';
  const currentImage =
    heroData?.image_url ||
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop';

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

  // Animation variants for staggered reveal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-32 pb-16 relative overflow-x-clip">
      {/* Subtle Background Glow Orbs for Depth */}
      {/* <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-brand-green/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#44a0e3]/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" /> */}

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-between mb-12 sm:mb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Top Section: Eyebrow & Main Title */}
        <div className="max-w-4xl">
          <motion.div variants={itemVariants} className="mb-3">
            <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8">
              <span>{currentTagline}</span>
            </span>
          </motion.div>

          <div className="overflow-visible">
            <motion.h1
              variants={itemVariants}
              className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h1>
          </div>
        </div>

        {/* Bottom Section: Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center mt-8 sm:mt-39">
          {/* Left Text */}
          <motion.div variants={itemVariants} className="md:col-span-6 space-y-4">
            <p className="text-slate-600 text-base sm:text-lg md:text-xl leading-relaxed font-normal whitespace-pre-line">
              {currentDescription}
            </p>
          </motion.div>

          {/* Right Image */}
          <motion.div variants={itemVariants} className="md:col-span-6">
            <div className="w-full h-[260px] sm:h-[340px] md:h-[440px] rounded-tl-[3.5rem] rounded-br-[3.5rem] overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xl shadow-slate-300/40 relative group">
              <img
                src={getAssetUrl(currentImage)}
                alt="Professional working on solar engineering"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Who We Are & Accordion Details Section */}
      <AboutDetailsSection />

      {/* Vision, Mission & Values Bento Grid Section */}
      <ValuesMissionSection />

      {/* Dynamic Warehouse Presence Section */}
      <WarehousePresenceSection />

      {/* Careers CTA Section */}
      <CareersCTASection />

      {/* Free Quote CTA Banner */}
      <CTASection />
    </div>
  );
}

export { AboutUs };
