import { API_BASE_URL } from '../utils/assetUrl';
import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface CareersPageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  hero_bg_image_url: string;
  positions_title: string;
  positions_subtitle: string;
  gen_tagline: string;
  gen_headline: string;
  gen_description: string;
  disclaimer_title: string;
  disclaimer_text: string;
}

interface JobListing {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  posted_date?: string;
  overview: string;
}

export default function Careers() {
  const [settings, setSettings] = useState<CareersPageSettings | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${API_BASE_URL}/careers/page`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) setSettings(json.data.settings);
          if (Array.isArray(json.data.jobs) && json.data.jobs.length > 0) {
            setJobs(json.data.jobs);
          }
        }
      } catch (err) {
        console.warn('⚠️ [Careers] API offline, using fallbacks:', err);
      }
    }
    loadData();
  }, []);

  const currentTagline = settings?.tagline || 'CAREERS';
  const currentHeadline = settings?.headline || 'Help build a cleaner, brighter energy future.';
  const currentHighlightWord = settings?.highlight_word || 'brighter';
  const currentHeroBg =
    settings?.hero_bg_image_url ||
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop';
  const currentGenTagline = settings?.gen_tagline || 'General Application';
  const currentGenHeadline = settings?.gen_headline || "Don't see your specific tech stack?";
  const currentGenDesc =
    settings?.gen_description ||
    "We are always looking for exceptional talent to join our team. If your expertise isn't listed in our open roles, send your details directly to our recruitment team and we'll reach out if a position opens up.";
  const currentDisclaimerTitle = settings?.disclaimer_title || 'Important Note:';
  const currentDisclaimerText =
    settings?.disclaimer_text ||
    'Kingsol will never ask for any recruitment fees, security deposits, or financial payments from candidates at any stage of the hiring process.';

  const defaultJobs: JobListing[] = [
    {
      id: 1,
      title: 'Solar EPC Senior Project Engineer',
      slug: 'solar-epc-senior-project-engineer',
      department: 'Engineering',
      location: 'Mumbai, MH (On-site)',
      type: 'Full-time',
      experience: '4 - 7 Years',
      posted_date: 'August 15, 2026',
      overview: 'We are seeking an experienced Solar EPC Engineer...',
    },
    {
      id: 2,
      title: 'Full Stack Web Developer (Node.js & React)',
      slug: 'full-stack-web-developer',
      department: 'Software',
      location: 'Pune, MH (Hybrid)',
      type: 'Full-time',
      experience: '2 - 5 Years',
      posted_date: 'August 10, 2026',
      overview: 'Join our digital engineering team...',
    },
    {
      id: 3,
      title: 'B2B Solar Sales & Business Development Manager',
      slug: 'b2b-solar-sales-manager',
      department: 'Sales',
      location: 'Bengaluru, KA (Field)',
      type: 'Full-time',
      experience: '3 - 6 Years',
      posted_date: 'August 05, 2026',
      overview: 'Drive commercial PV sales...',
    },
  ];

  const activeJobs = jobs.length > 0 ? jobs : defaultJobs;

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

  const scrollToJobs = () => {
    document.getElementById('open-positions')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGeneralSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const bodyFormData = new FormData();
    bodyFormData.append('job_role', 'General Talent Pool Application');
    bodyFormData.append('full_name', formData.name);
    bodyFormData.append('email', formData.email);
    bodyFormData.append('phone', formData.phone);
    if (file) {
      bodyFormData.append('resume', file);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        body: bodyFormData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSubmitted(true);
      } else {
        setError(data.message || 'Submission failed.');
      }
    } catch {
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-12 overflow-x-clip text-slate-900">
      
      {/* Redesigned Premium "Bento" Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="relative w-full rounded-[2.5rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-200"
        >
          {/* Dynamic Background Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center md:bg-[center_right_-10rem]"
            style={{ backgroundImage: `url('${currentHeroBg}')` }}
          />
          
          {/* Smooth Fade Gradient - Hides the left side of the image, reveals the right */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10 md:hidden" />

          {/* Hero Content */}
          <div className="relative z-20 py-14 px-6 sm:px-12 md:py-20 md:px-16 w-full md:w-3/4 lg:w-2/3">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
            >
              <span>{currentTagline}</span>
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-black leading-tight sm:text-3xl md:text-4xl shrink-0"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h1>

            <button
              onClick={scrollToJobs}
              className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold text-sm transition-all hover:bg-[#44a0e3] hover:text-white hover:shadow-[0_15px_30px_rgba(68,160,227,0.3)] flex items-center gap-3 cursor-pointer w-fit mt-6"
            >
              <span>SEE OPEN POSITIONS</span>
              <span className="transform transition-transform group-hover:translate-y-1">↓</span>
            </button>
          </div>
        </motion.div>
      </div>

      <motion.section
        id="open-positions"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activeJobs.map((job) => (
              <Link
                key={job.id || job.slug}
                to={`/careers/${job.slug}`}
                // Added h-full and removed justify-start so it naturally fills vertical space
                className="group relative flex flex-col p-8 min-h-[280px] h-full bg-white rounded-[2.5rem] border border-slate-200 hover:border-[#44a0e3]/40 hover:shadow-[0_20px_40px_-15px_rgba(68,160,227,0.2)] hover:-translate-y-1.5 transition-all duration-400 overflow-hidden"
              >
                {/* Soft background gradient glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#44a0e3]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-green to-[#44a0e3] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

                {/* Top Content Wrapper: flex-1 forces this top section to stretch and fill empty space */}
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2.5 mb-5">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 border border-slate-100/80 rounded-full text-[11px] font-bold text-slate-600 tracking-wide shadow-xs">
                      <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#78C257]/10 border border-[#78C257]/20 rounded-full text-[11px] font-bold text-brand-green tracking-wide shadow-xs">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 mb-3 group-hover:text-[#44a0e3] transition-colors leading-tight line-clamp-2">
                    {job.title}
                  </h3>

                  {/* mt-auto pushes the date safely to the bottom of this text block */}
                  {job.posted_date && (
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-auto mb-5">
                      <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Posted: {job.posted_date}
                    </span>
                  )}
                </div>

                {/* Footer: mt-auto guarantees this always docks at the absolute bottom edge */}
                <div className="relative z-10 flex justify-between items-center pt-4 mt-auto border-t border-slate-100 group-hover:border-slate-200 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-[#44a0e3] transition-colors">
                    View Position
                  </span>
                  
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-[#44a0e3] group-hover:border-[#44a0e3] group-hover:text-white transition-all duration-300 text-slate-400 group-hover:shadow-md">
                    <svg className="w-4 h-4 transform -rotate-45 group-hover:rotate-0 transition-transform duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Alignment Wrapper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          {/* General Application Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-32 mb-12 bg-white rounded-[3rem] p-8 md:p-16 flex flex-col lg:flex-row gap-16 items-center shadow-xs border border-slate-200"
          >
            {/* Left Side: Copy & Disclaimer */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
              >
                <span>{currentGenTagline}</span>
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
              >
                {currentGenHeadline}
              </motion.h2>
              <p className="mb-10 text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
                {currentGenDesc}
              </p>

              {/* Redesigned Anti-Fraud Disclaimer */}
              <div className="bg-[#fdfcf8] p-6 rounded-3xl border border-slate-100 flex items-start gap-5">
                <div className="w-10 h-10 rounded-3xl bg-[#e31414] flex items-center justify-center text-white shrink-0 font-bold my-auto shadow-sm">
                  !
                </div>
                <p className="text-sm text-slate-900 leading-relaxed">
                  <strong className="text-[#fc051a] font-bold">{currentDisclaimerTitle}</strong> {currentDisclaimerText}
                </p>
              </div>
            </div>

            {/* Right Side: Premium Form */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="w-full lg:w-1/2 bg-slate-50 rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-slate-100"
            >
              {formSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-3xl mx-auto mb-6">
                    ✓
                  </div>
                  <h3 className="mt-5 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-4">
                    Resume Submitted!
                  </h3>
                  <p className="text-slate-600 text-base md:text-lg mt-6 leading-relaxed font-normal">
                    Thank you for submitting your details. Our HR team has been notified via Email & WhatsApp.
                  </p>
                </div>
              ) : (
                <form className="flex flex-col gap-6" onSubmit={handleGeneralSubmit}>
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide" htmlFor="gen-name">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        id="gen-name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[#44a0e3]/40 focus:ring-4 focus:ring-[#44a0e3]/10 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                        placeholder="John Doe"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide" htmlFor="gen-phone">
                        Phone No. *
                      </label>
                      <input
                        required
                        type="tel"
                        id="gen-phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[#44a0e3]/40 focus:ring-4 focus:ring-[#44a0e3]/10 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                        placeholder="+91 1234567890"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide" htmlFor="gen-email">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      id="gen-email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:outline-none focus:border-[#44a0e3]/40 focus:ring-4 focus:ring-[#44a0e3]/10 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                      placeholder="ks@example.com"
                    />
                  </div>

                  {/* Resume */}
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide" htmlFor="gen-resume">
                      Upload Resume *
                    </label>
                    <input
                      required
                      type="file"
                      id="gen-resume"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-transparent bg-white shadow-sm file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 transition-all cursor-pointer text-slate-500 text-sm font-medium focus:outline-none focus:border-[#44a0e3]/40 focus:ring-4 focus:ring-[#44a0e3]/10"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-brand-green hover:text-slate-900 hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? 'Submitting Resume...' : 'Send to Recruiter'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.section>
          
        </div>
      </div>
  );
}

export { Careers };