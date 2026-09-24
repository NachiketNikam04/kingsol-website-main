import { API_BASE_URL } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Activity, Wrench, ShieldCheck, Cpu, BarChart3, Sun, Zap, Shield, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface MaintenanceSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface MaintenanceCard {
  id?: number;
  title: string;
  description: string;
  icon_name: string;
  sort_order?: number;
}

interface MaintenanceData {
  settings: MaintenanceSettings;
  cards: MaintenanceCard[];
}

const iconMap: Record<string, LucideIcon> = {
  Activity,
  Wrench,
  ShieldCheck,
  Cpu,
  BarChart3,
  Sun,
  Zap,
  Shield,
};

const cardColors = [
  'bg-white border-[#b7f07a] shadow-',
  'bg-white border-brand-orange',
  'bg-white border-[#44a0e3]',
  'bg-white border-[#b7f07a]',
  'bg-white border-brand-orange',
];

export const ServicesUSPSection: React.FC = () => {
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceData | null>(null);

  useEffect(() => {
    async function loadMaintenanceData() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/maintenance`);
        const json = await res.json();
        if (json.success && json.data) {
          setMaintenanceData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [ServicesUSPSection] Live API offline, using fallback defaults:', err);
      }
    }
    loadMaintenanceData();
  }, []);

  const defaultCards: MaintenanceCard[] = [
    {
      title: '24/7 AI System Monitoring',
      description: 'Real-time automated performance telemetry tracking every module for optimal energy harvesting and instant fault alerts.',
      icon_name: 'Activity',
    },
    {
      title: 'Scheduled Maintenance Visits',
      description: 'Bi-annual comprehensive thermal imaging, panel cleaning, electrical tightening, and inverter diagnostic health checks.',
      icon_name: 'Wrench',
    },
    {
      title: 'Rapid On-Site Repair Support',
      description: 'Dedicated regional EPC technician dispatch within 24 hours to resolve grid disconnects or hardware faults.',
      icon_name: 'ShieldCheck',
    },
    {
      title: 'Capacity & Performance Upgrades',
      description: 'Seamless modular expansions, battery storage retrofits, and high-efficiency inverter upgrades for growing loads.',
      icon_name: 'Cpu',
    },
    {
      title: 'Yield & Energy Audits',
      description: 'Detailed revenue loss analysis, degradation tracking, and DISCOM tariff optimization reports for maximized ROI.',
      icon_name: 'BarChart3',
    },
  ];

  const currentTagline = maintenanceData?.settings?.tagline || 'MAINTENANCE & SUPPORT';
  const currentHeadline = maintenanceData?.settings?.headline || 'Keeping your Solar system efficient.';
  const currentHighlightWord = maintenanceData?.settings?.highlight_word || 'Solar';
  const currentSubtitle = maintenanceData?.settings?.subtitle || 'Ensuring smooth performance all year for reliable solar energy output.';

  const activeCards = maintenanceData?.cards && maintenanceData.cards.length > 0 ? maintenanceData.cards : defaultCards;

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
    <section className="w-full py-[72px] bg-[#fdfcf8] relative text-slate-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left Column (Sticky Header) */}
        <div className="lg:sticky lg:top-32 self-start flex flex-col pt-8">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            {currentTagline}
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
          >
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-slate-700 text-base md:text-lg mt-6 mb-6 leading-relaxed font-normal"
          >
            {currentSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <Link
              to="/contact"
              className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-1 shadow-md hover:bg-[#44a0e3] hover:text-white hover:shadow-[0_20px_40px_rgba(243,156,18,0.15)] inline-flex w-fit items-center gap-2 cursor-pointer border border-slate-200/60 hover:border-transparent"
            >
              <span>Call Support Now</span>
            </Link>
          </motion.div>
        </div>

        {/* Right Column (The Stacking Solid Vibrant Cards + Centered Thread Line) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="relative flex flex-col gap-12 pb-[20vh]"
        >
          {/* Centered Vertical Dashed Conduit Thread */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-12 w-0.5 border-l-2 border-dashed border-slate-300 pointer-events-none z-0" />

          {activeCards.map((service, index) => {
            const IconComponent = iconMap[service.icon_name] || Activity;
            const colorStyle = cardColors[index % cardColors.length];

            return (
              <div
                key={service.id || index}
                className={`sticky rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(68,160,227,0.2)] border flex flex-col transition-all duration-300 group origin-center z-10 ${colorStyle} ${
                  index % 2 === 0 ? '-rotate-2' : 'rotate-2'
                }`}
                style={{ top: `calc(8rem + ${index * 1.5}rem)` }}
              >
                {/* Icon Area */}
                <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-white mb-5 shadow-xs">
                  <IconComponent className="w-5 h-5 text-white stroke-[2.5]" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1">
                  {service.description}
                </p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesUSPSection;
