import { API_BASE_URL } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FoundationSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  vision_title: string;
  vision_description: string;
  mission_title: string;
  mission_description: string;
}

interface ValueItem {
  id: number;
  title: string;
  description: string;
}

export default function ValuesMissionSection() {
  const [settings, setSettings] = useState<FoundationSettings | null>(null);
  const [values, setValues] = useState<ValueItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE_URL}/about/foundation`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) setSettings(json.data.settings);
          if (Array.isArray(json.data.values) && json.data.values.length > 0) {
            setValues(json.data.values);
          }
        }
      } catch (err) {
        console.warn('⚠️ [ValuesMissionSection] Foundation API offline, using fallbacks:', err);
      }
    }
    loadData();
  }, []);

  const currentTagline = settings?.tagline || 'THE FOUNDATION';
  const currentHeadline = settings?.headline || 'What drives Kingsol forward.';
  const currentHighlightWord = settings?.highlight_word || 'Kingsol';
  const currentVisionTitle = settings?.vision_title || 'Our Vision';
  const currentVisionDesc =
    settings?.vision_description ||
    'To engineer a world where clean, renewable energy is the undisputed baseline for every home and industry.';
  const currentMissionTitle = settings?.mission_title || 'Our Mission';
  const currentMissionDesc =
    settings?.mission_description ||
    'To deploy resilient, Tier-1 solar infrastructure backed by transparent engineering, rigorous quality controls, and lifetime accountability.';

  const defaultValues: ValueItem[] = [
    {
      id: 1,
      title: 'Engineering Rigor',
      description: 'Every rooftop and ground array is modeled with precise shading tolerances, wind load resistance, and structural durability.',
    },
    {
      id: 2,
      title: 'Radical Transparency',
      description: 'No hidden BOM costs or inflated yield estimates — clear technical datasheets and verifiable metrics from proposal to commissioning.',
    },
    {
      id: 3,
      title: 'Uncompromising Quality',
      description: 'We partner exclusively with Tier-1 OEMs backing performance for 25+ linear generation years with factory direct warranty support.',
    },
  ];

  const activeValues = values.length > 0 ? values : defaultValues;

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

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
  };

  return (
    <section className="w-full bg-[#FDFCF8] py-[72px] px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            <span>{currentTagline}</span>
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
        </div>

        {/* Top Bento Grid: Vision & Mission */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-5%' }}
          variants={containerVariants}
        >
          {/* Vision Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.99] shadow-xs hover:shadow-2xl hover:shadow-brand-orange/15 hover:border-brand-orange/30 cursor-default"
          >
            {/* Ambient Glowing Blur Orb */}
            <div className="absolute -right-12 -top-12 w-44 h-44 bg-brand-orange/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

            <div>
              <div className="flex justify-between items-center mb-5">
                <span className="px-3.5 py-1 bg-brand-orange/10 text-brand-orange text-xs tracking-widest uppercase font-extrabold rounded-full">
                  {currentVisionTitle}
                </span>
                <span className="text-slate-400 group-hover:text-brand-orange text-lg transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                  ↗
                </span>
              </div>
              <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-snug">
                {currentVisionDesc}
              </h3>
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.99] shadow-xs hover:shadow-2xl hover:shadow-brand-green/20 hover:border-brand-green/30 cursor-default"
          >
            {/* Ambient Glowing Blur Orb */}
            <div className="absolute -right-12 -top-12 w-44 h-44 bg-[#9beb46]/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

            <div>
              <div className="flex justify-between items-center mb-5">
                <span className="px-3.5 py-1 bg-brand-green/10 text-brand-green text-xs tracking-widest uppercase font-extrabold rounded-full">
                  {currentMissionTitle}
                </span>
                <span className="text-slate-400 group-hover:text-green text-lg transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                  ↗
                </span>
              </div>
              <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-snug">
                {currentMissionDesc}
              </h3>
            </div>
          </motion.div>
        </motion.div>

        {/* Dynamic Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {activeValues.map((value, index) => (
            <motion.div
              key={value.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: 'easeOut' }}
              className="bg-white border border-slate-200/80 rounded-[2rem] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.99] shadow-xs hover:shadow-2xl hover:shadow-[#44a0e3]/15 hover:border-[#44a0e3]/40 cursor-default"
            >
              {/* Glowing Blur Orb */}
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#44a0e3]/15 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

              <div>
                <div className="flex justify-between items-center mb-5 relative z-10">
                  <span className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-brand-blue/10 group-hover:text-brand-blue font-extrabold text-xs flex items-center justify-center transition-colors">
                    0{index + 1}
                  </span>
                  <span className="text-slate-400 group-hover:text-[#44a0e3] text-lg transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    ↗
                  </span>
                </div>

                <h4 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 group-hover:text-[#44a0e3] transition-colors mb-2.5 relative z-10">
                  {value.title}
                </h4>

                <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { ValuesMissionSection };