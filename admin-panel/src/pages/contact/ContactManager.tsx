import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  SlidersHorizontal,
  Building2,
  Globe,
  HelpCircle,
  X,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';

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
  sort_order: number;
}

interface InfraCard {
  id: number;
  title: string;
  description: string;
  sort_order: number;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export const ContactManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'departments' | 'infra' | 'faqs'>('settings');

  // State
  const [settings, setSettings] = useState<ContactSettings>({
    hero_tagline: 'GET IN TOUCH',
    hero_headline: 'Connect with Kingsol.',
    hero_highlight: 'Kingsol.',
    form_headline: 'Send us a message',
    form_subtitle: 'Fill out the form below and our team will get back to you shortly.',
    form_success_msg: 'Thank you for reaching out. An automated Email & WhatsApp alert has been sent to our admin team.',
    hq_tagline: 'GLOBAL HQ',
    hq_headline: 'Head Office Location',
    hq_highlight: 'Location',
    hq_address: 'Third floor Shop. no. 326, Vardhaman Moonstone, Opposite to JSPM Tathawade, Pune.',
    hq_map_url:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.81745771891!2d73.7479708752074!3d18.627254582487445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e6f3df8ebf%3A0x889db4c803362a74!2sVardhaman%20Moonstone!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    hq_hours: 'Mon - Sat: 10:00 AM - 6:00 PM',
    hq_certification: 'ISO 9001 Certified',
    infra_tagline: 'INFRASTRUCTURE & REACH',
    infra_headline: 'Nationwide Service Networks & Areas',
    infra_highlight: 'Networks',
    faq_tagline: 'FAQ',
    faq_headline: 'Frequently Asked Questions',
    quote_text: '"Engineering a world where clean, renewable energy is the undisputed baseline for every home and industry."',
    quote_author: '— THE KINGSOL PROMISE',
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [infrastructure, setInfrastructure] = useState<InfraCard[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Department Modal State
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState({ title: '', description: '', phone: '', email: '', whatsapp: '', sort_order: 0 });

  // Infra Modal State
  const [isInfraModalOpen, setIsInfraModalOpen] = useState(false);
  const [editingInfra, setEditingInfra] = useState<InfraCard | null>(null);
  const [infraForm, setInfraForm] = useState({ title: '', description: '', sort_order: 0 });

  // FAQ Modal State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', sort_order: 0 });

  const fetchContactPageData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact-page/page');
      if (res.data.success && res.data.data) {
        if (res.data.data.settings) setSettings(res.data.data.settings);
        if (Array.isArray(res.data.data.departments)) setDepartments(res.data.data.departments);
        if (Array.isArray(res.data.data.infrastructure)) setInfrastructure(res.data.data.infrastructure);
        if (Array.isArray(res.data.data.faqs)) setFaqs(res.data.data.faqs);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Contact page data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactPageData();
  }, []);

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);
    try {
      const res = await api.put('/contact-page/settings', settings);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Contact page copy & HQ map settings saved!' });
        setSettings(res.data.data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Department Handlers
  const handleSaveDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/contact-page/departments/${editingDept.id}`, deptForm);
        setMessage({ type: 'success', text: `Department '${deptForm.title}' updated.` });
      } else {
        await api.post('/contact-page/departments', deptForm);
        setMessage({ type: 'success', text: `Department '${deptForm.title}' added.` });
      }
      setIsDeptModalOpen(false);
      fetchContactPageData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save department.' });
    }
  };

  const handleDeleteDept = async (id: number, title: string) => {
    if (window.confirm(`Delete department '${title}'?`)) {
      try {
        await api.delete(`/contact-page/departments/${id}`);
        setMessage({ type: 'success', text: `Department '${title}' deleted.` });
        fetchContactPageData();
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete department.' });
      }
    }
  };

  // Infra Handlers
  const handleSaveInfra = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInfra) {
        await api.put(`/contact-page/infrastructure/${editingInfra.id}`, infraForm);
        setMessage({ type: 'success', text: `Infrastructure card '${infraForm.title}' updated.` });
      } else {
        await api.post('/contact-page/infrastructure', infraForm);
        setMessage({ type: 'success', text: `Infrastructure card '${infraForm.title}' added.` });
      }
      setIsInfraModalOpen(false);
      fetchContactPageData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save infrastructure card.' });
    }
  };

  const handleDeleteInfra = async (id: number, title: string) => {
    if (window.confirm(`Delete infrastructure card '${title}'?`)) {
      try {
        await api.delete(`/contact-page/infrastructure/${id}`);
        setMessage({ type: 'success', text: `Infrastructure card '${title}' deleted.` });
        fetchContactPageData();
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete infrastructure card.' });
      }
    }
  };

  // FAQ Handlers
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await api.put(`/contact-page/faqs/${editingFaq.id}`, faqForm);
        setMessage({ type: 'success', text: `FAQ updated.` });
      } else {
        await api.post('/contact-page/faqs', faqForm);
        setMessage({ type: 'success', text: `FAQ added.` });
      }
      setIsFaqModalOpen(false);
      fetchContactPageData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save FAQ.' });
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (window.confirm(`Delete this FAQ?`)) {
      try {
        await api.delete(`/contact-page/faqs/${id}`);
        setMessage({ type: 'success', text: `FAQ deleted.` });
        fetchContactPageData();
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete FAQ.' });
      }
    }
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
              DYNAMIC CONTACT ENGINE
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Contact Us Page Manager</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure hero copy, form text, HQ map, departments, infrastructure cards, and FAQs.
            </p>
          </div>
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

        {/* TAB NAVIGATION BAR */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>1. Page Copy & HQ Map</span>
          </button>

          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'departments'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>2. Departments ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('infra')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'infra'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>3. Infrastructure ({infrastructure.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('faqs')}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>4. FAQs ({faqs.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading Contact page settings...</div>
        ) : (
          <>
            {/* TAB 1: PAGE COPY & HQ MAP SETTINGS */}
            {activeTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="space-y-8 max-w-4xl">
                {/* Hero Section Copy */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold border-b pb-3 text-slate-900">Hero Section Copy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tagline *</label>
                      <input
                        required
                        type="text"
                        value={settings.hero_tagline}
                        onChange={(e) => setSettings({ ...settings, hero_tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Headline *</label>
                      <input
                        required
                        type="text"
                        value={settings.hero_headline}
                        onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Highlight Word *</label>
                      <input
                        required
                        type="text"
                        value={settings.hero_highlight}
                        onChange={(e) => setSettings({ ...settings, hero_highlight: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Copy */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold border-b pb-3 text-slate-900">Contact Form Copy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Form Headline *</label>
                      <input
                        required
                        type="text"
                        value={settings.form_headline}
                        onChange={(e) => setSettings({ ...settings, form_headline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Form Subtitle *</label>
                      <input
                        required
                        type="text"
                        value={settings.form_subtitle}
                        onChange={(e) => setSettings({ ...settings, form_subtitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Form Success Alert Message *</label>
                    <input
                      required
                      type="text"
                      value={settings.form_success_msg}
                      onChange={(e) => setSettings({ ...settings, form_success_msg: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                {/* Global HQ Location & Map */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold border-b pb-3 text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-green" />
                    <span>Global HQ & Google Map Embed</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">HQ Tagline *</label>
                      <input
                        required
                        type="text"
                        value={settings.hq_tagline}
                        onChange={(e) => setSettings({ ...settings, hq_tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">HQ Headline *</label>
                      <input
                        required
                        type="text"
                        value={settings.hq_headline}
                        onChange={(e) => setSettings({ ...settings, hq_headline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">HQ Highlight Word *</label>
                      <input
                        required
                        type="text"
                        value={settings.hq_highlight}
                        onChange={(e) => setSettings({ ...settings, hq_highlight: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">HQ Physical Address *</label>
                    <input
                      required
                      type="text"
                      value={settings.hq_address}
                      onChange={(e) => setSettings({ ...settings, hq_address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Google Maps Embed iFrame URL * (src attribute)
                    </label>
                    <input
                      required
                      type="text"
                      value={settings.hq_map_url}
                      onChange={(e) => setSettings({ ...settings, hq_map_url: e.target.value })}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Working Hours *</label>
                      <input
                        required
                        type="text"
                        value={settings.hq_hours}
                        onChange={(e) => setSettings({ ...settings, hq_hours: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Quality Certification *</label>
                      <input
                        required
                        type="text"
                        value={settings.hq_certification}
                        onChange={(e) => setSettings({ ...settings, hq_certification: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Infrastructure Headers */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold border-b pb-3 text-slate-900">Infrastructure Section Headers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tagline *</label>
                      <input
                        required
                        type="text"
                        value={settings.infra_tagline}
                        onChange={(e) => setSettings({ ...settings, infra_tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Headline *</label>
                      <input
                        required
                        type="text"
                        value={settings.infra_headline}
                        onChange={(e) => setSettings({ ...settings, infra_headline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Highlight Word *</label>
                      <input
                        required
                        type="text"
                        value={settings.infra_highlight}
                        onChange={(e) => setSettings({ ...settings, infra_highlight: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-brand-blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Quote Box */}
                <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold border-b pb-3 text-slate-900">Brand Quote Footer</h3>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Quote Text *</label>
                    <textarea
                      rows={2}
                      required
                      value={settings.quote_text}
                      onChange={(e) => setSettings({ ...settings, quote_text: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm italic"
                    ></textarea>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Quote Author *</label>
                    <input
                      required
                      type="text"
                      value={settings.quote_author}
                      onChange={(e) => setSettings({ ...settings, quote_author: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-brand-blue text-white font-bold px-10 py-4 rounded-full text-sm hover:bg-slate-900 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving...' : 'Save All Page Settings & Map'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: DEPARTMENTS */}
            {activeTab === 'departments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Contact Departments</h3>
                    <p className="text-xs text-slate-500">Manage phone, email, and WhatsApp cards.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingDept(null);
                      setDeptForm({ title: '', description: '', phone: '', email: '', whatsapp: '', sort_order: departments.length + 1 });
                      setIsDeptModalOpen(true);
                    }}
                    className="bg-brand-blue text-white font-bold px-6 py-2.5 rounded-full text-xs hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Department</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-bold text-slate-900">{dept.title}</h4>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditingDept(dept); setDeptForm(dept); setIsDeptModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-brand-blue cursor-pointer">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteDept(dept.id, dept.title)} className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{dept.description}</p>
                        <div className="space-y-2 text-xs">
                          {dept.phone && <div className="flex items-center gap-2 text-slate-700 font-semibold"><Phone className="w-3.5 h-3.5 text-brand-green" /><span>{dept.phone}</span></div>}
                          {dept.email && <div className="flex items-center gap-2 text-slate-700 font-semibold"><Mail className="w-3.5 h-3.5 text-brand-blue" /><span>{dept.email}</span></div>}
                          {dept.whatsapp && <div className="flex items-center gap-2 text-slate-700 font-semibold"><MessageCircle className="w-3.5 h-3.5 text-emerald-600" /><span>WhatsApp: {dept.whatsapp}</span></div>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: INFRASTRUCTURE CARDS */}
            {activeTab === 'infra' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Infrastructure & Reach Cards</h3>
                    <p className="text-xs text-slate-500">Manage operational hubs, networks, and dispatch centers.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingInfra(null);
                      setInfraForm({ title: '', description: '', sort_order: infrastructure.length + 1 });
                      setIsInfraModalOpen(true);
                    }}
                    className="bg-brand-blue text-white font-bold px-6 py-2.5 rounded-full text-xs hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Infrastructure Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {infrastructure.map((card) => (
                    <div key={card.id} className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-base font-bold text-slate-900">{card.title}</h4>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setEditingInfra(card); setInfraForm(card); setIsInfraModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-brand-blue cursor-pointer">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteInfra(card.id, card.title)} className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: FAQS */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
                    <p className="text-xs text-slate-500">Manage accordion Q&A pairs for the contact page.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingFaq(null);
                      setFaqForm({ question: '', answer: '', sort_order: faqs.length + 1 });
                      setIsFaqModalOpen(true);
                    }}
                    className="bg-brand-blue text-white font-bold px-6 py-2.5 rounded-full text-xs hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add FAQ Item</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex justify-between items-start gap-4 shadow-xs">
                      <div className="space-y-2">
                        <h4 className="text-base font-bold text-slate-900">Q: {faq.question}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">A: {faq.answer}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingFaq(faq); setFaqForm(faq); setIsFaqModalOpen(true); }} className="p-1.5 text-slate-500 hover:text-brand-blue cursor-pointer">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteFaq(faq.id)} className="p-1.5 text-slate-500 hover:text-red-600 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* MODAL: DEPARTMENT */}
        {isDeptModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-lg">{editingDept ? 'Edit Department' : 'Add Department'}</h3>
                <button onClick={() => setIsDeptModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSaveDept} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Title *</label>
                  <input required type="text" value={deptForm.title} onChange={(e) => setDeptForm({ ...deptForm, title: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Working Hours / Subtitle</label>
                  <input type="text" value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Phone Number</label>
                  <input type="text" value={deptForm.phone} onChange={(e) => setDeptForm({ ...deptForm, phone: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Email Address</label>
                  <input type="email" value={deptForm.email} onChange={(e) => setDeptForm({ ...deptForm, email: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">WhatsApp Number</label>
                  <input type="text" value={deptForm.whatsapp} onChange={(e) => setDeptForm({ ...deptForm, whatsapp: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsDeptModalOpen(false)} className="px-5 py-2.5 border rounded-full text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-blue text-white rounded-full text-xs font-bold">Save Department</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: INFRASTRUCTURE CARD */}
        {isInfraModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-lg">{editingInfra ? 'Edit Infra Card' : 'Add Infra Card'}</h3>
                <button onClick={() => setIsInfraModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSaveInfra} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Title *</label>
                  <input required type="text" value={infraForm.title} onChange={(e) => setInfraForm({ ...infraForm, title: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Description *</label>
                  <textarea rows={3} required value={infraForm.description} onChange={(e) => setInfraForm({ ...infraForm, description: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsInfraModalOpen(false)} className="px-5 py-2.5 border rounded-full text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-blue text-white rounded-full text-xs font-bold">Save Infra Card</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: FAQ ITEM */}
        {isFaqModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <h3 className="font-bold text-lg">{editingFaq ? 'Edit FAQ' : 'Add FAQ'}</h3>
                <button onClick={() => setIsFaqModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleSaveFaq} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Question *</label>
                  <input required type="text" value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Answer *</label>
                  <textarea rows={4} required value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-sm" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsFaqModalOpen(false)} className="px-5 py-2.5 border rounded-full text-xs font-semibold">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-blue text-white rounded-full text-xs font-bold">Save FAQ</button>
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

export default ContactManager;
