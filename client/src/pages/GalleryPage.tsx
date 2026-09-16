import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';


export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export const GalleryPage: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGallery() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/gallery/public`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          setItems(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [GalleryPage] API offline, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const defaultItems: GalleryItem[] = [
    {
      id: 1,
      title: '500kW Rooftop Solar Installation - Commercial Facility',
      image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
      category: 'Projects',
      is_active: true,
      sort_order: 1,
    },
    {
      id: 2,
      title: 'Tier-1 Monocrystalline Bifacial Panel Inspection',
      image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1200&auto=format&fit=crop',
      category: 'Engineering',
      is_active: true,
      sort_order: 2,
    },
    {
      id: 3,
      title: 'Utility-Scale Ground Mounted Solar Farm',
      image_url: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1200&auto=format&fit=crop',
      category: 'Projects',
      is_active: true,
      sort_order: 3,
    },
    {
      id: 4,
      title: 'Kingsol Technical Expo & Green Energy Summit 2026',
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
      category: 'Events',
      is_active: true,
      sort_order: 4,
    },
    {
      id: 5,
      title: 'High Efficiency Central String Inverter Array',
      image_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1200&auto=format&fit=crop',
      category: 'Engineering',
      is_active: true,
      sort_order: 5,
    },
    {
      id: 6,
      title: 'C&I Battery Energy Storage System (BESS) Deployment',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
      category: 'Projects',
      is_active: true,
      sort_order: 6,
    },
  ];

  const activeGallery = items.length > 0 ? items : defaultItems;

  const categories = ['All', ...Array.from(new Set(activeGallery.map((i) => i.category || 'Projects')))];

  const filteredItems =
    selectedCategory === 'All'
      ? activeGallery
      : activeGallery.filter((i) => i.category?.toLowerCase() === selectedCategory.toLowerCase());

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
        {/* Header Block */}
        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            {tagline}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
          >
            {renderDynamicHeadline(headline, highlightWord)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mt-4 font-poppins text-base md:text-lg text-slate-700 leading-relaxed max-w-2xl"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-wrap gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Masonry / Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading project gallery...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                onClick={() => setActiveItem(item)}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: "easeOut" }}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <img
                    src={getAssetUrl(item.image_url)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />

                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    {item.category}
                  </span>

                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:scale-110">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 mb-3 group-hover:text-[#44a0e3] transition-colors">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {activeItem && (
        <div
          onClick={() => setActiveItem(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
          >
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/60 text-white flex items-center justify-center hover:bg-slate-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full max-h-[70vh] bg-slate-950 flex items-center justify-center overflow-hidden">
              <img src={getAssetUrl(activeItem.image_url)} alt={activeItem.title} className="w-full h-full object-contain max-h-[70vh]" />
            </div>

            <div className="p-6 md:p-8 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-brand-green text-xs font-black uppercase tracking-widest block mb-1">
                  {activeItem.category}
                </span>
                <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-3 line-clamp-1 group-hover:text-[#44a0e3] transition-colors">{activeItem.title}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;
