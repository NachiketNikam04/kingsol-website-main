import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sun, Zap, BatteryCharging, Factory } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { AboutSection } from '../components/AboutSection';
import { PartnersSection } from '../components/PartnersSection';
import { PremiumProductsSection } from '../components/PremiumProductsSection';
import { FeaturedProductsSection } from '../components/FeaturedProductsSection';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';
import { ServicesUSPSection } from '../components/ServicesUSPSection';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { BlogSection } from '../components/BlogSection';
import { CTASection } from '../components/CTASection';

export interface HeroSlide {
  image: string;
  headline: string;
  highlightWord: string;
}

interface HeroSettings {
  bg_image_url?: string;
  headline?: string;
  highlight_word?: string;
  subtitle: string;
  heroSlides?: HeroSlide[];
}

interface TrustedBrand {
  id?: number;
  name: string;
  image_url: string | null;
  icon?: any;
  color?: string;
}

interface HeroData {
  settings: HeroSettings;
  brands: TrustedBrand[];
}

interface PartnerLogo {
  id?: number;
  name: string;
  image_url: string;
  route_url?: string;
  linked_brand_id?: number | null;
  linked_brand?: {
    id: number;
    name: string;
    slug: string;
    category_slug?: string;
  } | null;
}

export const Landing: React.FC = () => {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [partnerLogos, setPartnerLogos] = useState<PartnerLogo[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  const heroForegroundRef = useRef<HTMLDivElement | null>(null);
  const aboutTrackRef = useRef<HTMLDivElement | null>(null);
  const aboutRef = useRef<HTMLDivElement | null>(null);
  const aboutMetricsRef = useRef({ top: 0, height: 0 });

  const { scrollY } = useScroll();

  // Measure AboutSection document position and height dynamically
  useEffect(() => {
    const updateMetrics = () => {
      if (aboutTrackRef.current) {
        const trackRect = aboutTrackRef.current.getBoundingClientRect();
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const height = aboutRef.current?.offsetHeight || trackRect.height;
        aboutMetricsRef.current = {
          top: trackRect.top + scrollTop,
          height: height,
        };
      }
    };

    updateMetrics();
    const timeoutId = setTimeout(updateMetrics, 150);

    window.addEventListener('resize', updateMetrics);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && aboutRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateMetrics();
      });
      resizeObserver.observe(aboutRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateMetrics);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Framer Motion Scroll Lock for Page 2:
  // Freezes AboutSection at the viewport bottom the moment its counters are in view
  // while Page 3 slides up and covers it.
  const aboutY = useTransform(scrollY, (currentY) => {
    const { top, height } = aboutMetricsRef.current;
    if (!top || !height) return 0;
    const vh = window.innerHeight || 800;
    const lockStart = top + height - vh;
    const lockEnd = lockStart + vh;

    if (currentY <= lockStart) return 0;
    if (currentY >= lockEnd) return vh;
    return currentY - lockStart;
  });

  // 2. We use absolute pixels instead of percentages. 
  // 0px to 300px scrolled: Stays clear.
  // 300px to 700px scrolled: Transitions to blur.
  // Anything past 700px (even 5000px down the page): STAYS permanently blurred.
  const imageBlur = useTransform(
    scrollY,
    [0, 300, 700],
    ["blur(0px)", "blur(0px)", "blur(24px)"]
  );

  const imageScale = useTransform(
    scrollY,
    [0, 300, 700],
    [1, 1, 1.15]
  );

  // Scroll listener to pause hero slider when reading About section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Fetch Dynamic Hero Configuration
    async function loadHeroConfig() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/hero`);
        const json = await res.json();
        if (json.success && json.data) {
          setHeroData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [Landing] Live Hero API offline, using fallback defaults:', err);
      }
    }

    // Fetch Dynamic Partner Logos for Marquee (Unified Endpoint)
    async function loadPartnerLogos() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/partners`);
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data.logos)) {
          setPartnerLogos(json.data.logos);
        }
      } catch (err) {
        console.warn('⚠️ [Landing] Live Partner Logos API offline, using fallback defaults:', err);
      }
    }

    loadHeroConfig();
    loadPartnerLogos();
  }, []);

  const defaultHeroSlides: HeroSlide[] = [
    {
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80',
      headline: 'Powering the future of the world',
      highlightWord: 'future',
    },
    {
      image: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?auto=format&fit=crop&w=2000&q=80',
      headline: 'Engineered for maximum Clean energy yield',
      highlightWord: 'Clean',
    },
    {
      image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=2000&q=80',
      headline: 'Tier-1 Solar components distributed across India',
      highlightWord: 'Solar',
    },
  ];

  const defaultTrustedBrands: TrustedBrand[] = [
    { name: 'SUNPOWER CORP', image_url: null, icon: Sun, color: 'text-amber-500' },
    { name: 'TESLA ENERGY', image_url: null, icon: Zap, color: 'text-emerald-500' },
    { name: 'ENPHASE ENERGY', image_url: null, icon: BatteryCharging, color: 'text-amber-500' },
    { name: 'CANADIAN SOLAR', image_url: null, icon: Factory, color: 'text-emerald-500' },
    { name: 'FIRST SOLAR', image_url: null, icon: ShieldCheck, color: 'text-amber-500' },
  ];

  const activeBrands = heroData?.brands && heroData.brands.length > 0 ? heroData.brands : defaultTrustedBrands;
  const activeMarqueeLogos: PartnerLogo[] =
    partnerLogos.length > 0
      ? partnerLogos
      : activeBrands.map((b) => ({ name: b.name, image_url: b.image_url || '' }));

  const activeSlides: HeroSlide[] =
    heroData?.settings?.heroSlides && heroData.settings.heroSlides.length > 0
      ? heroData.settings.heroSlides
      : defaultHeroSlides;

  // Auto-cycle through hero slides every 10 seconds (Paused when scrolled down)
  useEffect(() => {
    if (activeSlides.length <= 1 || isScrolledDown) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        setPrevSlide(prev);
        return (prev + 1) % activeSlides.length;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [activeSlides.length, isScrolledDown]);

  const currentSlideData = activeSlides[currentSlide] || activeSlides[0] || defaultHeroSlides[0];
  const currentHeadline = currentSlideData.headline;
  const currentHighlightWord = currentSlideData.highlightWord;
  const currentSubtitle = heroData?.settings?.subtitle || 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.';

  // Case-Insensitive Headline Splitting Helper
  const renderDynamicHeadline = (headline: string, highlightWord: string) => {
    if (!highlightWord || !headline) return headline;

    const regex = new RegExp(`(${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = headline.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={index} className="text-[#F39C12] relative inline-block">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-full relative bg-[#fdfcf8] text-slate-900">
      {/* 1. MASTER SHARED WRAPPER: HERO + ABOUT SECTION */}
      <div className="relative w-full bg-[#fdfcf8]">
        {/* Sticky Background Layer */}
          <div className="sticky top-0 h-screen w-full bg-black overflow-hidden pointer-events-none">          <motion.div
            className="relative w-full h-full"
            style={{ filter: imageBlur, scale: imageScale }}
          >
            {/* Outgoing Slide Fixed Background Base */}
            <div
              className="absolute inset-0 bg-cover bg-no-repeat z-0 scale-105"
              style={{
                backgroundImage: `url('${getAssetUrl(activeSlides[prevSlide]?.image || currentSlideData.image)}')`,
                backgroundPosition: 'center 60%',
              }}
            >
              {/* Diagonal Spotlight Gradient for Base Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/20 to-black/80" />
            </div>

            {/* OPTION 1: THE CLASSIC CROSSFADE */}
            <AnimatePresence initial={false}>
              <motion.div
                key={currentSlide}
                className="absolute inset-0 w-full h-full z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              >
                <img
                  src={getAssetUrl(currentSlideData.image)}
                  alt=""
                  className="w-full h-full object-cover object-[center_60%]"
                />
                {/* Diagonal Spotlight Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/20 to-black/80" />
              </motion.div>
            </AnimatePresence>

            {/* Darkening Gradient Overlay for Background */}
            <div className="absolute inset-0 bg-black/30 z-20 pointer-events-none" />
          </motion.div>
        </div>

        {/* 2. SCROLLING FOREGROUND LAYER */}
        <div className="relative z-10 w-full -mt-[100vh]">
          {/* HERO FOREGROUND CONTENT */}
          <section
            ref={heroForegroundRef}
            className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 px-4 sm:px-6 lg:px-8"
          >
            {/* Unified Foreground Hero Content: Left-Aligned with Inline Action & Brands Row */}
            <div className="relative z-30 flex flex-col items-start justify-center gap-6 md:gap-8 w-full max-w-[90rem] mx-auto my-auto text-left pt-4">
              
              {/* Animated Headline in Natural Document Flow */}
              <div className="w-full max-w-4xl">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.h1
                    key={currentSlide}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, delay: 0.05, ease: [0.76, 0, 0.24, 1] }}
                    className="text-5xl md:text-7xl font-poppins font-semibold mb-6 leading-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.85),0_4px_40px_rgba(0,0,0,0.5)] text-white max-w-4xl"
                  >
                    {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
                  </motion.h1>
                </AnimatePresence>
              </div>

              {/* Persistent Static Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className="mt-4 font-poppins text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed"
              >
                {currentSubtitle}
              </motion.p>

              {/* Action & Brands Row (Inline on XL, stacked on smaller screens) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                className="flex flex-col xl:flex-row items-start xl:items-center gap-6 mt-8 w-full max-w-full"
              >
                {/* The Buttons */}
                <div className="flex flex-wrap items-center gap-4 flex-shrink-0">
                  
                  {/* Primary Button ("Request a Free Quote") */}
                  <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                    <Link
                      to="/contact"
                      className="relative overflow-hidden group flex items-center justify-between gap-4 rounded-full pl-8 pr-2 py-2 bg-[#78C257] border border-[#78C257] shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto cursor-pointer"
                    >
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.3,1,0.8,1)] group-hover:scale-[25] z-0 pointer-events-none" />
                      <span className="relative z-10 font-bold text-sm uppercase tracking-wider text-white group-hover:text-[#78C257] transition-colors duration-300">
                        REQUEST A FREE QUOTE
                      </span>
                      <span className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-white group-hover:text-[#78C257] transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 text-[#78C257] group-hover:translate-x-0.5 transition-transform duration-300" />
                      </span>
                    </Link>
                  </motion.div>

                  {/* Secondary Button ("Explore Solutions") */}
                  <motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                    <Link
                      to="/products"
                      className="relative overflow-hidden group flex items-center justify-between gap-4 rounded-full pl-8 pr-2 py-2 bg-white/90 backdrop-blur-xs border border-slate-300/90 shadow-md hover:shadow-xl transition-all duration-300 w-full sm:w-auto cursor-pointer"
                    >
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#44a0e3] transition-transform duration-500 ease-[cubic-bezier(0.3,1,0.8,1)] group-hover:scale-[25] z-0 pointer-events-none" />
                      <span className="relative z-10 font-bold text-sm uppercase tracking-wider text-[#44a0e3] group-hover:text-white transition-colors duration-300">
                        EXPLORE SOLUTIONS
                      </span>
                      <span className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full text-slate-800 group-hover:text-white transition-colors duration-300">
                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-0.5 transition-transform duration-300" />
                      </span>
                    </Link>
                  </motion.div>
                </div>

                {/* The Divider */}
                <div className="hidden xl:block w-px h-12 bg-slate-300/60 mx-2 flex-shrink-0" />

                {/* The Brand Marquee */}
                <div className="flex-1 min-w-0 w-full overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 [mask-image:linear-gradient(to_right,white_20%,transparent)]">
                  {/* Text flipped to slate-300 to stand out against dark gradient */}
                  <span className="text-xs uppercase tracking-widest text-slate-300 whitespace-nowrap flex-shrink-0 font-bold">
                    TRUSTED BY LEADING BRANDS
                  </span>

                  {/* Marquee Wrapper */}
                  <div className="relative overflow-hidden flex-1 min-w-0 w-full group py-2">
                    
                    {/* Animated Track */}
                    <div className="flex w-max animate-marquee gap-8 md:gap-12 items-center pr-8 md:pr-12">
                      
                      {/* Set 1 */}
                      {activeMarqueeLogos.map((logo, index) => {
                        const destination = logo.linked_brand
                          ? `/brands/${logo.linked_brand.slug || logo.linked_brand.id}`
                          : (logo.route_url?.trim() || null);

                        const isExternal =
                          destination ? (destination.startsWith('http://') || destination.startsWith('https://')) : false;

                        const itemClasses = `flex-shrink-0 flex items-center justify-center space-x-3 text-slate-900 font-bold tracking-tight text-sm md:text-base transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm rounded-xl px-6 py-2 shadow-sm ${
                          destination ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
                        }`;

                        const logoContent = logo.image_url ? (
                          <img src={getAssetUrl(logo.image_url)} alt={logo.name} className="h-8 md:h-12 object-contain max-w-[180px]" />
                        ) : (
                          <span>{logo.name}</span>
                        );

                        if (destination) {
                          if (isExternal) {
                            return (
                              <a
                                key={`set1-${logo.name}-${index}`}
                                href={destination}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={itemClasses}
                              >
                                {logoContent}
                              </a>
                            );
                          }
                          return (
                            <Link
                              key={`set1-${logo.name}-${index}`}
                              to={destination}
                              className={itemClasses}
                            >
                              {logoContent}
                            </Link>
                          );
                        }

                        return (
                          <div
                            key={`set1-${logo.name}-${index}`}
                            className={itemClasses}
                          >
                            {logoContent}
                          </div>
                        );
                      })}

                      {/* Set 2 (Identical Duplicate for Infinite Loop) */}
                      {activeMarqueeLogos.map((logo, index) => {
                        const destination = logo.linked_brand
                          ? `/brands/${logo.linked_brand.slug || logo.linked_brand.id}`
                          : (logo.route_url?.trim() || null);

                        const isExternal =
                          destination ? (destination.startsWith('http://') || destination.startsWith('https://')) : false;

                        const itemClasses = `flex-shrink-0 flex items-center justify-center space-x-3 text-slate-900 font-bold tracking-tight text-sm md:text-base transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm rounded-xl px-6 py-2 shadow-sm ${
                          destination ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
                        }`;

                        const logoContent = logo.image_url ? (
                          <img src={getAssetUrl(logo.image_url)} alt={logo.name} className="h-8 md:h-12 object-contain max-w-[180px]" />
                        ) : (
                          <span>{logo.name}</span>
                        );

                        if (destination) {
                          if (isExternal) {
                            return (
                              <a
                                key={`set2-${logo.name}-${index}`}
                                href={destination}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={itemClasses}
                              >
                                {logoContent}
                              </a>
                            );
                          }
                          return (
                            <Link
                              key={`set2-${logo.name}-${index}`}
                              to={destination}
                              className={itemClasses}
                            >
                              {logoContent}
                            </Link>
                          );
                        }

                        return (
                          <div
                            key={`set2-${logo.name}-${index}`}
                            className={itemClasses}
                          >
                            {logoContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* PAGE 2: FRAMER MOTION SCROLL-LOCKED ABOUT SECTION */}
          <div ref={aboutTrackRef} className="relative w-full">
            {/* The scroll-locked AboutSection */}
            <motion.div
              ref={aboutRef}
              style={{ y: aboutY }}
              className="relative z-10 w-full"
            >
              <AboutSection />
            </motion.div>

            {/* Scroll Runway Spacer: provides 100vh of physical scroll room for Page 3 to slide over Page 2 */}
            <div className="h-[100vh] w-full pointer-events-none" />
          </div>
        </div>
      </div>

      {/* PAGE 3+: SLIDING OVERLAP SECTION */}
      {/* -mt-[100vh] pulls Page 3 directly into the runway spacer, sliding smoothly over AboutSection */}
      <div className="relative z-20 w-full bg-[#fdfcf8] rounded-t-[3rem] shadow-[0_-30px_60px_rgba(0,0,0,0.25)] -mt-[100vh] pt-16 lg:pt-24">
        <PartnersSection />
        <PremiumProductsSection />
        <FeaturedProductsSection />
        <WhyChooseUsSection />
        <ServicesUSPSection />
        <TestimonialsSection />
        <BlogSection />
        <CTASection />
      </div>
    </div>
  );
};

export default Landing;