import { API_BASE_URL } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';

interface ContactSettings {
  hero_tagline: string;
  hero_headline: string;
  hero_highlight: string;
  form_headline: string;
  form_subtitle: string;
  form_success_msg: string;
  hq_tagline: string;
  hq_headline: string;
  hq_highlight: string;
  hq_address: string;
  hq_map_url: string;
  hq_hours: string;
  hq_certification: string;
  infra_tagline: string;
  infra_headline: string;
  infra_highlight: string;
  faq_tagline: string;
  faq_headline: string;
  quote_text: string;
  quote_author: string;
}

interface Department {
  id: number;
  title: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
}

interface InfraCard {
  id: number;
  title: string;
  description: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

// Cloud outline paths for the quote section (stretched to fit the quote via preserveAspectRatio="none")
const CLOUD_PATH_DESKTOP =
  'M 180 400 A 125 125 0 0 1 52 276 A 68 68 0 0 1 52 170 A 112 112 0 0 1 176 72 A 125 125 0 0 1 364 64 A 125 125 0 0 1 550 64 A 118 118 0 0 1 724 72 A 112 112 0 0 1 848 170 A 68 68 0 0 1 848 276 A 125 125 0 0 1 720 400 A 110 110 0 0 1 560 410 A 105 105 0 0 1 410 416 Q 386 424 352 470 Q 338 448 336 418 A 100 100 0 0 1 180 400 Z';

const CLOUD_PATH_MOBILE =
  'M 116 378 A 84 84 0 0 1 34 296 A 54 54 0 0 1 34 212 A 52 52 0 0 1 34 130 A 84 84 0 0 1 118 46 A 54 54 0 0 1 200 30 A 54 54 0 0 1 282 46 A 84 84 0 0 1 366 130 A 52 52 0 0 1 366 212 A 54 54 0 0 1 366 296 A 84 84 0 0 1 284 378 A 50 50 0 0 1 206 384 Q 190 396 170 438 Q 156 416 160 386 A 30 30 0 0 1 116 378 Z';

export default function Contact() {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfraCard[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadContactData() {
      try {
        const res = await fetch(`${API_BASE_URL}/contact-page/page`);
        const json = await res.json();
        if (!isMounted) return;
        if (json.success && json.data) {
          if (json.data.settings) setSettings(json.data.settings);
          if (Array.isArray(json.data.departments) && json.data.departments.length > 0) {
            setDepartments(json.data.departments);
          }
          if (Array.isArray(json.data.infrastructure) && json.data.infrastructure.length > 0) {
            setInfrastructure(json.data.infrastructure);
          }
          if (Array.isArray(json.data.faqs) && json.data.faqs.length > 0) {
            setFaqs(json.data.faqs);
          }
        } else if (json.settings) {
          if (json.settings) setSettings(json.settings);
          if (Array.isArray(json.departments) && json.departments.length > 0) {
            setDepartments(json.departments);
          }
          if (Array.isArray(json.infrastructure) && json.infrastructure.length > 0) {
            setInfrastructure(json.infrastructure);
          }
          if (Array.isArray(json.faqs) && json.faqs.length > 0) {
            setFaqs(json.faqs);
          }
        }
      } catch (err) {
        console.warn('⚠️ [Contact Page] API offline, using fallback defaults:', err);
      }
    }
    loadContactData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Default Fallbacks
  const currentHeroTagline = settings?.hero_tagline || 'GET IN TOUCH';
  const currentHeroHeadline = settings?.hero_headline || 'Connect with Kingsol.';
  const currentHeroHighlight = settings?.hero_highlight || 'Kingsol.';

  const currentFormHeadline = settings?.form_headline || 'Send us a message';
  const currentFormSubtitle = settings?.form_subtitle || 'Fill out the form below and our team will get back to you shortly.';
  const currentFormSuccess = settings?.form_success_msg || 'Thank you for reaching out. An automated Email & WhatsApp alert has been sent to our admin team.';

  const currentHqTagline = settings?.hq_tagline || 'GLOBAL HQ';
  const currentHqHeadline = settings?.hq_headline || 'Head Office Location';
  const currentHqHighlight = settings?.hq_highlight || 'Location';
  const currentHqAddress = settings?.hq_address || 'Third floor Shop. no. 326, Vardhaman Moonstone, Opposite to JSPM Tathawade, Pune.';
  const currentHqMapUrl =
    settings?.hq_map_url ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.81745771891!2d73.7479708752074!3d18.627254582487445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e6f3df8ebf%3A0x889db4c803362a74!2sVardhaman%20Moonstone!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';
  const currentHqHours = settings?.hq_hours || 'Mon - Sat: 10:00 AM - 6:00 PM';
  const currentHqCert = settings?.hq_certification || 'ISO 9001 Certified';

  const currentInfraTagline = settings?.infra_tagline || 'INFRASTRUCTURE & REACH';
  const currentInfraHeadline = settings?.infra_headline || 'Nationwide Service Networks & Areas';
  const currentInfraHighlight = settings?.infra_highlight || 'Networks';

  const currentFaqTagline = settings?.faq_tagline || 'FAQ';
  const currentFaqHeadline = settings?.faq_headline || 'Frequently Asked Questions';

  const currentQuoteText = settings?.quote_text || '"Engineering a world where clean, renewable energy is the undisputed baseline for every home and industry."';
  const currentQuoteAuthor = settings?.quote_author || '— THE KINGSOL PROMISE';

  const defaultDepartments: Department[] = [
    {
      id: 1,
      title: 'Sales & Business Inquiries',
      description: 'Mon - Sat: 9 AM - 6 PM',
      phone: '+91 98765 43210',
      email: 'sales@kingsolenergy.com',
      whatsapp: '+919876543210',
    },
    {
      id: 2,
      title: 'Technical Support & EPC Assistance',
      description: '24/7 Helpline Support',
      phone: '+91 98765 43211',
      email: 'support@kingsolenergy.com',
      whatsapp: '+919876543211',
    },
    {
      id: 3,
      title: 'Media & Corporate Communications',
      description: 'Mon - Fri: 10 AM - 5 PM',
      phone: '+91 98765 43212',
      email: 'media@kingsolenergy.com',
      whatsapp: '+919876543212',
    },
    {
      id: 4,
      title: 'Careers & HR Talent Pool',
      description: 'Mon - Sat: 10 AM - 6 PM',
      phone: '+91 98765 43213',
      email: 'hr@kingsolenergy.com',
      whatsapp: '+919876543213',
    },
  ];

  const defaultInfra: InfraCard[] = [
    {
      id: 1,
      title: 'Western Region Operational Hub',
      description: 'Pune & Mumbai logistics hubs with over 10,000 sq. ft. warehousing for Tier-1 PV modules and string inverters.',
    },
    {
      id: 2,
      title: 'Pan-India EPC Partner Network',
      description: 'Certified solar installation partners operating across Maharashtra, Gujarat, Karnataka, and Tamil Nadu.',
    },
    {
      id: 3,
      title: 'Central Dispatch & Spare Parts Center',
      description: 'Rapid dispatch hub ensuring replacement inverters and BOS accessories reach sites within 24–48 hours.',
    },
  ];

  const defaultFaqs: FAQItem[] = [
    {
      id: 1,
      question: 'What type of solar projects does Kingsol specialize in?',
      answer: 'Kingsol provides end-to-end solar solutions, including commercial & industrial rooftop PV systems, ground-mounted utility arrays, and high-performance residential solar setups.',
    },
    {
      id: 2,
      question: 'How fast can I expect a response after submitting an inquiry?',
      answer: 'Our engineering team typically reviews inquiries and reaches out within 2 to 4 business hours with initial solar feasibility insights.',
    },
    {
      id: 3,
      question: 'Does Kingsol assist with DISCOM net-metering approvals?',
      answer: 'Yes! We manage complete end-to-end regulatory approvals, DISCOM net-metering paperwork, and CEIG electrical inspector clearances.',
    },
    {
      id: 4,
      question: 'What warranties are provided on Kingsol solar systems?',
      answer: 'We offer 25-year performance warranties on Tier-1 solar modules,\n10-year warranties on string inverters\nComprehensive 5-year EPC workmanship warranties.',
    },
  ];

  const activeDepts = departments.length > 0 ? departments : defaultDepartments;
  const activeInfra = infrastructure.length > 0 ? infrastructure : defaultInfra;
  const activeFaqs = faqs.length > 0 ? faqs : defaultFaqs;

  const primaryEmail = activeDepts.find((d) => d.email)?.email || 'sales@kingsolenergy.com';
  const primaryWhatsapp = activeDepts.find((d) => d.whatsapp)?.whatsapp || '+919876543210';
  const cleanWhatsappNumber = primaryWhatsapp.replace(/[^\d+]/g, '');

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

  // Smart text parser for FAQ answers
  const renderFaqAnswer = (answerText: string) => {
    if (!answerText) return null;

    const lines = answerText.split('\n').filter(line => line.trim() !== '');

    return (
      <div className="flex flex-col gap-2 text-sm text-slate-600 leading-relaxed font-normal">
        {lines.map((line, index) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
            return (
              <div key={index} className="flex items-start gap-2 pl-2 md:pl-4">
                <span className="text-[#44a0e3] font-bold text-sm shrink-0 mt-0.5">✓</span>
                <span>{trimmedLine.replace(/^[-•]\s*/, '')}</span>
              </div>
            );
          }
          
          return <p key={index} className="font-poppins text-sm text-slate-600 leading-relaxed whitespace-pre-line text-justify">{trimmedLine}</p>;
        })}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit contact form.');
      }
    } catch {
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-32 pb-[72px] text-slate-900 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dynamic Hero Header */}
        <div className="mb-8 mt-6">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-1.5 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
          >
            <span>{currentHeroTagline}</span>
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-1 font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
          >
            {renderDynamicHeadline(currentHeroHeadline, currentHeroHighlight)}
          </motion.h1>
        </div>

