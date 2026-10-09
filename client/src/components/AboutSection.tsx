import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sun, Users, Award, Package } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountUpProps {
  endValue: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface AboutSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
  main_image_url: string;
  card_heading: string;
  card_body: string;
  bg_image_url: string;
  image_on_left?: boolean;
}

interface AboutStat {
  id?: number;
  end_value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sort_order?: number;
}

interface AboutData {
  settings: AboutSettings;
  stats: AboutStat[];
}

function useCountUp(endValue: number, duration: number = 2000) {
  const [count, setCount] = useState<number>(0);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const hasAnimated = useRef<boolean>(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * endValue));

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCount(endValue);
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [endValue, duration]);

  return { count, ref: elementRef };
}

const StatItem: React.FC<CountUpProps> = ({
  endValue,
  prefix = '',
  suffix = '+',
  label,
  duration = 2000,
  icon,
}) => {
  const { count, ref } = useCountUp(endValue, duration);

  return (
    <div
      ref={ref}
      className="group flex-1 min-w-[250px] bg-white rounded-[2rem] border border-slate-200/80 shadow-xl p-8 flex flex-col items-center justify-center text-center hover:shadow-[0_20px_40px_rgba(68,160,227,0.15)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
    >
      {/* Continuous Fluid / Mirror Sheen Sweep Effect */}
      <motion.div
        animate={{ left: ["-100%", "200%"] }}
        transition={{ 
          duration: 2.5, 
          ease: "easeInOut", 
          repeat: Infinity, 
          repeatDelay: 1.5 
        }}
        className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-[#44a0e3]/15 to-transparent skew-x-[-30deg] z-0 pointer-events-none"
      />

      {/* Content Wrapper (z-10 ensures it sits above the sheen) */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Icon Container: Clean & permanent, NO background change on hover */}
        {icon && (
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-6 text-[#44a0e3] shadow-sm border border-slate-100 group-hover:scale-110 group-hover:border-[#44a0e3]/30 transition-all duration-500">
            {icon}
          </div>
        )}
        
        {/* Number Text: Stays black (slate-900) permanently */}
        <div className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 flex items-center gap-1">
          {prefix && <span>{prefix}</span>}
          <span>{count.toLocaleString()}</span>
          {suffix && <span className="text-[#44a0e3]">{suffix}</span>}
        </div>
        
        {/* Label: Changes to blue on card hover */}
        <p className="text-slate-600 font-medium text-sm sm:text-base group-hover:text-[#44a0e3] transition-colors duration-500">
          {label}
        </p>
      </div>
    </div>
  );
};

export const AboutSection: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);

  useEffect(() => {
    async function loadAboutData() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/about`);
        const json = await res.json();
        if (json.success && json.data) {
          setAboutData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [AboutSection] Live API offline, using fallback defaults:', err);
      }
    }
    loadAboutData();
  }, []);

  const defaultStats: AboutStat[] = [
    { end_value: 70, suffix: '%', label: 'Savings on Energy Bills' },
    { end_value: 1200, suffix: '+', label: 'Projects Completed' },
    { end_value: 5000, suffix: '+', label: 'Shipments Delivered' },
  ];

  const currentTagline = aboutData?.settings?.tagline || 'WHAT WE DO';
  const currentHeadline = aboutData?.settings?.headline || 'We are dedicated to making clean power accessible, affordable, and effective.';
  const currentHighlightWord = aboutData?.settings?.highlight_word || 'clean power';
  const currentSubtitle = aboutData?.settings?.subtitle || 'Kingsol Energy is a premier solar procurement partner across India, driving rooftop solar installations, commercial PV plants, and grid-tie microgrids with Tier-1 components.';
  const currentMainImage = aboutData?.settings?.main_image_url || 'https://cdn.britannica.com/94/192794-050-3F3F3DDD/panels-electricity-order-sunlight.jpg';
  const currentCardHeading = aboutData?.settings?.card_heading || 'SUNERGY VISION';
  const currentCardBody = aboutData?.settings?.card_body || 'Sunergy was founded with a vision to drive sustainable energy solutions that empower individuals, businesses, and communities.';

  const activeStats = aboutData?.stats && aboutData.stats.length > 0 ? aboutData.stats : defaultStats;

  // Case-Insensitive Headline Splitting Helper
  const renderDynamicHeadline = (headline: string, highlightWord: string) => {
    if (!highlightWord || !headline) return headline;

    const regex = new RegExp(`(${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = headline.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={index} className="text-[#44a0e3] inline-block">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <section className="relative w-full bg-[#fdfcf8] text-slate-900 py-[72px] flex flex-col justify-center">
      {/* Main Content Wrapper */}
      <div className="relative max-w-7xl mx-auto px-6 w-full">
        {/* Top 2-Column Flex */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-center">
          
          {/* Text Column */}
          <div className="w-full lg:w-[58%] flex flex-col items-start">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green"
            >
              {currentTagline}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed whitespace-pre-line text-justify"
            >
              {currentSubtitle}
            </motion.p>

            <motion.a
              href="/about"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-6 bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-1 shadow-md hover:bg-[#44a0e3] hover:text-white hover:shadow-[0_20px_40px_rgba(68,160,227,0.2)] inline-flex w-fit items-center justify-center gap-2 cursor-pointer border border-slate-200/60 hover:border-transparent"
            >
              <span>About Company</span>
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          </div>

          {/* Visuals Column */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="w-full lg:w-[42%] relative pb-12 lg:pb-0"
          >
            {/* Top Aligned Solar Image */}
            <div className="w-[90%] sm:w-[88%] ml-auto h-72 sm:h-80 overflow-hidden rounded-2xl shadow-xl border border-slate-100">
              <img
                src={getAssetUrl(currentMainImage)}
                alt="About Us"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Overlapping Card (Glassmorphism Effect) */}
            {/* Swapped uniform padding for px-6 py-4 sm:px-8 sm:py-5 to squeeze it vertically */}
            <div className="absolute -bottom-20 sm:-bottom-28 left-0 w-4/5 bg-white/5 backdrop-blur-sm px-6 py-4 sm:px-8 sm:py-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/30 text-slate-950 overflow-hidden">
              
              {/* Smoky White Glow behind text for enhanced readability */}
              <div className="absolute inset-0 bg-white/50 blur-[40px] pointer-events-none -z-10 scale-110" />

              {/* Content wrapper with z-10 so it sits above the smoke */}
              <div className="relative z-10">
                {/* Heading with white text-shadow */}
                <div className="flex items-center space-x-2 mb-1.5 [text-shadow:_0_2px_4px_rgb(255_255_255_/_0.9)]">
                  <Sun className="w-5 h-5 text-slate-950 fill-current drop-shadow-md" />
                  <span className="font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">
                    {currentCardHeading}
                  </span>
                </div>

                {/* Description with its own white smoky background so the glass transparency doesn't affect readability */}
                <div className="relative">
                  <div className="absolute -inset-x-3 -inset-y-2 bg-white/80 blur-xl rounded-2xl pointer-events-none -z-10" />
                  {/* Tightened margins from mt-2 mb-4 to mt-1 mb-2 */}
                  <p className="mt-1 mb-2 font-montserrat text-sm text-gray-900 leading-relaxed whitespace-pre-line text-justify flex-1 [text-shadow:_0_1px_3px_rgb(255_255_255_/_0.9)]">
                    {currentCardBody}
                  </p>
                </div>

                {/* Button with white text-shadow */}
                {/* Added hover:underline, hover:underline-offset-4, and decoration-2 */}
                <a
                  href="/services"
                  className="inline-flex items-center space-x-1 mt-2 text-xs font-bold uppercase tracking-wider text-slate-950 hover:text-slate-700 hover:underline hover:underline-offset-4 decoration-2 transition-all group [text-shadow:_0_2px_4px_rgb(255_255_255_/_0.9)]"
                >
                  <span>Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform drop-shadow-sm" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-wrap items-stretch justify-center gap-6 mt-12 sm:mt-16 w-full"
        >
          {activeStats.map((stat, idx) => (
            <StatItem
              key={stat.id || idx}
              endValue={stat.end_value}
              prefix={stat.prefix || ''}
              suffix={stat.suffix || '+'}
              label={stat.label}
              duration={2000}
              icon={
                idx === 0 ? (
                  <Users className="w-7 h-7" />
                ) : idx === 1 ? (
                  <Award className="w-7 h-7" />
                ) : (
                  <Package className="w-7 h-7" />
                )
              }
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;