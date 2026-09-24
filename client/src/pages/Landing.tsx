import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sun, Zap, BatteryCharging, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AboutSection } from '../components/AboutSection';
import { PartnersSection } from '../components/PartnersSection';
import { PremiumProductsSection } from '../components/PremiumProductsSection';
import { FeaturedProductsSection } from '../components/FeaturedProductsSection';
import { WhyChooseUsSection } from '../components/WhyChooseUsSection';
import { MaintenanceSupportSection } from '../components/MaintenanceSupportSection';
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

  // Auto-cycle through hero slides every 10 seconds
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => {
        setPrevSlide(prev);
        return (prev + 1) % activeSlides.length;
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

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
    <div className="w-full relative bg-[#fdfcf8] text-slate-900 font-poppins">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-screen w-full flex flex-col justify-center bg-slate-950 overflow-hidden pt-28 sm:pt-36 pb-20 sm:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Background Crossfade Carousel Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {/* Outgoing Slide Fixed Background Base */}
          <div
            className="absolute inset-0 bg-cover bg-no-repeat z-0"
            style={{
              backgroundImage: `url('${getAssetUrl(activeSlides[prevSlide]?.image || currentSlideData.image)}')`,
              backgroundPosition: 'center 60%',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/80" />
          </div>

          {/* Active Slide Crossfade */}
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              className="absolute inset-0 w-full h-full z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            >
              <img
                src={getAssetUrl(currentSlideData.image)}
                alt=""
                className="w-full h-full object-cover object-[center_60%]"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-black/80" />
            </motion.div>
          </AnimatePresence>

          {/* Darkening Gradient Overlay */}
          <div className="absolute inset-0 bg-black/30 z-20 pointer-events-none" />
        </div>

        {/* Foreground Hero Content */}
        <div className="relative z-30 flex flex-col items-start justify-center gap-6 md:gap-8 w-full max-w-[90rem] mx-auto my-auto text-left">
          {/* Animated Headline in Natural Document Flow */}
          <div className="w-full max-w-4xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h1
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.05, ease: [0.76, 0, 0.24, 1] }}
                className="text-5xl md:text-7xl font-poppins font-semibold mb-2 leading-tight [text-shadow:0_2px_24px_rgba(0,0,0,0.85),0_4px_40px_rgba(0,0,0,0.5)] text-white max-w-4xl"
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
            className="mt-2 font-poppins text-base md:text-lg text-slate-200 max-w-2xl leading-relaxed"
          >
            {currentSubtitle}
          </motion.p>

          {/* Brand Marquee Row (Full-width breakout directly below hero description) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="w-full mt-4 sm:mt-6 flex flex-col gap-3"
          >
            {/* Overline Label */}
            <span className="text-xs uppercase tracking-widest text-slate-300 whitespace-nowrap font-bold font-poppins">
              TRUSTED BY LEADING BRANDS
            </span>

            {/* Full-Width Viewport-Spanning Marquee Container */}
            <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
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
          </motion.div>
        </div>

        {/* Cloud Shape Divider Transition (Asymmetrical Low-to-High) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform translate-y-[1px] z-30 pointer-events-none">
          <svg
            className="relative block w-full h-[30px] sm:h-[45px] md:h-[60px] fill-[#fdfcf8]"
            viewBox="0 0 1440 160"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Billowing Cloud Puff Layer (for depth) */}
            <path
              d="M0,142 C60,138 120,126 180,130 C230,105 300,98 360,110 C410,58 485,54 540,72 C600,28 680,24 740,42 C800,2 895,-2 960,18 C1020,-18 1120,-16 1180,4 C1240,-4 1310,-2 1360,16 C1390,8 1420,12 1440,24 L1440,160 L0,160 Z"
              opacity="0.4"
            />
            {/* Foreground Asymmetrical Fluffy Cloud Path (Low on Left -> High & Fluffy on Right) */}
            <path
              d="M0,135 C35,130 75,122 120,125 C160,110 220,112 260,118 C295,98 350,92 390,102 C425,78 480,72 520,82 C555,56 605,52 640,68 C675,40 730,36 770,54 C805,22 870,18 910,38 C950,5 1020,4 1060,22 C1100,-8 1170,-6 1210,12 C1250,2 1300,6 1340,26 C1375,18 1415,22 1440,38 L1440,160 L0,160 Z"
            />
          </svg>
        </div>
      </section>

      {/* 2. WHAT WE DO (ABOUT SECTION) - Clean Normal Flow with Solid White Background */}
      <AboutSection />

      {/* 3. WHO WE TRUST & REMAINING CONTENT SECTIONS */}
      <div className="w-full bg-[#fdfcf8]">
        <PartnersSection />
        <PremiumProductsSection />
        <FeaturedProductsSection />
        <WhyChooseUsSection />
        <MaintenanceSupportSection />
        <TestimonialsSection />
        <BlogSection />
        <CTASection />
      </div>
    </div>
  );
};

export default Landing;