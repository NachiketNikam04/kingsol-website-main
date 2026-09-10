import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  X,
  Sliders,
  ListCheck,
  PlusCircle,
  Phone,
} from 'lucide-react';

interface ServicePageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  emergency_tagline: string;
  emergency_title: string;
  emergency_phone: string;
}

interface ServiceItem {
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
  sort_order: number;
}

export const ServicesManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'services'>('services');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<ServicePageSettings>({
    tagline: 'EXPERT SERVICES',
    headline: '10+ years of Excellence in the solar industry.',
    highlight_word: 'Excellence',
    emergency_tagline: 'Emergency Support',
    emergency_title: 'Technical Dispatch Unit',
    emergency_phone: '+91 1234567890',
  });

  // Services Data
  const [services, setServices] = useState<ServiceItem[]>([]);

  // Modal State for Add / Edit Service
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [formData, setFormData] = useState<{
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
    sort_order: number;
  }>({
    title: '',
    slug: '',
    short_desc: '',
    grid_img_url: '',
    hero_img_url: '',
    detail_title: '',
    paragraph1: '',
    paragraph2: '',
    checklist: [''],
    gallery_img_url: '',
    sort_order: 0,
  });

  // Fetch Services Page Data
  const fetchServicesData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/services/page');
      if (res.data.success) {
        setSettings(res.data.data.settings);
        setServices(res.data.data.services);
      }
    } catch {
      setAlert({ type: 'error', text: 'Failed to load Services data from database.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServicesData();
  }, [fetchServicesData]);

  // Handle Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);
    try {
      const res = await api.put('/services/settings', settings);
      if (res.data.success) {
        setAlert({ type: 'success', text: 'Services page header & emergency settings saved successfully.' });
      }
    } catch {
      setAlert({ type: 'error', text: 'Failed to update Services page settings.' });
    } finally {
      setSaving(false);
    }
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      slug: '',
      short_desc: '',
      grid_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
      hero_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=1600&auto=format&fit=crop',
      detail_title: '',
      paragraph1: '',
      paragraph2: '',
      checklist: ['High-efficiency solar component sourcing.'],
      gallery_img_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=1200&auto=format&fit=crop',
      sort_order: services.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      slug: service.slug,
      short_desc: service.short_desc,
      grid_img_url: service.grid_img_url,
      hero_img_url: service.hero_img_url,
      detail_title: service.detail_title,
      paragraph1: service.paragraph1,
      paragraph2: service.paragraph2,
      checklist: service.checklist && service.checklist.length > 0 ? service.checklist : [''],
      gallery_img_url: service.gallery_img_url,
      sort_order: service.sort_order,
    });
    setIsModalOpen(true);
  };

  // Title change with automatic slug generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => {
      // Auto-generate slug only if not editing or slug is clean
      const autoSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      return {
        ...prev,
        title: val,
        detail_title: prev.detail_title || val,
        slug: editingService ? prev.slug : autoSlug,
      };
    });
  };

  // Checklist Item Helpers
  const handleChecklistItemChange = (index: number, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.checklist];
      updated[index] = val;
      return { ...prev, checklist: updated };
    });
  };

  const handleAddChecklistItem = () => {
    setFormData((prev) => ({ ...prev, checklist: [...prev.checklist, ''] }));
  };

  const handleRemoveChecklistItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index),
    }));
  };

  // Submit Modal (Add / Edit)
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    const payload = {
      ...formData,
      checklist: formData.checklist.filter((item) => item.trim() !== ''),
    };

    try {
      if (editingService) {
        const res = await api.put(`/services/${editingService.id}`, payload);
        if (res.data.success) {
          setAlert({ type: 'success', text: `Service '${formData.title}' updated successfully.` });
          setIsModalOpen(false);
          fetchServicesData();
        }
      } else {
        const res = await api.post('/services', payload);
        if (res.data.success) {
          setAlert({ type: 'success', text: `Service '${formData.title}' added successfully.` });
          setIsModalOpen(false);
          fetchServicesData();
        }
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setAlert({
        type: 'error',
        text: errorObj.response?.data?.message || 'Failed to save service.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete Service
  const handleDeleteService = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the service '${title}'?`)) return;

    try {
      const res = await api.delete(`/services/${id}`);
      if (res.data.success) {
        setAlert({ type: 'success', text: `Service '${title}' deleted.` });
        setServices((prev) => prev.filter((item) => item.id !== id));
      }
    } catch {
      setAlert({ type: 'error', text: 'Failed to delete service.' });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-green tracking-widest uppercase block mb-1">
              SERVICES HUB & OFFERINGS
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Services & Service Details Manager</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage main Services page hero settings, emergency support hotline, and full service items catalog.
            </p>
          </div>

          {/* Tab Controls */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl w-fit shadow-xs">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-brand-green text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Wrench className="w-4 h-4" /> Manage Services ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-brand-green text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4" /> Header & Emergency
            </button>
          </div>
        </div>

        {/* Alert Notification */}
        {alert && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              alert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {alert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{alert.text}</span>
            </div>
            <button onClick={() => setAlert(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">Loading Services Data from Database...</div>
        ) : activeTab === 'settings' ? (
          /* TAB 1: PAGE HEADER & EMERGENCY SETTINGS */
          <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xs max-w-4xl space-y-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-green" /> Services Main Page Header Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tagline Badge</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="EXPERT SERVICES"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Highlight Word (Colored)</label>
                  <input
                    type="text"
                    value={settings.highlight_word}
                    onChange={(e) => setSettings({ ...settings, highlight_word: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Excellence"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Main Page Headline</label>
                  <textarea
                    rows={2}
                    value={settings.headline}
                    onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="10+ years of Excellence in the solar industry."
                  />
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-blue" /> Emergency Support Hotline (Sidebar Widget)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Emergency Tagline</label>
                  <input
                    type="text"
                    value={settings.emergency_tagline}
                    onChange={(e) => setSettings({ ...settings, emergency_tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Emergency Support"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Emergency Unit Title</label>
                  <input
                    type="text"
                    value={settings.emergency_title}
                    onChange={(e) => setSettings({ ...settings, emergency_title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Technical Dispatch Unit"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={settings.emergency_phone}
                    onChange={(e) => setSettings({ ...settings, emergency_phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green font-bold text-brand-blue"
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-green text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
            >
              {saving ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </form>
        ) : (
          /* TAB 2: MANAGE SERVICES CRUD DATA TABLE */
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Active Services ({services.length})</h3>
              <button
                onClick={handleOpenAddModal}
                className="bg-brand-green text-slate-900 px-6 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Service
              </button>
            </div>

            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Sort</th>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Service Title & Slug</th>
                    <th className="px-6 py-4">Short Description</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {services.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-500">#{item.sort_order}</td>
                      <td className="px-6 py-4">
                        <img
                          src={getAssetUrl(item.grid_img_url)}
                          alt={item.title}
                          className="w-14 h-10 object-cover rounded-lg border border-slate-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold block text-slate-900">{item.title}</span>
                        <span className="text-xs text-brand-blue font-mono">/services/{item.slug}</span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-600">{item.short_desc}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-blue text-brand-blue transition-colors cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(item.id, item.title)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SERVICE MODAL FOR ADD / EDIT */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingService ? `Edit Service: ${editingService.title}` : 'Add New Service'}
              </h2>

              <form onSubmit={handleSubmitService} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Service Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="e.g. Solar panel cleaning services"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Slug</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="solar-panel-cleaning"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Short Description (Shown on Main Grid Cards)
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.short_desc}
                      onChange={(e) => setFormData({ ...formData, short_desc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="Automated and manual high-pressure deionized cleaning..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Detail Page Heading Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.detail_title}
                      onChange={(e) => setFormData({ ...formData, detail_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="Professional Solar Panel Cleaning & Thermal Auditing"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Detail Paragraph 1</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.paragraph1}
                      onChange={(e) => setFormData({ ...formData, paragraph1: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="First overview paragraph..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Detail Paragraph 2</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.paragraph2}
                      onChange={(e) => setFormData({ ...formData, paragraph2: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="Second in-depth paragraph..."
                    />
                  </div>
                </div>

                {/* DYNAMIC CHECKLIST LIST BUILDER */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                      <ListCheck className="w-4 h-4 text-brand-green" /> Key Value Propositions (Checklist Bullets)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="text-xs font-bold text-brand-blue flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Bullet Point
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleChecklistItemChange(idx, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="e.g. Deionized pure water washing prevents spots."
                        />
                        {formData.checklist.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(idx)}
                            className="p-2 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* IMAGE URL INPUTS */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Grid Card Image URL</label>
                    <input
                      type="text"
                      required
                      value={formData.grid_img_url}
                      onChange={(e) => setFormData({ ...formData, grid_img_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Detail Page Hero Image URL
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.hero_img_url}
                      onChange={(e) => setFormData({ ...formData, hero_img_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                      Bottom Gallery Banner Image URL
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.gallery_img_url}
                      onChange={(e) => setFormData({ ...formData, gallery_img_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-brand-green text-slate-900 font-bold text-sm rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
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

export default ServicesManager;
