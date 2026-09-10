import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Target,
  Compass,
} from 'lucide-react';

interface FoundationSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  vision_title: string;
  vision_description: string;
  mission_title: string;
  mission_description: string;
}

interface ValueItem {
  id: number;
  title: string;
  description: string;
  sort_order: number;
}

export const FoundationManager: React.FC = () => {
  const [settings, setSettings] = useState<FoundationSettings>({
    tagline: 'THE FOUNDATION',
    headline: 'What drives Kingsol forward.',
    highlight_word: 'Kingsol',
    vision_title: 'Our Vision',
    vision_description:
      'To engineer a world where clean, renewable energy is the undisputed baseline for every home and industry.',
    mission_title: 'Our Mission',
    mission_description:
      'To deliver flawlessly designed solar architectures that maximize grid independence and financial returns for our clients.',
  });

  const [values, setValues] = useState<ValueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal State for Values CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<ValueItem | null>(null);
  const [valueForm, setValueForm] = useState({ title: '', description: '', sort_order: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/about/foundation');
      if (res.data.success) {
        if (res.data.data.settings) setSettings(res.data.data.settings);
        if (res.data.data.values) setValues(res.data.data.values);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Foundation section data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/about/foundation', settings);
      setMessage({ type: 'success', text: 'Foundation text settings updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update Foundation settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenModal = (item?: ValueItem) => {
    if (item) {
      setEditingValue(item);
      setValueForm({ title: item.title, description: item.description, sort_order: item.sort_order });
    } else {
      setEditingValue(null);
      setValueForm({ title: '', description: '', sort_order: values.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSaveValue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingValue) {
        await api.put(`/about/foundation/values/${editingValue.id}`, valueForm);
        setMessage({ type: 'success', text: 'Value card updated successfully!' });
      } else {
        await api.post('/about/foundation/values', valueForm);
        setMessage({ type: 'success', text: 'Value card created successfully!' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save value card.' });
    }
  };

  const handleDeleteValue = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this value card?')) {
      try {
        await api.delete(`/about/foundation/values/${id}`);
        setMessage({ type: 'success', text: 'Value card deleted.' });
        fetchData();
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete value card.' });
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
              ABOUT PAGE MANAGER
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Foundation Section</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure tagline, main headline, Vision, Mission, and dynamic Core Value cards.
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

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading Foundation section data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: SETTINGS FORM (Vision & Mission) */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Header, Vision & Mission</h2>
                  <p className="text-xs text-slate-500">Core company direction settings.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tagline *</label>
                  <input
                    required
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Main Headline *</label>
                  <input
                    required
                    type="text"
                    value={settings.headline}
                    onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Highlighted Word *</label>
                  <input
                    required
                    type="text"
                    value={settings.highlight_word}
                    onChange={(e) => setSettings({ ...settings, highlight_word: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold text-brand-blue"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-4 h-4 text-brand-blue" />
                    <span>Vision Card Settings</span>
                  </h3>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Vision Title *</label>
                    <input
                      required
                      type="text"
                      value={settings.vision_title}
                      onChange={(e) => setSettings({ ...settings, vision_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Vision Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={settings.vision_description}
                      onChange={(e) => setSettings({ ...settings, vision_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm outline-none resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-brand-green" />
                    <span>Mission Card Settings</span>
                  </h3>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Mission Title *</label>
                    <input
                      required
                      type="text"
                      value={settings.mission_title}
                      onChange={(e) => setSettings({ ...settings, mission_title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm outline-none font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Mission Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={settings.mission_description}
                      onChange={(e) => setSettings({ ...settings, mission_description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm outline-none resize-none leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Foundation Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: VALUES CRUD DATA TABLE */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Core Value Cards</h2>
                    <p className="text-xs text-slate-500">Manage values displayed below Vision & Mission.</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal()}
                  className="bg-brand-green text-slate-900 font-bold px-4 py-2.5 rounded-full text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Value Card</span>
                </button>
              </div>

              {values.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No value cards added yet.</div>
              ) : (
                <div className="space-y-4">
                  {values.map((v, index) => (
                    <div
                      key={v.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-md">
                            0{index + 1}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{v.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{v.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenModal(v)}
                          className="p-2 text-slate-500 hover:text-brand-blue transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteValue(v.id)}
                          className="p-2 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: VALUE CARD FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative text-slate-900">
              <h3 className="text-xl font-bold mb-6">{editingValue ? 'Edit Value Card' : 'Add Value Card'}</h3>

              <form onSubmit={handleSaveValue} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Title *</label>
                  <input
                    required
                    type="text"
                    value={valueForm.title}
                    onChange={(e) => setValueForm({ ...valueForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Description *</label>
                  <textarea
                    rows={4}
                    required
                    value={valueForm.description}
                    onChange={(e) => setValueForm({ ...valueForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={valueForm.sort_order}
                    onChange={(e) => setValueForm({ ...valueForm, sort_order: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

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
                    className="px-6 py-2.5 rounded-full bg-brand-blue text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Save Value Card
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

export default FoundationManager;
