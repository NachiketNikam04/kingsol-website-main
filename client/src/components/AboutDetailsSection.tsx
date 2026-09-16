import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WhoWeAreSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  marquee_headline: string;
  marquee_highlight_word: string;
  image_url: string;
}

interface AccordionItem {
  id: number;
  title: string;
  content: string;
}

interface PartnerLogo {
  id: number;
  name: string;
  image_url: string;
}

export default function AboutDetailsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [settings, setSettings] = useState<WhoWeAreSettings | null>(null);
  const [accordions, setAccordions] = useState<AccordionItem[]>([]);
  const [logos, setLogos] = useState<PartnerLogo[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE_URL}/about/who-we-are`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) setSettings(json.data.settings);
          if (Array.isArray(json.data.accordions) && json.data.accordions.length > 0) {
            setAccordions(json.data.accordions);
          }
          if (Array.isArray(json.data.logos) && json.data.logos.length > 0) {
            setLogos(json.data.logos);
          }
        }
      } catch (err) {
        console.warn('⚠️ [AboutDetailsSection] Who We Are API offline, using fallbacks:', err);
      }
    }
    loadData();
  }, []);

  const currentTagline = settings?.tagline || 'WHO WE ARE';
  const currentHeadline = settings?.headline || 'A solar company built on Clarity and accountability';
  const currentHighlightWord = settings?.highlight_word || 'Clarity';
  const currentMarqueeHeadline = settings?.marquee_headline || 'Trusted by 30+ companies';
  const currentMarqueeHighlightWord = settings?.marquee_highlight_word || '30+';
  const currentImage = settings?.image_url || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop';

  const defaultAccordions: AccordionItem[] = [
    {
      id: 1,
      title: 'Engineering-led design',
      content: 'We model each system around your site, usage, and goals to maximize long-term output.',
    },
    {
      id: 2,
      title: 'Premium equipment standards',
      content: "We source only the highest-tier panels and inverters to ensure maximum efficiency, durability, and a stronger ROI over the system's lifespan.",
    },
    {
      id: 3,
      title: 'Safety-first execution',
      content: 'Our certified installation teams strictly adhere to NEC codes and OSHA safety standards, guaranteeing a secure and reliable setup.',
    },
  ];

  const defaultLogos: PartnerLogo[] = [
    { id: 1, name: 'SunPower', image_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=400&auto=format&fit=crop' },
    { id: 2, name: 'Tesla Energy', image_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=400&auto=format&fit=crop' },
    { id: 3, name: 'Enphase Energy', image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=400&auto=format&fit=crop' },
    { id: 4, name: 'Canadian Solar', image_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=400&auto=format&fit=crop' },
  ];

  const activeAccordions = accordions.length > 0 ? accordions : defaultAccordions;
  const activeLogos = logos.length > 0 ? logos : defaultLogos;

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
    <section className="w-full bg-[#fdfcf8] py-24 text-slate-900">
      {/* CSS for Marquee */}
      <style>{`
        @keyframes marquee-horizontal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-horizontal {
          animation: marquee-horizontal 28s linear infinite;
        }
      `}</style>

      {/* Main Two-Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12 sm:mb-14">
        {/* Left Column: Image */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-6 w-full max-w-xl mx-auto lg:mx-0"
        >
          <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200/80 shadow-2xl shadow-slate-200/50 relative group">
            <img
              src={currentImage}
              alt="Solar Panel Inspection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
          </div>
        </motion.div>

        {/* Right Column: Text & Hover Accordion */}
        <div className="lg:col-span-6 flex flex-col w-full max-w-2xl mx-auto lg:mx-0">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            <span>{currentTagline}</span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
          >
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </motion.h2>

          {/* Accordion List */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-3"
            onMouseLeave={() => setOpenIndex(null)}
          >
            {activeAccordions.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id || index}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all duration-200 ease-out hover:scale-[1.01] active:scale-[0.99] cursor-pointer group ${
                    isOpen
                      ? 'border-slate-300 shadow-xl shadow-slate-200/50'
                      : 'border-slate-200/80 shadow-xs hover:shadow-md hover:shadow-slate-200/40 hover:border-slate-300/80'
                  }`}
                  onMouseEnter={() => setOpenIndex(index)}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div className="flex justify-between items-center gap-4">
                    <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 group-hover:text-[#44a0e3] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <button
                      type="button"
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base transition-all duration-200 ease-out shrink-0 shadow-xs group-hover:scale-105 active:scale-95 ${
                        isOpen
                          ? 'bg-[#44a0e3] text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-[#44a0e3] group-hover:text-white'
                      }`}
                      aria-label="Toggle accordion item"
                    >
                      {isOpen ? '−' : '+'}
                    </button>
                  </div>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-48 opacity-100 mt-3 pt-3 border-t border-slate-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 flex flex-col md:flex-row items-center gap-6 sm:gap-8 overflow-hidden">
        <div className="shrink-0 whitespace-nowrap">
          <motion.h4
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-2xl font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-3"
          >
            {renderDynamicHeadline(currentMarqueeHeadline, currentMarqueeHighlightWord)}
          </motion.h4>
        </div>

        {/* Scrolling Track */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="w-full overflow-hidden relative [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
        >
          <div className="flex gap-8 w-max animate-marquee-horizontal py-2">
            {[...activeLogos, ...activeLogos, ...activeLogos, ...activeLogos].map((logo, index) => (
              <div
                key={`logo-${logo.id || index}-${index}`}
                className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200/70 rounded-2xl shadow-xs hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] shrink-0"
              >
                {logo.image_url ? (
                  <img
                    src={getAssetUrl(logo.image_url)}
                    alt={logo.name}
                    className="h-8 w-auto max-w-[130px] object-contain transition-transform duration-300"
                  />
                ) : (
                  <span className="font-bold text-sm text-slate-900">{logo.name}</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { AboutDetailsSection };
