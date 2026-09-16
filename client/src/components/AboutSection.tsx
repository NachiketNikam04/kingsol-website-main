import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

interface CountUpProps {
  endValue: number;
  prefix?: string;
  suffix?: string;
  label: string;
  duration?: number;
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

const StatItem: React.FC<CountUpProps> = ({ endValue, prefix = '', suffix = '+', label, duration = 2000 }) => {
  const { count, ref } = useCountUp(endValue, duration);

  return (
    <div ref={ref} className="flex flex-col gap-1 items-center md:items-start min-w-[200px] flex-1">
      <div className="text-5xl sm:text-6xl font-bold text-brand-orange leading-none p-0 m-0">
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </div>
      <p className="text-slate-600 text-base sm:text-lg p-0 m-0 font-medium">{label}</p>
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
    <section className="relative w-full bg-[#fdfcf8] text-slate-900 py-16 flex flex-col justify-center">
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
              className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed whitespace-pre-line"
            >
              {currentSubtitle}
            </motion.p>

            <motion.a
              href="/about"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              className="mt-6 bg-slate-900 text-white hover:bg-brand-green hover:text-slate-900 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-md flex items-center gap-2 cursor-pointer"
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

            {/* Overlapping Card */}
            <div className="absolute -bottom-12 sm:-bottom-16 left-0 w-4/5 bg-[#b7f07a] p-6 sm:p-8 rounded-2xl shadow-xl border border-[#9beb46]/50 text-slate-950">
              <div className="flex items-center space-x-2 mb-3">
                <Sun className="w-5 h-5 text-slate-950 fill-current" />
                <span className="font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm">{currentCardHeading}</span>
              </div>

              <p className="mt-2 text-gray-900 font-montserrat text-sm leading-relaxed flex-1">{currentCardBody}</p>

              <a
                href="/services"
                className="inline-flex items-center space-x-1 mt-3 text-xs font-bold uppercase tracking-wider text-slate-950 hover:text-slate-700 group"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="flex flex-wrap items-center justify-between md:justify-start gap-12 sm:gap-16 text-center md:text-left mt-12 sm:mt-14 mb-2"
        >
          {activeStats.map((stat, idx) => (
            <StatItem
              key={stat.id || idx}
              endValue={stat.end_value}
              prefix={stat.prefix || ''}
              suffix={stat.suffix || '+'}
              label={stat.label}
              duration={2000}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;