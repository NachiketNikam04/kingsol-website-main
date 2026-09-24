import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Twitter,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sliders,
  Share2,
} from 'lucide-react';

interface FooterSettings {
  description: string;
  hq_label: string;
  address: string;
  phone: string;
  email: string;
  distribution_title?: string;
  distribution_description?: string;
}

interface SocialLink {
  id: number;
  platform_name: string;
  url: string;
  icon_name: string;
  sort_order: number;
}

export const FooterManager: React.FC = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    description: 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
    hq_label: 'Global HQ',
    address: 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.',
    phone: '+1 (800) 555-SOLAR',
    email: 'b2b@kingsol-energy.com',
    distribution_title: 'Pan India distribution',
    distribution_description: 'Kingsol supplies solar modules, inverters, and energy storage systems across major industrial and commercial hubs nationwide.',
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Social Link Modal State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [socialForm, setSocialForm] = useState({
    platform_name: '',
    url: '',
    icon_name: 'Globe',
    sort_order: 0,
  });

  // Available Lucide Icon Dropdown Options
  const availableIcons = [
    { label: 'Instagram', value: 'Instagram' },
    { label: 'Facebook', value: 'Facebook' },
    { label: 'LinkedIn', value: 'Linkedin' },
    { label: 'YouTube', value: 'Youtube' },
    { label: 'X (Twitter)', value: 'Twitter' },
    { label: 'Website / Globe', value: 'Globe' },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/footer');
      if (res.data.success && res.data.data) {
        if (res.data.data.settings) setSettings((prev) => ({ ...prev, ...res.data.data.settings }));
        if (res.data.data.socialLinks) setSocialLinks(res.data.data.socialLinks);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch footer configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Form A: Save Contact Details
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);
    try {
      const res = await api.put('/footer/settings', settings);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Footer contact details updated successfully.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update footer settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Form B: Add / Edit Social Link
  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        platform_name: socialForm.platform_name,
        url: socialForm.url,
        icon_name: socialForm.icon_name,
        sort_order: Number(socialForm.sort_order) || 0,
      };

      if (editingSocial) {
        await api.put(`/footer/social/${editingSocial.id}`, payload);
        setMessage({ type: 'success', text: `Social link '${socialForm.platform_name}' updated.` });
      } else {
        await api.post('/footer/social', payload);
        setMessage({ type: 'success', text: `Social link '${socialForm.platform_name}' added.` });
      }

      setIsSocialModalOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save social link.' });
    }
  };

  // Delete Social Link
  const handleSocialDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete social link '${name}'?`)) return;
    try {
      await api.delete(`/footer/social/${id}`);
      setMessage({ type: 'success', text: `Social link '${name}' deleted.` });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete social link.' });
    }
  };

  const renderIconPreview = (iconName: string) => {
    switch (iconName) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'Facebook':
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'Linkedin':
        return <Linkedin className="w-4 h-4 text-blue-700" />;
      case 'Youtube':
        return <Youtube className="w-4 h-4 text-red-600" />;
      case 'Twitter':
        return <Twitter className="w-4 h-4 text-slate-900" />;
      default:
        return <Globe className="w-4 h-4 text-brand-green" />;
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
            <span className="text-xs font-bold text-brand-blue tracking-widest uppercase block mb-1">
              FOOTER & SOCIAL LINKS CMS
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Footer Manager</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage website footer description, HQ contact details, and dynamic social media links.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSocial(null);
              setSocialForm({ platform_name: '', url: '', icon_name: 'Globe', sort_order: socialLinks.length + 1 });
              setIsSocialModalOpen(true);
            }}
            className="bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Social Link</span>
          </button>
        </div>

        {/* System Message Alert */}
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading footer settings...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* FORM A: FOOTER CONTACT DETAILS */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-green" /> Footer Info & Contact Details
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Description</label>
                  <textarea
                    rows={3}
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Footer description text..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">HQ Badge Label</label>
                    <input
                      type="text"
                      value={settings.hq_label}
                      onChange={(e) => setSettings({ ...settings, hq_label: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="Global HQ"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Support Phone Number</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="+1 (800) 555-SOLAR"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Headquarters Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="HQ Full Address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Official Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="b2b@kingsol-energy.com"
                  />
                </div>

                {/* Distribution Banner Settings (Tier 1 Top Bar) */}
                <div className="pt-5 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-green inline-block"></span>
                    Tier 1: Distribution Section (Top Bar)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Distribution Section Title
                      </label>
                      <input
                        type="text"
                        value={settings.distribution_title || ''}
                        onChange={(e) => setSettings({ ...settings, distribution_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                        placeholder="Pan India distribution"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                        Distribution Description
                      </label>
                      <textarea
                        rows={2}
                        value={settings.distribution_description || ''}
                        onChange={(e) => setSettings({ ...settings, distribution_description: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                        placeholder="Kingsol supplies solar modules, inverters, and energy storage systems across major industrial and commercial hubs nationwide."
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-brand-green text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                >
                  {savingSettings ? 'Saving Settings...' : 'Save Footer Settings'}
                </button>
              </form>
            </div>

            {/* FORM B: SOCIAL LINKS LIST & CRUD MANAGER */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-brand-blue" /> Dynamic Social Media Links ({socialLinks.length})
                </h3>

                {socialLinks.map((link) => (
  <div
    key={link.id}
    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
  >
    {/* Corrected Wrapper: Removed h-screen and changed to standard flex row */}
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
        {renderIconPreview(link.icon_name)}
      </div>
      
      {/* Corrected Text Wrapper: Changed to flex-col so title and URL stack vertically */}
      <div className="flex flex-col overflow-hidden">
        <h4 className="text-xs font-bold text-slate-900 truncate">{link.platform_name}</h4>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-slate-500 hover:text-brand-blue truncate block"
        >
          {link.url}
        </a>
      </div>
    </div>

    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={() => {
          setEditingSocial(link);
          setSocialForm({
            platform_name: link.platform_name,
            url: link.url,
            icon_name: link.icon_name || 'Globe',
            sort_order: link.sort_order || 0,
          });
          setIsSocialModalOpen(true);
        }}
        className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
      >
        <Edit className="w-3.5 h-3.5 text-brand-blue" />
      </button>
      <button
        onClick={() => handleSocialDelete(link.id, link.platform_name)}
        className="p-2 rounded-lg bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SOCIAL LINK */}
        {isSocialModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsSocialModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingSocial ? `Edit Social Link` : 'Add New Social Link'}
              </h2>

              <form onSubmit={handleSocialSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Platform Name</label>
                  <input
                    type="text"
                    required
                    value={socialForm.platform_name}
                    onChange={(e) => setSocialForm({ ...socialForm, platform_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="e.g. Instagram"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Social Profile URL</label>
                  <input
                    type="url"
                    required
                    value={socialForm.url}
                    onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Icon</label>
                  <select
                    value={socialForm.icon_name}
                    onChange={(e) => setSocialForm({ ...socialForm, icon_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                  >
                    {availableIcons.map((ic) => (
                      <option key={ic.value} value={ic.value}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={socialForm.sort_order}
                    onChange={(e) => setSocialForm({ ...socialForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSocialModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-green text-slate-900 font-bold text-xs rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Save Link
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

export default FooterManager;
