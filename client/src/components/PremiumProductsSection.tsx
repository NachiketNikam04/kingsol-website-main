import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
            className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
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
              className="w-[80vw] sm:w-[320px] shrink-0 bg-white rounded-2xl p-4 flex flex-col transition-all duration-500 hover:shadow-lg border border-slate-200/60 group cursor-pointer snap-start select-none"
            >
              {/* Top Image Container (Reduced to 136px) */}
              <div className="w-full h-[136px] bg-slate-100 rounded-xl mb-4 overflow-hidden relative border border-slate-200">
                <span className="absolute top-4 left-4 z-10 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md bg-white text-brand-orange shadow-md leading-relaxed">
                  {product.tag}
                </span>
                <img
                  src={getAssetUrl(product.image_url)}
                  alt={product.title}
                  draggable={false}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                />
              </div>

              {/* Title */}
              <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-3 line-clamp-1 group-hover:text-[#44a0e3] transition-colors">
                {product.title}
              </h3>

              {/* Body */}
              <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1">
                {product.description}
              </p>

              {/* Footer text */}
              <div
                className="mt-auto pt-6 border-t border-slate-300/60 flex items-center justify-between font-bold text-slate-600 leading-relaxed group-hover:text-brand-green transition-colors"
              >
                <span>Explore Technology</span>
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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