        {/* Left-Aligned Departmental Cards Container (Limited to 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {activeDepts.slice(0, 3).map((dept, idx) => (
            <motion.div
              key={`dept-card-${idx}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: "easeOut" }}
              className="w-full bg-white rounded-[2.5rem] p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-[0_25px_50px_rgba(68,160,227,0.2)] transition-all duration-500 group relative overflow-hidden min-h-[300px]"
            >
              <div className="absolute -right-12 -top-12 w-36 h-36 bg-[#44a0e3]/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none"></div>

              <div className="flex flex-col flex-1">
                <div className="flex justify-end items-center mb-2">
                  <span className="text-slate-400 group-hover:text-[#44a0e3] text-sm transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                    ↗
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 group-hover:text-[#44a0e3] mb-3 transition-colors">
                  {dept.title}
                </h3>
                <p className="font-poppins text-base md:text-sm text-slate-600 leading-relaxed whitespace-pre-line text-justify mb-7">
                  {dept.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 group-hover:border-slate-200 transition-colors mt-auto">
                {dept.phone && (
                  <a
                    href={`tel:${dept.phone}`}
                    className="text-xs font-semibold text-slate-700 hover:text-[#44a0e3] flex items-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-green shrink-0" />
                    <span>{dept.phone}</span>
                  </a>
                )}
                {dept.email && (
                  <a
                    href={`mailto:${dept.email}`}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-2 truncate transition-colors"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                      alt="Gmail"
                      className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="truncate">{dept.email}</span>
                  </a>
                )}
                {dept.whatsapp && (
                  <a
                    href={`https://wa.me/${dept.whatsapp.replace(/[^\d+]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 bg-slate-50 hover:bg-white text-slate-700 hover:text-[#44a0e3] border border-slate-200/80 text-xs py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group/wa"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                      alt="WhatsApp"
                      className="w-4 h-4 shrink-0 group-hover/wa:scale-110 transition-transform duration-300"
                    />
                    <span>Chat on WhatsApp</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toll-Free Support Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl border border-blue-100 flex items-center justify-center bg-blue-50/50 text-[#44a0e3] shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 leading-tight">Toll-free support</h4>
              <p className="text-sm text-slate-500 font-medium">24/7 assistance available</p>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black font-poppins text-[#44a0e3]">
            1800 203 7228
          </div>
        </motion.div>

        {/* "Connect with Kingsol" Direct Channels Area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="mb-10 bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        >
          <div>
            <span className="mb-1 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block">
              Direct Channels
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900 tracking-tight">
              Connect with Kingsol
            </h3>
            <p className="mt-1 font-poppins text-base md:text-sm text-slate-600 leading-relaxed whitespace-pre-line text-justify max-w-2xl">
              Have a project inquiry or product requirement? Connect directly with our team via email or WhatsApp for quick assistance on solar, BESS, and energy solutions.
            </p>
          </div>

          <div className="flex items-center gap-3.5 flex-wrap shrink-0">
            <a
              href={`mailto:${primaryEmail}`}
              className="bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs hover:shadow-md px-5 py-3 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all duration-300"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                alt="Gmail"
                className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300"
              />
              <span>{primaryEmail}</span>
            </a>

            <a
              href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent('Hi! I am interested in Kingsol solar products.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-50 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs hover:shadow-md px-5 py-3 rounded-full font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all duration-300 group/link"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="w-5 h-5 shrink-0 group-hover/link:scale-110 transition-transform duration-300"
              />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </motion.div>

        {/* Split Section: Form & Head Office Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-stretch">
          
          {/* Form (7 Columns) - Equal Height Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col h-full"
          >
            <h2 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900 tracking-tight">{currentFormHeadline}</h2>
            <p className="text-slate-500 text-sm mb-6">{currentFormSubtitle}</p>

            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
                {error}
              </div>
            )}

            {formSubmitted ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-xl mx-auto mb-3">
                  ✓
                </div>
                <h3 className="text-2xl font-bold font-poppins text-slate-900 mb-2">Message Received!</h3>
                <p className="text-slate-600 text-sm">{currentFormSuccess}</p>
              </div>
            ) : (
              <form className="flex flex-col gap-5 flex-1" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Full Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Phone No. *</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none resize-none flex-1 min-h-[100px]"
                    placeholder="Tell us about your project or inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 bg-white text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-sm hover:bg-[#44a0e3] hover:text-white hover:shadow-[0_12px_24px_rgba(68,160,227,0.2)] flex justify-center items-center gap-2 cursor-pointer border border-slate-200/60 hover:border-transparent disabled:opacity-50 relative z-20 group/btn"
                >
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </motion.div>

          {/* Map & Head Office Info (5 Columns) - Equal Height Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="lg:col-span-5 flex flex-col bg-white rounded-[2.5rem] p-8 text-slate-900 border border-slate-200 shadow-[0_20px_40px_rgba(68,160,227,0.15)] h-full"
          >
            <div>
              <span className="mb-1.5 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block">
                <span>{currentHqTagline}</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-poppins text-slate-900 tracking-tight">
                {renderDynamicHeadline(currentHqHeadline, currentHqHighlight)}
              </h3>
              <p className="mt-2 font-poppins text-base md:text-sm text-slate-600 leading-relaxed whitespace-pre-line text-justify">
                {currentHqAddress}
              </p>
            </div>

            {/* Embedded Interactive Map - Flex-1 perfectly mirrors the form's height */}
            <div className="w-full flex-1 min-h-0 rounded-2xl overflow-hidden my-4 border border-slate-200 flex flex-col">
              <iframe
                title="Kingsol Head Office Map"
                src={currentHqMapUrl}
                className="w-full h-full flex-1"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between font-medium">
              <span>{currentHqHours}</span>
              <span className="text-brand-blue font-bold">{currentHqCert}</span>
            </div>
          </motion.div>
        </div>

