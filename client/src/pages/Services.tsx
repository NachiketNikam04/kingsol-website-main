import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CTASection from '../components/CTASection';

interface ServicePageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
}

interface ServiceItem {
  id: number;
  title: string;
  slug: string;
  short_desc: string;
  grid_img_url: string;
}

export default function Services() {
  const [settings, setSettings] = useState<ServicePageSettings>({
    tagline: 'EXPERT SERVICES',
    headline: '10+ years of Excellence in the solar industry.',
    highlight_word: 'Excellence',
  });
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function loadServicesPage() {
      try {
        const res = await fetch(`${API_BASE_URL}/services/page`);
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data.settings);
          if (Array.isArray(json.data.services) && json.data.services.length > 0) {
            setServicesList(json.data.services);
          }
        }
      } catch (err) {
        console.warn('⚠️ [Services] Failed to fetch services page API, using fallback defaults:', err);
      }
    }

    loadServicesPage();
  }, []);

  // Fallback initial services if offline
  const fallbackServicesList: ServiceItem[] = [
    {
      id: 1,
      title: 'Solar panel cleaning services',
      slug: 'solar-panel-cleaning',
      short_desc: 'Automated and manual high-pressure deionized cleaning to maximize panel efficiency.',
      grid_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Off-grid solar installation',
      slug: 'off-grid-installation',
      short_desc: 'Turnkey independent solar systems with integrated battery storage for remote power.',
      grid_img_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Solar inverter repair services',
      slug: 'solar-inverter-repair',
      short_desc: 'Rapid diagnostic and component repair for string, micro, and central inverters.',
      grid_img_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 4,
      title: 'Solar system maintenance',
      slug: 'solar-system-maintenance',
      short_desc: 'Routine maintenance to ensure long-term safety and peak solar output.',
      grid_img_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 5,
      title: 'Wind turbine repair services',
      slug: 'wind-turbine-repair',
      short_desc: 'Expert wind turbine servicing to maximize efficiency and performance.',
      grid_img_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 6,
      title: 'Rooftop solar panel installation',
      slug: 'rooftop-solar-installation',
      short_desc: 'High-quality rooftop solar installations for homes and businesses.',
      grid_img_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const activeServices = servicesList.length > 0 ? servicesList : fallbackServicesList;

  // Case-Insensitive Headline Regex Splitter
  const renderHeadline = () => {
    const rawHeadline = settings.headline || '10+ years of Excellence in the solar industry.';
    const highlightWord = settings.highlight_word?.trim();

    if (!highlightWord) return rawHeadline;

    const escapedHighlight = highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');
    const parts = rawHeadline.split(regex);

    return parts.map((part, idx) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={idx} className="text-[#44a0e3]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-0 text-slate-900 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Header Section */}
        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            {settings.tagline || 'EXPERT SERVICES'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
          >
            {renderHeadline()}
          </motion.h1>
        </div>

        {/* Dynamic Services Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {activeServices.map((service, idx) => (
            <motion.div
              key={service.id || idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
              className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col group hover:shadow-[0_20px_40px_rgba(243,156,18,0.15)] transition-shadow duration-300"
            >
              <Link
                className="w-full h-60 rounded-2xl overflow-hidden bg-slate-100 mb-6 relative block"
                to={`/services/${service.slug}`}
              >
                <img
                  src={getAssetUrl(service.grid_img_url)}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>

              <div className="flex-grow">
                <Link to={`/services/${service.slug}`}>
                  <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 group-hover:text-[#44a0e3] transition-colors mb-3">
                    {service.title}
                  </h3>
                </Link>
                <p className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed mb-8">{service.short_desc}</p>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <Link
                  className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 group-hover:text-[#78C257] transition-colors"
                  to={`/services/${service.slug}`}
                >
                  <span>Read Details</span>
                  <span className="transform group-hover:translate-x-1 transition-transform"><svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Edge-to-Edge CTA Section */}
      <CTASection />
    </div>
  );
}

export { Services };
