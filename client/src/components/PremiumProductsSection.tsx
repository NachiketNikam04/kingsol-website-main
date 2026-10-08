import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface DynamicSolutionCard {
  id: number;
  tag: string;
  title: string;
  description: string;
  image_url: string;
  category_slug: string;
  sort_order?: number;
}

export interface SolutionsSettingsData {
  tagline?: string;
  headline?: string;
  highlight_word?: string;
}

const DEFAULT_CARDS: DynamicSolutionCard[] = [
  {
    id: 1,
    tag: 'PV MODULES',
    title: 'Monocrystalline Solar Modules',
    description: 'Authorized Tier-1 photovoltaic panels with up to 22.8% module efficiency and 25-year performance warranty.',
    image_url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    category_slug: 'solar-modules',
  },
  {
    id: 2,
    tag: 'POWER CONVERSION',
    title: 'Grid-Tie & Hybrid Inverters',
    description: 'High-efficiency string and central inverters with integrated smart telemetry, MPPT trackers, and grid sync.',
    image_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?auto=format&fit=crop&w=800&q=80',
    category_slug: 'solar-inverters',
  },
  {
    id: 3,
    tag: 'ENERGY STORAGE',
    title: 'C&I Battery Storage Systems',
    description: 'Scalable LiFePO4 battery energy storage solutions (BESS) for peak shaving, load shifting, and microgrids.',
    image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    category_slug: 'solar-inverters',
  },
  {
    id: 4,
    tag: 'ELECTRICAL BOS',
    title: 'Solar DC Cables & Connectors',
    description: 'TÜV certified 1500V DC cabling, MC4 connectors, combiner boxes, and DC isolator switches.',
    image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
    category_slug: 'solar-cables',
  },
];

export const PremiumProductsSection: React.FC = () => {
  // Dynamic Data State
  const [settings, setSettings] = useState<SolutionsSettingsData>({
    tagline: 'OUR SOLUTIONS',
    headline: 'Powering the Future , one panel at a time.',
    highlight_word: 'Future',
  });
  const [cards, setCards] = useState<DynamicSolutionCard[]>(DEFAULT_CARDS);

  // Slider State & Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  useEffect(() => {
    async function loadSolutionsData() {
      try {
        const res = await fetch(`${API_BASE_URL}/solutions`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) setSettings((prev) => ({ ...prev, ...json.data.settings }));
          if (json.data.cards && json.data.cards.length > 0) setCards(json.data.cards);
        }
      } catch (err) {
        console.warn('⚠️ [SolutionsSection] Fetch offline, using defaults:', err);
      }
    }
    loadSolutionsData();
  }, []);

  // Smooth scroll handler
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDown.current = true;
    setIsDragging(true);
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    isDown.current = false;
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    if (Math.abs(x - startX.current) > 5) {
      hasDragged.current = true;
    }
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Case-Insensitive Headline Highlight Renderer
  const renderHighlightedHeadline = (headline?: string, highlightWord?: string) => {
    const text = headline || 'Powering the Future , one panel at a time.';
    const word = highlightWord || 'Future';

    if (!word.trim()) return text;

    const regex = new RegExp(`(${word})`, 'gi');
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
    <section className="w-full py-[72px] bg-[#fdfcf8] relative overflow-hidden text-slate-900">
      {/* Header Area */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
          >
            {settings.tagline || 'OUR SOLUTIONS'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
          >
            {renderHighlightedHeadline(settings.headline, settings.highlight_word)}
          </motion.h2>
        </div>
      </div>

      {/* Interactive Drag & Slide Carousel Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="w-full relative"
      >
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-6 w-full overflow-x-auto px-6 pb-8 scrollbar-hide select-none transition-all [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isDragging ? 'snap-none cursor-grabbing' : 'snap-x snap-mandatory cursor-grab scroll-smooth'}`}
        >
          {cards.map((product) => (
            <Link
              to={`/products/${product.category_slug}`}
              key={product.id}
              draggable={false}
              onClick={(e) => {
                if (hasDragged.current) e.preventDefault();
              }}
              className="group relative w-[80vw] sm:w-[320px] h-[360px] shrink-0 rounded-2xl overflow-hidden cursor-pointer snap-start select-none shadow-md hover:shadow-2xl transition-shadow duration-500 border border-slate-200/20"
            >
              {/* 1. Background Image Container */}
              <div className="absolute inset-0 w-full h-full bg-slate-900 z-0">
                <img
                  src={getAssetUrl(product.image_url)}
                  alt={product.title}
                  draggable={false}
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:blur-[6px] pointer-events-none"
                />
              </div>

              {/* 2. Persistent Bottom Gradient (Protects Title in Default State) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 group-hover:opacity-0 z-10" />

              {/* 3. Full Dark Overlay (Protects Description/Button in Hover State) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-700 group-hover:opacity-100 z-10" />

              {/* 4. Sliding Content Wrapper */}
              <div className="absolute top-0 left-0 w-full h-full p-6 flex flex-col justify-start transform translate-y-[260px] group-hover:translate-y-0 transition-transform duration-700 ease-out z-20">
                
                {/* Title */}
                <h3 className="text-2xl font-poppins font-bold text-white group-hover:text-[#44a0e3] transition-colors duration-700 ease-out drop-shadow-lg line-clamp-2 leading-tight">
                  {product.title}
                </h3>

                {/* Hidden Content (Fades in on Hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100 flex flex-col gap-6 mt-4">
                  <p className="text-gray-200 font-montserrat text-sm leading-relaxed line-clamp-4 drop-shadow-md">
                    {product.description}
                  </p>

                  <div className="text-[#44a0e3] font-poppins font-semibold text-sm hover:underline inline-flex items-center gap-1 shrink-0">
                    Explore Technology &rarr;
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* Minimalist Navigation Buttons */}
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            aria-label="Previous solution"
            className="p-2 cursor-pointer focus:outline-none"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" />
          </button>
          <div className="w-16 h-[1px] bg-slate-300"></div>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            aria-label="Next solution"
            className="p-2 cursor-pointer focus:outline-none"
          >
            <ChevronRight className="w-5 h-5 text-slate-400 hover:text-slate-900 transition-colors" />
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default PremiumProductsSection;