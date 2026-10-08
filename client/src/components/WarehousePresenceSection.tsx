import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

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

// Splits "Bhiwandi, Maharashtra" into { city: "Bhiwandi", region: "Maharashtra" }
const splitLocation = (value: string) => {
  const commaIndex = value.indexOf(',');
  if (commaIndex === -1) return { city: value.trim(), region: '' };
  return {
    city: value.slice(0, commaIndex).trim(),
    region: value.slice(commaIndex + 1).trim(),
  };
};

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
        <React.Fragment key={index}>{part}</React.Fragment>
      )
    );
  };

  return (
    <section className="w-full bg-[#fdfcf8] py-[72px] text-slate-900 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 relative z-10">

        {/* 3-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* LEFT COLUMN: Typography (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-4"
            >
              {currentTagline}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h2>
          </div>

          {/* CENTER COLUMN: Admin-panel Map Image (lg:col-span-6) */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative w-full max-w-[650px] flex items-center justify-center"
            >
              {/* mix-blend-multiply makes a white image background melt into the section background */}
              <img
                src={getAssetUrl(currentMapImage)}
                alt="India Warehouse & Distribution Map"
                className="w-full h-auto max-h-[700px] object-contain mix-blend-multiply select-none pointer-events-none"
              />
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Locations List (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-center border-l border-slate-200/60 pl-8 h-[500px] sm:h-[600px] overflow-y-auto scrollbar-hide">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-4 py-4"
            >
              {currentLocations.map((loc, idx) => {
                const { city, region } = splitLocation(loc);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-white/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(68,160,227,0.1)] group cursor-default"
                  >
                    {/* Pin icon */}
                    <div className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm border border-white flex items-center justify-center shrink-0 shadow-sm group-hover:border-[#44a0e3]/30 transition-colors">
                      <MapPin className="w-4 h-4 text-[#44a0e3]" />
                    </div>

                    {/* City (primary) + State/Region (secondary) */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <p className="font-poppins text-sm font-semibold text-slate-800 leading-tight truncate group-hover:text-[#44a0e3] transition-colors">
                        {city}
                      </p>
                      {region && (
                        <p className="font-poppins text-[11px] font-medium uppercase tracking-widest text-gray-400 mt-1 truncate">
                          {region}
                        </p>
                      )}
                    </div>

                    {/* Index number */}
                    <span className="font-poppins text-xs font-semibold text-slate-300 group-hover:text-[#44a0e3]/50 transition-colors shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WarehousePresenceSection;