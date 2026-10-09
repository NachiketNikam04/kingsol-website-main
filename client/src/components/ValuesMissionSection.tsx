import { API_BASE_URL } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Scale, Clock, Rocket, Eye } from 'lucide-react';

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
      title: 'Uncompromising Quality',
      description: 'We partner exclusively with Tier-1 OEMs backing performance for 25+ linear generation years with factory direct warranty support.',
    },
    {
      id: 2,
      title: 'Commercial Transparency',
      description: 'No hidden BOM costs or inflated yield estimates — clear technical datasheets and verifiable metrics from proposal to commissioning.',
    },
    {
      id: 3,
      title: 'Logistical Precision',
      description: 'Every rooftop and ground array is modeled with precise shading tolerances, wind load resistance, and structural durability.',
    },
  ];

  const activeValues = values.length > 0 ? values : defaultValues;

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

  const getValueIcon = (index: number, title?: string) => {
    const t = (title || '').toLowerCase();
    if (t.includes('quality') || t.includes('rigor') || t.includes('shield')) {
      return <ShieldCheck className="w-5 h-5 text-[#0078C8]" />;
    }
    if (t.includes('transparency') || t.includes('scale') || t.includes('commercial')) {
      return <Scale className="w-5 h-5 text-[#0078C8]" />;
    }
    if (t.includes('precision') || t.includes('logistical') || t.includes('clock') || t.includes('time')) {
      return <Clock className="w-5 h-5 text-[#0078C8]" />;
    }
    if (index % 3 === 0) return <ShieldCheck className="w-5 h-5 text-[#0078C8]" />;
    if (index % 3 === 1) return <Scale className="w-5 h-5 text-[#0078C8]" />;
    return <Clock className="w-5 h-5 text-[#0078C8]" />;
  };

  return (
    <section className="w-full bg-[#fdfcf8] py-[72px] px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-10 text-left">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-3"
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

        {/* Phase 2: Vision & Mission (Top Row Divided by a single line, directly on background) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#fdfcf8] mb-12"
        >
          {/* Mission Column */}
          <div className="py-8 md:py-4 md:pr-10 flex flex-col items-start justify-start">
            {/* Title Wrapper to center the glow */}
            <div className="relative inline-flex items-center mb-4">
              {/* Blue circle centered exactly behind the text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#44a0e3]/30 via-[#44a0e3]/5 to-transparent pointer-events-none z-0" />
              
              <div className="relative z-10 flex items-center gap-3">
                <Rocket className="w-7 h-7 text-[#44a0e3]" />
                <span className="text-[#44a0e3] font-bold text-sm tracking-wider uppercase mt-1">
                  {currentMissionTitle}
                </span>
              </div>
            </div>
            <h3 className="relative z-10 text-xl md:text-2xl font-semibold text-slate-900 leading-snug">
              {currentMissionDesc}
            </h3>
          </div>

          {/* Vision Column */}
          <div className="py-8 md:py-4 md:pl-10 flex flex-col items-start justify-start">
            {/* Title Wrapper to center the glow */}
            <div className="relative inline-flex items-center mb-4">
              {/* blue circle centered exactly behind the text */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#44a0e3]/30 via-[#44a0e3]/5 to-transparent pointer-events-none z-0" />
              
              <div className="relative z-10 flex items-center gap-3">
                <Eye className="w-7 h-7 text-[#44a0e3]" />
                <span className="text-[#44a0e3] font-bold text-sm tracking-wider uppercase mt-1">
                  {currentVisionTitle}
                </span>
              </div>
            </div>
            <h3 className="relative z-10 text-xl md:text-2xl font-semibold text-slate-900 leading-snug">
              {currentVisionDesc}
            </h3>
          </div>
        </motion.div>

        {/* Phase 3: Core Values (Bottom Row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeValues.map((value, index) => (
            <motion.div
              key={value.id || index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-start"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 border border-blue-100/60 flex items-center justify-center text-[#0078C8] shrink-0">
                  {getValueIcon(index, value.title)}
                </div>
                <h4 className="text-lg font-bold text-slate-900">
                  {value.title}
                </h4>
              </div>
              <p className="font-poppins text-base md:text-lg text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { ValuesMissionSection };