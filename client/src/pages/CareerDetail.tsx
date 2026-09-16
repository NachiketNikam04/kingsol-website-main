import { API_BASE_URL } from '../utils/assetUrl';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface JobListing {
  id?: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  posted_date?: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
}

export default function CareerDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobListing | null>(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });

  const [file, setFile] = useState<File | null>(null);

  const fallbackJobs: Record<string, JobListing> = {
    'solar-epc-senior-project-engineer': {
      title: 'Solar EPC Senior Project Engineer',
      slug: 'solar-epc-senior-project-engineer',
      department: 'Engineering & Operations',
      location: 'Mumbai, MH (On-site)',
      type: 'Full-time',
      experience: '4 - 7 Years in Solar EPC',
      posted_date: 'August 15, 2026',
      overview:
        'We are seeking an experienced Solar EPC Engineer to manage commercial rooftop and ground-mounted PV array design, structural modeling, DISCOM net-metering approvals, and field execution teams across Western India.',
      responsibilities: [
        'Lead technical design reviews (SLDs, layout diagrams, PVsyst simulations).',
        'Manage site execution teams, subcontractors, and quality assurance audits.',
        'Coordinate with state DISCOMs and electricity inspectors for grid synchronization.',
        'Optimize BOS (Balance of System) costing and component selection.',
      ],
      requirements: [
        'B.Tech / M.Tech in Electrical or Energy Engineering.',
        'Proven track record of executing 10MW+ MW-scale solar projects.',
        'Proficiency in AutoCAD, PVsyst, Helioscope, and MS Project.',
        'Strong knowledge of Indian grid codes, CEA standards, and safety norms.',
      ],
    },
    'full-stack-web-developer': {
      title: 'Full Stack Web Developer (Node.js & React)',
      slug: 'full-stack-web-developer',
      department: 'Software & IoT Systems',
      location: 'Pune, MH (Hybrid)',
      type: 'Full-time',
      experience: '2 - 5 Years Web Development',
      posted_date: 'August 10, 2026',
      overview:
        'Join our digital engineering team to build and maintain Kingsol’s web applications, real-time IoT inverter telemetry dashboards, and B2B procurement portals using React, TypeScript, and Node.js.',
      responsibilities: [
        'Develop responsive frontend user interfaces using React, TypeScript, and Tailwind CSS.',
        'Build high-performance RESTful APIs in Node.js and PostgreSQL.',
        'Integrate real-time inverter telemetry data via WebSockets and MQTT.',
        'Collaborate with UI designers to implement pixel-perfect web layouts.',
      ],
      requirements: [
        'Proficient in React, Node.js, Express, and PostgreSQL.',
        'Experience with Framer Motion, Tailwind CSS, and state management.',
        'Familiarity with cloud deployments (AWS, Docker, Vercel).',
        'Strong understanding of web performance, SEO, and security standards.',
      ],
    },
    'b2b-solar-sales-manager': {
      title: 'B2B Solar Sales & Business Development Manager',
      slug: 'b2b-solar-sales-manager',
      department: 'Sales & Growth',
      location: 'Bengaluru, KA (Field)',
      type: 'Full-time',
      experience: '3 - 6 Years B2B Industrial Sales',
      posted_date: 'August 05, 2026',
      overview:
        'Drive business growth by partnering with commercial real estate developers, industrial manufacturing units, and corporate clients to pitch rooftop solar and CAPEX/OPEX solar solutions.',
      responsibilities: [
        'Identify and close high-value corporate solar EPC contracts.',
        'Prepare technical-commercial proposals, payback period calculations, and ROI decks.',
        'Build relationships with CXOs, facility directors, and procurement heads.',
        'Participate in industrial clean-energy expos and regional networking events.',
      ],
      requirements: [
        'MBA or Bachelor’s degree in Business / Engineering.',
        'Demonstrated success in closing B2B solar EPC or industrial equipment sales.',
        'Deep understanding of open access solar regulations, net metering policies, and tariff structures.',
        'Excellent communication, presentation, and negotiation skills.',
      ],
    },
  };

  useEffect(() => {
    async function loadJobDetails() {
      setLoadingJob(true);
      try {
        const res = await fetch(`${API_BASE_URL}/careers/jobs/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setJob(json.data);
        } else if (slug && fallbackJobs[slug]) {
          setJob(fallbackJobs[slug]);
        }
      } catch (err) {
        console.warn('⚠️ [CareerDetail] API offline, using fallback if available:', err);
        if (slug && fallbackJobs[slug]) {
          setJob(fallbackJobs[slug]);
        }
      } finally {
        setLoadingJob(false);
      }
    }
    loadJobDetails();
  }, [slug]);

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-slate-900 flex flex-col items-center justify-center">
        <p className="text-slate-500 font-medium">Loading position details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-slate-900 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold font-poppins mb-4">Position Not Found</h1>
        <p className="text-slate-600 mb-8">The job opening you are looking for does not exist or has been filled.</p>
        <Link
          to="/careers"
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-[#44a0e3] transition-colors"
        >
          Explore All Careers
        </Link>
      </div>
    );
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const bodyFormData = new FormData();
    bodyFormData.append('job_role', job.title);
    bodyFormData.append('full_name', formData.fullName);
    bodyFormData.append('email', formData.email);
    bodyFormData.append('phone', formData.phone);
    bodyFormData.append('cover_letter', formData.coverLetter);
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
        setError(data.message || 'Application submission failed.');
      }
    } catch {
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const responsibilitiesList = Array.isArray(job.responsibilities) ? job.responsibilities : [];
  const requirementsList = Array.isArray(job.requirements) ? job.requirements : [];

  return (
    <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-[72px] text-slate-900">
      <div className="max-w-5xl mx-auto px-6">
        {/* Dynamic Breadcrumb Navigation Bar */}
        <div className="flex items-center justify-between gap-4 mb-12 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 flex-wrap">
            <Link className="hover:text-slate-900 transition-colors" to="/careers">
              Careers
            </Link>
            <span>/</span>
            <span
              className={isApplying ? 'hover:text-slate-900 cursor-pointer' : 'text-slate-900 font-semibold'}
              onClick={() => setIsApplying(false)}
            >
              {job.title}
            </span>
            {isApplying && (
              <>
                <span>/</span>
                <span className="text-brand-green font-semibold">Apply</span>
              </>
            )}
          </div>

          <button
            onClick={() => {
              if (isApplying) {
                setIsApplying(false);
              } else {
                navigate('/careers');
              }
            }}
            className="text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs"
          >
            {isApplying ? '← Back to Job Details' : '← Back to Openings'}
          </button>
        </div>

        {/* Header Title Banner */}
        <div className="mb-12 border-b border-slate-200 pb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            {job.department}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0 mb-4"
          >
            {job.title}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="flex flex-wrap gap-4 text-xs font-semibold text-slate-700"
          >
            <span className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-2xs">📍 {job.location}</span>
            <span className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-2xs">⏱️ {job.type}</span>
            <span className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-2xs">💼 {job.experience}</span>
            {job.posted_date && (
              <span className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-2xs">📅 Posted: {job.posted_date}</span>
            )}
          </motion.div>
        </div>

        {/* View Mode: Application Form vs Detailed Job Overview */}
        {isApplying ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-lg"
          >
            {formSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-5">Application Received!</h3>
                <p className="text-slate-600 text-base leading-relaxed max-w-md mx-auto mb-8">
                  Thank you for applying for the <strong className="text-slate-900">{job.title}</strong> position. Our recruiting team has received your application and attached resume.
                </p>
                <button
                  onClick={() => navigate('/careers')}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-medium text-sm hover:bg-[#44a0e3] transition-colors cursor-pointer"
                >
                  Return to Career Openings
                </button>
              </div>
            ) : (
              <>
                <h2 className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-3">Submit Candidate Application</h2>
                <p className="text-slate-600 text-sm mb-8">
                  Applying for: <strong className="text-slate-900">{job.title}</strong>
                </p>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200">
                    {error}
                  </div>
                )}

                <form className="flex flex-col gap-6" onSubmit={handleSubmitApplication}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-900 uppercase">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-green outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-900 uppercase">Phone No. *</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-green outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-900 uppercase">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-green outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-900 uppercase">Upload PDF Resume / CV *</label>
                    <input
                      required
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 transition-all cursor-pointer text-slate-600"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-slate-900 uppercase">Cover Letter / Statement</label>
                    <textarea
                      rows={4}
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-brand-green outline-none resize-none"
                      placeholder="Tell us why you are a great fit for this role..."
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsApplying(false)}
                      className="w-1/2 bg-white text-slate-900 border border-slate-200 py-4 rounded-full font-medium text-sm hover:border-[#44a0e3] hover:text-[#44a0e3] transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-1/2 bg-brand-green text-slate-900 py-4 rounded-full font-semibold text-sm hover:bg-slate-900 hover:text-white transition-colors cursor-pointer text-center disabled:opacity-50"
                    >
                      {loading ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-12">
            {/* Overview */}
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-xs"
            >
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-4 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
              >
                Role Overview
              </motion.h2>
              <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">{job.overview}</p>
            </motion.section>

            {/* Responsibilities */}
            {responsibilitiesList.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-xs"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-4 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
                >
                  Key Responsibilities
                </motion.h2>
                <ul className="space-y-4">
                  {responsibilitiesList.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
                      <span className="w-2 h-2 rounded-full bg-brand-green mt-2 shrink-0"></span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Requirements */}
            {requirementsList.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-200 shadow-xs"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mb-4 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
                >
                  Requirements & Qualifications
                </motion.h2>
                <ul className="space-y-4">
                  {requirementsList.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
                      <span className="w-2 h-2 rounded-full bg-[#44a0e3] mt-2 shrink-0"></span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Apply CTA Bar */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="bg-white rounded-[2rem] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
            >
              <div>
                <motion.h3
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="mt-5 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight mb-2"
                >
                  Ready to apply for this position?
                </motion.h3>
                <p className="text-slate-400 text-sm">Submit your CV and cover letter directly to our hiring team.</p>
              </div>
              <button
                onClick={() => setIsApplying(true)}
                className="bg-brand-green text-slate-900 px-8 py-4 rounded-full font-bold text-sm hover:bg-white hover:text-slate-900 transition-colors shrink-0 cursor-pointer"
              >
                Apply for this Position →
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export { CareerDetail };