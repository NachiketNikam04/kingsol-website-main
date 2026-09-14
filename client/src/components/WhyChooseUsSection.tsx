import { API_BASE_URL } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WhyChooseSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface WhyChooseStep {
  id?: number;
  title: string;
  features: string[];
  sort_order?: number;
}

interface WhyChooseData {
  settings: WhyChooseSettings;
  steps: WhyChooseStep[];
}

export const WhyChooseUsSection: React.FC = () => {
  const [whyChooseData, setWhyChooseData] = useState<WhyChooseData | null>(null);

  useEffect(() => {
    async function loadWhyChooseData() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/why-choose`);
        const json = await res.json();
        if (json.success && json.data) {
          setWhyChooseData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [WhyChooseUsSection] Live API offline, using fallback defaults:', err);
      }
    }
    loadWhyChooseData();
  }, []);

  const defaultSteps: WhyChooseStep[] = [
    {
      title: 'Consultation & Site Audit',
      features: [
        'Free comprehensive site survey & shade analysis',
        'Customized 3D solar generation modeling',
        'Roof structural integrity & electrical load inspection',
      ],
    },
    {
      title: 'Personalized System Quote',
      features: [
        'Transparent Tier-1 component pricing breakdown',
        'DISCOM net-metering & government subsidy guidance',
        'Flexible financing & low-interest EMI options',
      ],
    },
    {
      title: 'Seamless Installation & Permitting',
      features: [
        'End-to-end DISCOM approval & grid interconnection',
        'Certified EPC engineering team deployment',
        'Rapid 48-hour turn-key installation timeline',
      ],
    },
    {
      title: 'Monitoring & Lifetime Support',
      features: [
        '24/7 AI-powered cloud performance tracking app',
        '5-year complimentary routine maintenance visits',
        'Guaranteed production output warranty',
      ],
    },
  ];

  const currentTagline = whyChooseData?.settings?.tagline || 'WHY CHOOSE KINGSOL';
  const currentHeadline = whyChooseData?.settings?.headline || 'From Consultation to Clean Energy in 4 Simple Steps';
  const currentHighlightWord = whyChooseData?.settings?.highlight_word || 'Consultation';
  const currentSubtitle = whyChooseData?.settings?.subtitle || 'We make switching to solar energy simple. Our streamlined process ensures you get the best solar solution quickly, affordably, and completely hassle-free.';

  const activeSteps = whyChooseData?.steps && whyChooseData.steps.length > 0 ? whyChooseData.steps : defaultSteps;

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
    <section className="w-full pt-14 pb-20 bg-[#fdfcf8] relative text-slate-900">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12">
        {/* Left Column (Sticky Header on Desktop) */}
        <div className="lg:sticky lg:top-32 self-start flex flex-col">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-brand-green uppercase tracking-widest text-sm mb-4 font-bold"
          >
            {currentTagline}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-5 text-5xl md:text-6xl font-bold font-poppins text-slate-900 leading-tight max-w-2xl tracking-tight"
          >
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal"
          >
            {currentSubtitle}
          </motion.p>
        </div>

        {/* Right Column (Outer Gray Block Container + Tightly Stacked Cards) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="bg-slate-50/80 md:bg-slate-100/50 rounded-[2rem] p-3 md:p-4 border border-slate-200/50"
        >
          <div className="flex flex-col gap-2 md:gap-3">
            {activeSteps.map((step, index) => (
              <div
                key={step.id || index}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm flex flex-col transition-all hover:shadow-[0_10px_30px_rgba(243,156,18,0.2)]"
              >
                {/* Compact Number Badge */}
                <div className="w-12 h-12 bg-[#b7f07a] rounded-xl flex items-center justify-center text-slate-900 font-semibold text-lg mb-4">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Card Title */}
                <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-3">
                  {step.title}
                </h3>

                {/* Compact List Items */}
                <ul className="flex flex-col gap-2">
                  {step.features?.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-slate-600 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
