import { getAssetUrl } from '../utils/assetUrl';
import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  features: [string, string];
  imageUrl: string;
}

export const productsData: ProductItem[] = [
  {
    id: '1',
    title: 'Mono-PERC Solar Panels',
    description: 'High-efficiency N-Type TOPCon & Monocrystalline PV modules engineered for commercial & industrial installations.',
    features: ['Up to 22.8% Module Efficiency', '30-Year Linear Output Warranty'],
    imageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    title: 'Grid-Tie String Inverters',
    description: 'Multi-MPPT three-phase commercial string inverters with high power density and cloud monitoring.',
    features: ['10 Independent MPPT Channels', 'IP66 Industrial Weatherproof'],
    imageUrl: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    title: 'LiFePO4 Energy Storage',
    description: 'Rack-mountable lithium iron phosphate battery packs with integrated liquid cooling & smart BMS.',
    features: ['6,000+ Deep Cycle Lifespan', 'Modular 100kWh Container Packs'],
    imageUrl: 'https://images.unsplash.com/photo-1558441719-67450807e989?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '4',
    title: 'Single-Axis Solar Trackers',
    description: 'Galvanized steel solar tracker racking hardware optimized for maximum daily yield harvesting.',
    features: ['Up to +25% Energy Gain', '160 km/h Wind Load Rating'],
    imageUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '5',
    title: 'Turnkey Microgrid Systems',
    description: 'Integrated hybrid solar microgrids engineered for remote industrial facilities and commercial campuses.',
    features: ['Seamless Off-Grid Switchover', 'Smart Peak-Shaving Logic'],
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '6',
    title: 'Commercial EV Chargers',
    description: 'High-speed DC fast charging stations powered directly by solar PV array integration.',
    features: ['Dual 180kW CCS2 Charging Ports', 'OCPP 1.6J Cloud Management'],
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
  },
];

export const ProductCategoriesSection: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [scrollLeftState, setScrollLeftState] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(1);

  // Update active index indicator on scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    const cardWidth = 420;
    const newIndex = Math.min(
      productsData.length,
      Math.max(1, Math.round(scrollLeft / cardWidth) + 1)
    );
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.addEventListener('scroll', handleScroll);
      return () => node.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Mouse Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  // Left / Right Arrow Scroll Buttons
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -420, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 420, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full py-24 bg-white text-slate-900 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-slate-200">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="text-slate-500 uppercase tracking-widest text-xs font-bold block mb-2"
            >
              • Industrial Catalog •
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-4xl md:text-5xl font-bold font-lato text-slate-900 tracking-tight"
            >
              Explore Our Products
            </motion.h2>
          </div>

          {/* Controls & Pagination Counter */}
          <div className="flex items-center space-x-6">
            <span className="text-lg font-extrabold text-slate-400 font-mono tracking-wider">
              0{activeIndex} / 0{productsData.length}
            </span>

            <div className="flex items-center space-x-3">
              <button
                onClick={scrollLeft}
                aria-label="Scroll left"
                className="p-3.5 rounded-full bg-slate-100 hover:bg-transparent text-slate-800 transition-colors shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <button
                onClick={scrollRight}
                aria-label="Scroll right"
                className="p-3.5 rounded-full bg-slate-100 hover:bg-transparent text-slate-800 transition-colors shadow-sm active:scale-95"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Draggable Carousel Track */}
        <motion.div
          ref={scrollRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-6 overflow-x-auto snap-x snap-mandatory mt-12 py-4 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {productsData.map((item) => (
            <div
              key={item.id}
              className="min-w-[320px] md:min-w-[400px] flex-shrink-0 snap-center bg-transparent rounded-3xl p-6 sm:p-8 flex flex-col border border-slate-200/50 shadow-sm hover:shadow-md transition-shadow duration-300 group"
            >
              {/* Product Image Area */}
              <div className="w-full h-48 rounded-2xl mb-6 overflow-hidden bg-slate-200 relative border border-slate-300/40">
                <img
                  src={getAssetUrl(item.imageUrl)}
                  alt={item.title}
                  draggable={false}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold font-lato text-slate-900 mb-2 group-hover:text-brand-orange transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                {item.description}
              </p>

              {/* Features List */}
              <div className="space-y-2 mb-6">
                {item.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-brand-green rounded-full flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Link */}
              <div className="mt-auto pt-4 border-t border-slate-300/60 flex items-center justify-between">
                <Link
                  to="/products"
                  className="text-slate-950 font-extrabold text-sm flex items-center space-x-1 hover:text-brand-green transition-colors"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductCategoriesSection;