        {/* Left-Aligned Infrastructure & Reach Cards Container */}
        <section className="mb-10 bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-xs">
          <div className="max-w-3xl mb-8">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mb-1.5 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
            >
              <span>{currentInfraTagline}</span>
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
            >
              {renderDynamicHeadline(currentInfraHeadline, currentInfraHighlight)}
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activeInfra.map((card, idx) => (
              <div
                key={card.id || idx}
                className="w-full p-6 rounded-2xl bg-[#FDFCF8] border border-slate-200/80 flex flex-col"
              >
                <h4 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-2 transition-colors duration-300 group-hover:text-[#44a0e3]">
                  {card.title}
                </h4>
                <p className="flex items-start text-slate-600 font-poppins text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="mb-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mb-1.5 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-[#44a0e3] block"
            >
              <span>{currentFaqTagline}</span>
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
            >
              {currentFaqHeadline}
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="max-w-3xl mx-auto flex flex-col gap-4"
          >
            {activeFaqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all duration-300"
                onMouseEnter={() => setOpenFaq(idx)}
                onMouseLeave={() => setOpenFaq(null)}
              >
                <div className="w-full px-8 py-6 text-left flex justify-between items-center font-medium text-slate-900 hover:bg-slate-50 hover:text-[#44a0e3] transition-colors cursor-default">
                  <span className="text-base font-bold font-poppins">{faq.question}</span>
                </div>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-6 pt-2 border-t border-slate-100"
                    >
                      {/* Integrated Smart Parser for text-sm size */}
                      {renderFaqAnswer(faq.answer)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Realistic Cloud Quote Design */}
        {/* Keep CLOUD_PATH_DESKTOP and CLOUD_PATH_MOBILE (defined above the component) as they are */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col items-center mb-10 mt-16 px-4"
        >
          {/* Shared SVG filter definitions (puffy edges + soft 3D shading) */}
          <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
            <defs>
              {/* Desktop / tablet cloud */}
              <filter
                id="cloud-real-d"
                x="-8%"
                y="-10%"
                width="116%"
                height="124%"
                colorInterpolationFilters="sRGB"
              >
                {/* 1. Wobble the outline so the edges look organic and fluffy */}
                <feTurbulence type="fractalNoise" baseFrequency="0.014 0.02" numOctaves="4" seed="8" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" result="shape" />
                <feGaussianBlur in="shape" stdDeviation="1.6" result="softShape" />
                {/* 2. Use the blurred shape as a height map and light it from the top */}
                <feGaussianBlur in="softShape" stdDeviation="13" result="bump" />
                <feDiffuseLighting in="bump" surfaceScale="26" diffuseConstant="1.3" lightingColor="#ffffff" result="light">
                  <feDistantLight azimuth="250" elevation="58" />
                </feDiffuseLighting>
                {/* 3. Tint the shaded areas sky-blue so the underside looks like a real cloud */}
                <feColorMatrix
                  in="light"
                  type="matrix"
                  values="0.5 0 0 0 0.5  0 0.35 0 0 0.65  0 0 0.08 0 0.92  0 0 0 1 0"
                  result="tinted"
                />
                <feComposite in="tinted" in2="softShape" operator="in" />
              </filter>

              {/* Mobile cloud (smaller coordinate space, so smaller values) */}
              <filter
                id="cloud-real-m"
                x="-10%"
                y="-8%"
                width="120%"
                height="120%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence type="fractalNoise" baseFrequency="0.03 0.035" numOctaves="4" seed="8" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" result="shape" />
                <feGaussianBlur in="shape" stdDeviation="1" result="softShape" />
                <feGaussianBlur in="softShape" stdDeviation="7" result="bump" />
                <feDiffuseLighting in="bump" surfaceScale="18" diffuseConstant="1.3" lightingColor="#ffffff" result="light">
                  <feDistantLight azimuth="250" elevation="58" />
                </feDiffuseLighting>
                <feColorMatrix
                  in="light"
                  type="matrix"
                  values="0.5 0 0 0 0.5  0 0.35 0 0 0.65  0 0 0.08 0 0.92  0 0 0 1 0"
                  result="tinted"
                />
                <feComposite in="tinted" in2="softShape" operator="in" />
              </filter>
            </defs>
          </svg>

          <div className="relative w-full max-w-4xl mx-auto z-20">
            {/* Soft ground shadow under the cloud (stays still while the cloud floats) */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/5 h-5 rounded-full bg-slate-900/10 blur-xl pointer-events-none"></div>

            {/* Gently floating cloud */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="relative text-center text-slate-900"
            >
              {/* Cloud - Desktop / Tablet */}
              <svg
                className="hidden md:block absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-[0_18px_22px_rgba(68,160,227,0.22)]"
                viewBox="0 0 900 490"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={CLOUD_PATH_DESKTOP} fill="#ffffff" filter="url(#cloud-real-d)" />
              </svg>

              {/* Cloud - Mobile */}
              <svg
                className="md:hidden absolute inset-0 w-full h-full overflow-visible pointer-events-none drop-shadow-[0_14px_18px_rgba(68,160,227,0.22)]"
                viewBox="0 0 400 450"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d={CLOUD_PATH_MOBILE} fill="#ffffff" filter="url(#cloud-real-m)" />
              </svg>

              {/* Quote content - padding keeps the text inside the cloud body */}
              <div className="relative z-10 px-[16%] pt-24 pb-28 md:px-[18%]">
                <h2 className="text-2xl md:text-[28px] font-bold font-poppins leading-snug mb-6">
                  {currentQuoteText}
                </h2>
                <p className="text-[#44a0e3] font-bold tracking-widest text-[11px] md:text-xs uppercase">
                  {currentQuoteAuthor}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export { Contact };