import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  X,
  ListOrdered,
  ListChecks,
} from 'lucide-react';

interface JobListing {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  posted_date: string;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  sort_order: number;
}

export const JobManager: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    department: '',
    location: '',
    type: 'Full-time',
    experience: '2+ Years',
    posted_date: '',
    overview: '',
    responsibilities: [''],
    requirements: [''],
    sort_order: 0,
  });

  // Dynamic Array Input Helpers
  const [respInput, setRespInput] = useState('');
  const [reqInput, setReqInput] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/careers/page');
      if (res.data.success && res.data.data && Array.isArray(res.data.data.jobs)) {
        setJobs(res.data.data.jobs);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load job listings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const getTodayFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const handleOpenModal = (job?: JobListing) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        slug: job.slug,
        department: job.department,
        location: job.location,
        type: job.type || 'Full-time',
        experience: job.experience || '2+ Years',
        posted_date: job.posted_date || getTodayFormattedDate(),
        overview: job.overview,
        responsibilities: Array.isArray(job.responsibilities) && job.responsibilities.length > 0 ? job.responsibilities : [''],
        requirements: Array.isArray(job.requirements) && job.requirements.length > 0 ? job.requirements : [''],
        sort_order: job.sort_order || 0,
      });
    } else {
      setEditingJob(null);
      setFormData({
        title: '',
        slug: '',
        department: 'Engineering',
        location: 'Mumbai, MH (On-site)',
        type: 'Full-time',
        experience: '2+ Years',
        posted_date: getTodayFormattedDate(),
        overview: '',
        responsibilities: [],
        requirements: [],
        sort_order: jobs.length + 1,
      });
    }
    setRespInput('');
    setReqInput('');
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Filter out empty lines
    const cleanResponsibilities = formData.responsibilities.filter((r) => r.trim() !== '');
    const cleanRequirements = formData.requirements.filter((r) => r.trim() !== '');

    const payload = {
      ...formData,
      responsibilities: cleanResponsibilities,
      requirements: cleanRequirements,
    };

    try {
      if (editingJob) {
        await api.put(`/careers/jobs/${editingJob.id}`, payload);
        setMessage({ type: 'success', text: `Job '${formData.title}' updated successfully!` });
      } else {
        await api.post('/careers/jobs', payload);
        setMessage({ type: 'success', text: `Job '${formData.title}' created successfully!` });
      }
      setIsModalOpen(false);
      fetchJobs();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save job opening.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJob = async (id: number, title: string) => {
    if (window.confirm(`Are you sure you want to delete '${title}'?`)) {
      try {
        await api.delete(`/careers/jobs/${id}`);
        setMessage({ type: 'success', text: `Job '${title}' deleted.` });
        fetchJobs();
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete job opening.' });
      }
    }
  };

  // Responsibilities Dynamic Array Builder Helpers
  const addResponsibility = () => {
    if (respInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        responsibilities: [...prev.responsibilities, respInput.trim()],
      }));
      setRespInput('');
    }
  };

  const removeResponsibility = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index),
    }));
  };

  // Requirements Dynamic Array Builder Helpers
  const addRequirement = () => {
    if (reqInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, reqInput.trim()],
      }));
      setReqInput('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-green tracking-widest uppercase block mb-1">
              CAREERS PAGE MANAGER
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Manage Job Openings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Create, edit, and organize active job listings with posted dates, responsibilities, and requirements.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="bg-brand-blue text-white font-bold px-6 py-3 rounded-full text-sm hover:bg-slate-900 transition-all flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Job Opening</span>
          </button>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading job listings...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
            No active job openings found. Click "Add Job Opening" to create your first listing!
          </div>
        ) : (
          <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Job Title</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Location</th>
                    <th className="py-4 px-6">Type & Exp</th>
                    <th className="py-4 px-6">Posted Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div>{job.title}</div>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">/{job.slug}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold">
                          {job.department}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{job.location}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <div className="font-semibold text-slate-800">{job.type}</div>
                        <div className="text-xs text-slate-500">{job.experience}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-brand-green shrink-0" />
                          <span>{job.posted_date || 'Recently Posted'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(job)}
                          className="p-2 text-slate-600 hover:text-brand-blue transition-colors cursor-pointer"
                          title="Edit Job Opening"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="p-2 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Job Opening"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT JOB OPENING */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-3xl w-full shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-blue" />
                  <span>{editingJob ? 'Edit Job Opening' : 'Create New Job Opening'}</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Job Title *</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Solar EPC Project Engineer"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Custom URL Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Auto-generated if left blank"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Department *</label>
                    <input
                      required
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Engineering / Sales / Software"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Location *</label>
                    <input
                      required
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Mumbai, MH (On-site)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Employment Type *</label>
                    <input
                      required
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      placeholder="e.g. Full-time / Contract / Internship"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Required Experience *</label>
                    <input
                      required
                      type="text"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g. 3 - 5 Years"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Posted On Date *</label>
                    <input
                      required
                      type="text"
                      value={formData.posted_date}
                      onChange={(e) => setFormData({ ...formData, posted_date: e.target.value })}
                      placeholder="e.g. August 18, 2026"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Job Overview */}
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Job Overview / Role Summary *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.overview}
                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                    placeholder="Brief description of the role responsibilities and mission..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none leading-relaxed resize-none"
                  ></textarea>
                </div>

                {/* Dynamic Responsibilities Builder */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 uppercase">
                    <ListOrdered className="w-4 h-4 text-brand-blue" />
                    <span>Key Responsibilities (Dynamic Bullet Points)</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={respInput}
                      onChange={(e) => setRespInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addResponsibility();
                        }
                      }}
                      placeholder="Type a responsibility and press Add..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    <button
                      type="button"
                      onClick={addResponsibility}
                      className="bg-brand-blue text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
                    >
                      Add Point
                    </button>
                  </div>

                  {formData.responsibilities.length > 0 && (
                    <ul className="space-y-2 pt-2">
                      {formData.responsibilities.map((resp, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs"
                        >
                          <span className="text-slate-700 leading-relaxed font-medium">
                            <strong className="text-brand-blue mr-2">•</strong>
                            {resp}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeResponsibility(index)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Dynamic Requirements Builder */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 uppercase">
                    <ListChecks className="w-4 h-4 text-brand-green" />
                    <span>Requirements & Qualifications (Dynamic Bullet Points)</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reqInput}
                      onChange={(e) => setReqInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addRequirement();
                        }
                      }}
                      placeholder="Type a qualification and press Add..."
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    <button
                      type="button"
                      onClick={addRequirement}
                      className="bg-brand-green text-slate-900 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                    >
                      Add Point
                    </button>
                  </div>

                  {formData.requirements.length > 0 && (
                    <ul className="space-y-2 pt-2">
                      {formData.requirements.map((req, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs"
                        >
                          <span className="text-slate-700 leading-relaxed font-medium">
                            <strong className="text-brand-green mr-2">•</strong>
                            {req}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRequirement(index)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-full bg-brand-blue text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    {saving ? 'Saving Job...' : 'Save Job Opening'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default JobManager;
