import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export interface MediaItem {
  id: number;
  title: string;
  youtube_url: string;
  thumbnail_url: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export const MediaPage: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedia() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/media/public`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data) {
          setItems(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [MediaPage] API offline, using fallback data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  }, []);

  const defaultItems: MediaItem[] = [
    {
      id: 1,
      title: 'Kingsol Corporate Profile - Engineering Renewable Excellence',
      youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      description:
        'An overview of Kingsol Energy procurement capabilities, rooftop solar installations, and Tier-1 partners across India.',
      is_active: true,
      sort_order: 1,
    },
    {
      id: 2,
      title: 'Utility-Scale Solar EPC Workflows & On-Site Quality Assurance',
      youtube_url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
      thumbnail_url: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/maxresdefault.jpg',
      description:
        'Step-by-step walkthrough of our high-voltage transformer integration and grid synchronization process.',
      is_active: true,
      sort_order: 2,
    },
    {
      id: 3,
      title: 'Smart Inverter Telemetry & Remote Monitoring Demonstration',
      youtube_url: 'https://www.youtube.com/watch?v=L_LUpnjgPso',
      thumbnail_url: 'https://img.youtube.com/vi/L_LUpnjgPso/maxresdefault.jpg',
      description:
        'Discover how our real-time SCADA telemetry tracks MPPT efficiency and remote fault isolation.',
      is_active: true,
      sort_order: 3,
    },
  ];

  const activeVideos = items.length > 0 ? items : defaultItems;

  const tagline = 'VIDEO CENTER';
  const headline = 'Media & Presentations.';
  const highlightWord = 'Presentations.';
  const subtitle =
    'Watch product demonstrations, technical EPC engineering walkthroughs, and grid-tie solar telemetry webinars.';

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

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-32 pb-16 text-slate-900 overflow-x-clip">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* Header Block */}
        <div className="mb-16">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-brand-green uppercase tracking-widest text-sm mb-4 font-bold block"
          >
            {tagline}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-5 text-4xl md:text-5xl font-extrabold font-lato text-slate-900 leading-tight max-w-3xl tracking-tight"
          >
            {renderDynamicHeadline(headline, highlightWord)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed max-w-2xl"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* 3-Column Video Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading video media...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: (index % 3) * 0.1, ease: "easeOut" }}
                onClick={() => setActiveMedia(video)}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
                    <img
                      src={getAssetUrl(video.thumbnail_url)}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />

                    {/* Play Button Icon Overlay */}
                    <div className="w-14 h-14 rounded-full bg-brand-green text-slate-900 flex items-center justify-center shadow-xl relative z-10 group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current translate-x-0.5" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-bold font-lato text-slate-900 mb-3 group-hover:text-[#44a0e3] transition-colors">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-base md:text-lg text-slate-600 leading-relaxed">{video.description}</p>
                    )}
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-green flex items-center gap-1.5">
                    <span>Watch Video</span>
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </span>
                  <a
                    href={video.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Embedded YouTube Modal */}
      <AnimatePresence>
        {activeMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveMedia(null)}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
            >
              <button
                onClick={() => setActiveMedia(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-slate-950/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-full aspect-video bg-black">
                <iframe
                  src={getEmbedUrl(activeMedia.youtube_url)}
                  title={activeMedia.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="p-6 md:p-8 bg-slate-900 text-white">
                <h3 className="text-xl md:text-2xl font-bold font-lato mb-2">{activeMedia.title}</h3>
                {activeMedia.description && (
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed">{activeMedia.description}</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default MediaPage;
