import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CTASection from '../components/CTASection';

export interface ServiceDetailItem {
  id: number;
  title: string;
  slug: string;
  short_desc: string;
  grid_img_url: string;
  hero_img_url: string;
  detail_title: string;
  paragraph1: string;
  paragraph2: string;
  checklist: string[];
  gallery_img_url: string;
}

export interface ServiceSidebarNav {
  id: number;
  title: string;
  slug: string;
}

export interface EmergencySettings {
  emergency_tagline: string;
  emergency_title: string;
  emergency_phone: string;
}

export default function ServiceDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [activeService, setActiveService] = useState<ServiceDetailItem | null>(null);
  const [allServices, setAllServices] = useState<ServiceSidebarNav[]>([]);
  const [emergencySettings, setEmergencySettings] = useState<EmergencySettings>({
    emergency_tagline: 'Emergency Support',
    emergency_title: 'Technical Dispatch Unit',
    emergency_phone: '+91 1234567890',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServiceDetail() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/services/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setActiveService(json.data.activeService);
          if (Array.isArray(json.data.allServices)) {
            setAllServices(json.data.allServices);
          }
          if (json.data.settings) {
            setEmergencySettings(json.data.settings);
          }
        } else {
          setActiveService(null);
        }
      } catch (err) {
        console.warn('⚠️ [ServiceDetail] Failed to fetch service detail API, using fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }

    loadServiceDetail();
  }, [slug]);

  // Fallback initial databases if offline
  const fallbackServices: ServiceDetailItem[] = [
    {
      id: 1,
      title: 'Solar panel cleaning services',
      slug: 'solar-panel-cleaning',
      short_desc: 'Automated and manual high-pressure deionized cleaning to maximize panel efficiency.',
      grid_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=1600&auto=format&fit=crop',
      detail_title: 'Professional Solar Panel Cleaning & Thermal Auditing',
      paragraph1:
        'Dust, environmental pollutants, and bird droppings can decrease solar array efficiency by up to 25%. Our specialized cleaning service utilizes deionized zero-mineral water and soft rotary brush systems engineered specifically for PV glass coatings.',
      paragraph2:
        'Regular maintenance visits include infrared thermal scanning to identify micro-cracks, hotspots, and degraded bypass diodes before they lead to generation downtime or fire hazards.',
      checklist: [
        'Deionized pure water washing prevents mineral residue spots.',
        'Non-abrasive anti-static treatment repels airborne dust particles.',
        'FLIR infrared thermography inspection included with every wash.',
        'Comprehensive performance yield report delivered post-clean.',
      ],
      gallery_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Off-grid solar installation',
      slug: 'off-grid-installation',
      short_desc: 'Turnkey independent solar systems with integrated battery storage for remote power.',
      grid_img_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=1600&auto=format&fit=crop',
      detail_title: 'Independent Off-Grid Solar & Battery Storage Architectures',
      paragraph1:
        'For remote agricultural facilities, eco-resorts, and off-grid industrial units, Kingsol engineers self-sustaining power architectures that operate completely decoupled from DISCOM utility grids.',
      paragraph2:
        'We pair high-capacity LiFePO4 battery banks with hybrid inverter systems to deliver uninterrupted 24/7 power with intelligent generator auto-start integration for extreme weather contingencies.',
      checklist: [
        'High-cycle LifePO4 lithium storage arrays with 10+ year lifespan.',
        'Pure sine wave hybrid inverters with sub-10ms UPS transfer.',
        'Remote telemetry monitoring via GSM and satellite IoT gateways.',
        'Turnkey engineering from load profiling to final commissioning.',
      ],
      gallery_img_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'Solar inverter repair services',
      slug: 'solar-inverter-repair',
      short_desc: 'Rapid diagnostic and component repair for string, micro, and central inverters.',
      grid_img_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1600&auto=format&fit=crop',
      detail_title: 'Rapid Inverter Diagnostics & Component Bench Servicing',
      paragraph1:
        'Inverters are the brain of any solar plant. When string or central inverters fault, immediate field response is required to prevent major generation loss.',
      paragraph2:
        'Kingsol maintains certified inverter repair labs stocked with OEM replacement IGBT modules, control boards, and cooling fans for brands like Feston, Huawei, Sungrow, and Schneider.',
      checklist: [
        'On-site field diagnostics within 4 hours for commercial plants.',
        'Component-level PCB repair and firmware flashing.',
        'OEM warranty processing and authorized replacement parts.',
        'Post-repair grid compliance and anti-islanding validation.',
      ],
      gallery_img_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 4,
      title: 'Solar system maintenance',
      slug: 'solar-system-maintenance',
      short_desc: 'Routine maintenance to ensure long-term safety and peak solar output.',
      grid_img_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1600&auto=format&fit=crop',
      detail_title: 'Comprehensive Preventative & Operations Maintenance (O&M)',
      paragraph1:
        'Protecting your 25-year solar investment requires proactive operational maintenance. Kingsol offers customized O&M contracts for C&I rooftop and utility ground installations.',
      paragraph2:
        'Our certified engineers conduct routine torque checking, IV curve tracing, insulation resistance testing, and earthing pit resistance audits to ensure code compliance and maximum yields.',
      checklist: [
        'Periodic mechanical torque check on mounting structures.',
        'String IV curve measurement to detect cell degradation.',
        'Transformer and HT panel insulation resistance testing.',
        '24/7 telemetry monitoring with proactive alarm dispatch.',
      ],
      gallery_img_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 5,
      title: 'Wind turbine repair services',
      slug: 'wind-turbine-repair',
      short_desc: 'Expert wind turbine servicing to maximize efficiency and performance.',
      grid_img_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1600&auto=format&fit=crop',
      detail_title: 'Wind Turbine Gearbox & Blade Structural Maintenance',
      paragraph1:
        'For hybrid wind-solar plants, maintaining wind turbine uptime is crucial for round-the-clock power generation. Kingsol provides specialized wind generator field services.',
      paragraph2:
        'Our rope-access technicians and electro-mechanical engineers conduct blade aerodynamic repair, gearbox oil sampling, generator alignment, and yaw pitch control servicing.',
      checklist: [
        'Rope-access composite blade repair and leading-edge protection.',
        'Gearbox vibration analysis and oil filtration.',
        'Slip ring and carbon brush assembly replacement.',
        'Full electrical safety and lightning protection testing.',
      ],
      gallery_img_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1200&auto=format&fit=crop',
    },
    {
      id: 6,
      title: 'Rooftop solar panel installation',
      slug: 'rooftop-solar-installation',
      short_desc: 'High-quality rooftop solar installations for homes and businesses.',
      grid_img_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?q=80&w=1600&auto=format&fit=crop',
      detail_title: 'Turnkey Commercial & Residential Rooftop Solar Solutions',
      paragraph1:
        'Transform unutilized roof space into a high-yielding power generation asset. Kingsol delivers custom-engineered rooftop solar installations designed for wind loads up to 170 km/h.',
      paragraph2:
        'We handle every step: shade analysis, structural load testing, aluminum/galvanized mounting fabrication, net-metering paperwork with local DISCOMs, and system synchronization.',
      checklist: [
        'Custom 3D PVSyst shadow analysis and architectural modeling.',
        'Non-penetrative clamp options for standing seam metal roofs.',
        'Complete net-metering DISCOM paperwork management.',
        '25-Year linear power generation performance warranty.',
      ],
      gallery_img_url: 'https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  const currentService = activeService || fallbackServices.find((s) => s.slug === slug);
  const sidebarServicesList =
    allServices.length > 0 ? allServices : fallbackServices.map((s) => ({ id: s.id, title: s.title, slug: s.slug }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] text-slate-500 font-medium">
        Loading Service Details...
      </div>
    );
  }

  if (!currentService) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-slate-900">
        <h1 className="text-3xl font-extrabold font-poppins mb-4">Service Not Found</h1>
        <button
          onClick={() => navigate('/services')}
          className="bg-[#78C257] text-slate-900 font-medium px-6 py-3 rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
        >
          View All Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-32 pb-0 text-slate-900 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto px-6 w-full">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-12">
          <Link className="hover:text-slate-900 transition-colors" to="/services">
            Services
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{currentService.title}</span>
        </div>

        {/* Hero Banner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
            >
              KINGSOL SERVICE
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
            >
              {currentService.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal mb-8"
            >
              {currentService.paragraph1}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              <Link
                to="/contact"
                className="inline-flex bg-white text-slate-900 px-8 py-4 rounded-full font-medium text-sm hover:bg-[#44a0e3] hover:text-slate-900 transition-colors shadow-lg items-center gap-2 cursor-pointer border border-slate-200"
              >
                <span>Get Free Consultation</span>
                <span><svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="w-full aspect-square rounded-[3rem] overflow-hidden bg-slate-100 shadow-[0_20px_40px_rgba(243,156,18,0.15)] border border-slate-200"
          >
            <img src={getAssetUrl(currentService.hero_img_url)} alt={currentService.title} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        {/* Main Split Two-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-slate-200 pt-16 mb-20">
          {/* Left Sticky Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-4"
          >
            <div className="lg:sticky lg:top-32 bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-3">
              <h3 className="mt-5 mb-5 text-2xl font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-tight">
                All Services
              </h3>
              {sidebarServicesList.map((s) => {
                const isActive = s.slug === currentService.slug;
                return (
                  <button
                    key={s.slug}
                    onClick={() => navigate(`/services/${s.slug}`)}
                    className={`w-full text-left px-5 py-4 rounded-2xl font-medium text-sm flex items-center justify-between transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-[#1A6bc4] text-white shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-[#78C257] hover:text-slate-900'
                    }`}
                  >
                    <span className="text-slate-900 leading-relaxed">{s.title}</span>
                    <span className="text-lg font-light shrink-0"><svg className="w-4 h-4 inline-block ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
                  </button>
                );
              })}

              <div className="mt-6 bg-slate-800 text-white p-6 rounded-2xl">
                <span className="text-brand-orange text-xs font-bold uppercase tracking-widest block mb-2">
                  {emergencySettings.emergency_tagline || 'Emergency Support'}
                </span>
                <h4 className="text-xl md:text-2xl font-bold font-poppins text-white mb-4 mt-3">{emergencySettings.emergency_title || 'Technical Dispatch Unit'}</h4>
                <a
                  href={`tel:${emergencySettings.emergency_phone || '+91 1234567890'}`}
                  className="inline-block bg-white text-slate-900 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-brand-green transition-colors"
                >
                  {emergencySettings.emergency_phone || '+91 1234567890'}
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-8 flex flex-col gap-12"
          >
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-5 text-2xl font-poppins font-bold tracking-tight shrink-0 text-slate-900 leading-tight mb-5"
              >
                {currentService.detail_title || currentService.title}
              </motion.h2>
              <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
                {currentService.paragraph1}
              </p>
              <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
                {currentService.paragraph2}
              </p>
            </div>

            {/* Key Value Propositions */}
            {currentService.checklist && currentService.checklist.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
              >
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mt-5 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-5"
                >
                  Key Value <span className="text-[#44a0e3]">Propositions</span>
                </motion.h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentService.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-slate-600 font-medium text-sm leading-relaxed">
                      <div className="mt-2 w-5 h-5 rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold shrink-0 mt-0.5">
                        ✓
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Photo Gallery Banner */}
            {currentService.gallery_img_url && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="w-full h-80 rounded-[2rem] overflow-hidden shadow-lg border border-slate-200 mb-20"
              >
                <img
                  src={getAssetUrl(currentService.gallery_img_url)}
                  alt={currentService.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edge-to-Edge CTA Section */}
      <CTASection />
    </div>
  );
}

export { ServiceDetail };
