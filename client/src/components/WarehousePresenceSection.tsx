import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export interface WarehousePresenceData {
  warehouseTagline?: string;
  warehouseHeadline?: string;
  warehouseHighlightWord?: string;
  warehouseDescription?: string;
  warehouseMapImage?: string;
  warehouseLocations?: string[];
  tagline?: string;
  headline?: string;
  highlight_word?: string;
  description?: string;
  map_image_url?: string;
  locations?: string[];
}

export const WarehousePresenceSection: React.FC<{ initialData?: WarehousePresenceData }> = ({
  initialData,
}) => {
  const [data, setData] = useState<WarehousePresenceData | null>(initialData || null);

  useEffect(() => {
    async function loadWarehouseData() {
      try {
        const res = await fetch(`${API_BASE_URL}/about/warehouse`);
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [WarehousePresenceSection] Live API offline, using fallback defaults:', err);
      }
    }
    if (!initialData) {
      loadWarehouseData();
    }
  }, [initialData]);

  const currentTagline = data?.warehouseTagline || data?.tagline || 'PAN-INDIA PRESENCE';
  const currentHeadline =
    data?.warehouseHeadline ||
    data?.headline ||
    'Strategic warehousing across High-demand renewable corridors.';
  const currentHighlightWord =
    data?.warehouseHighlightWord || data?.highlight_word || 'High-demand';
  const currentMapImage =
    data?.warehouseMapImage ||
    data?.map_image_url ||
    '/assets/india-warehouse-map.jpg';

  const defaultLocations = [
    'Bhiwandi, Maharashtra',
    'Ahmedabad, Gujarat',
    'Bengaluru, Karnataka',
    'Chennai, Tamil Nadu',
    'Jaipur, Rajasthan',
    'Kolkata, West Bengal',
    'Hyderabad, Telangana',
    'Noida, Delhi NCR',
  ];

  const currentLocations =
    data?.warehouseLocations && data.warehouseLocations.length > 0
      ? data.warehouseLocations
      : data?.locations && data.locations.length > 0
      ? data.locations
      : defaultLocations;

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

  return (
    <section className="w-full bg-[#fdfcf8] py-[72px] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Map Image (~65% space) */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center p-0 m-0 w-full"
            >
              <img
                src={getAssetUrl(currentMapImage)}
                alt="India Warehouse & Distribution Map"
                className="w-full h-auto max-h-[850px] object-contain mix-blend-multiply select-none pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Right Column: Typography & Content (~35% space) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            {/* Tagline */}
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-4"
            >
              {currentTagline}
            </motion.span>

            {/* Headline with dynamic highlight word */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h2>

            {/* Warehouse Locations Two-Column Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {currentLocations.map((loc, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-slate-700 font-semibold text-sm transition-transform duration-200 hover:translate-x-1"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>{loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WarehousePresenceSection;
