import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';

interface MaintenanceSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface MaintenanceCard {
  id: number;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

export const MaintenanceManager: React.FC = () => {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    tagline: 'MAINTENANCE & SUPPORT',
    headline: 'Keeping your Solar system efficient.',
    highlight_word: 'Solar',
    subtitle: 'Ensuring smooth performance all year for reliable solar energy output.',
  });

  const [cards, setCards] = useState<MaintenanceCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Card Modal States
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<MaintenanceCard | null>(null);
  const [cardForm, setCardForm] = useState({
    title: '',
    description: '',
    icon_name: 'Activity',
    sort_order: 1,
  });

  const fetchMaintenanceData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/home/maintenance');
      if (res.data.success) {
        if (res.data.data.settings?.headline) {
          setSettings(res.data.data.settings);
        }
        setCards(res.data.data.cards || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Maintenance section configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceData();
  }, [fetchMaintenanceData]);

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/maintenance', settings);
      setMessage({ type: 'success', text: 'Maintenance section settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update maintenance section settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Card Submit & Delete
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.title || !cardForm.description) {
      alert('Title and description are required.');
      return;
    }

    try {
      if (editingCard) {
        await api.put(`/home/maintenance/cards/${editingCard.id}`, cardForm);
        setMessage({ type: 'success', text: `Service card '${cardForm.title}' updated.` });
      } else {
        await api.post('/home/maintenance/cards', cardForm);
        setMessage({ type: 'success', text: `Service card '${cardForm.title}' added.` });
      }
      setIsCardModalOpen(false);
      fetchMaintenanceData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save maintenance card.' });
    }
  };

  const handleCardDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete maintenance card '${title}'?`)) return;
    try {
      await api.delete(`/home/maintenance/cards/${id}`);
      setMessage({ type: 'success', text: `Card '${title}' deleted.` });
      fetchMaintenanceData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete maintenance card.' });
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
              HOME PAGE MANAGER
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Maintenance & Support Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure left side headers, highlight word, and dynamic stacking service card details.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Maintenance section settings...</div>
        ) : (
          <div className="space-y-12 max-w-6xl">
            {/* 2-COLUMN SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* LEFT SIDE: SETTINGS FORM */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">1. Left Side Headers</h2>
                    <p className="text-xs text-slate-500">Tagline, main headline, highlight keyword, and overview text.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
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
                    <span className="text-[11px] text-slate-400 mt-1 block">Renders styled in #44a0e3.</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Subtitle Overview *</label>
                    <textarea
                      rows={4}
                      required
                      value={settings.subtitle}
                      onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                    ></textarea>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                    >
                      {savingSettings ? 'Saving Settings...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>

              {/* RIGHT SIDE: CARDS CRUD MANAGER */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span>2. Service Cards</span>
                      <Layers className="w-4 h-4 text-brand-blue" />
                    </h2>
                    <p className="text-xs text-slate-500">Service cards rendered in sticky stacking cards on client.</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingCard(null);
                      setCardForm({ title: '', description: '', icon_name: 'Activity', sort_order: cards.length + 1 });
                      setIsCardModalOpen(true);
                    }}
                    className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-xs shadow-xs self-start"
                  >
                    <Plus className="w-4 h-4 text-brand-green" />
                    <span>Add Service Card</span>
                  </button>
                </div>

                {/* Cards Data Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Order</th>
                        <th className="px-5 py-3">Icon Name</th>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cards.map((card) => (
                        <tr key={card.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-xs font-bold text-slate-500">{card.sort_order}</td>
                          <td className="px-5 py-3.5 text-xs font-bold text-brand-blue bg-blue-50/50 rounded-lg">
                            {card.icon_name || 'Activity'}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{card.title}</td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingCard(card);
                                  setCardForm({
                                    title: card.title,
                                    description: card.description,
                                    icon_name: card.icon_name || 'Activity',
                                    sort_order: card.sort_order,
                                  });
                                  setIsCardModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Edit Card"
                              >
                                <Edit className="w-4 h-4 text-brand-blue" />
                              </button>
                              <button
                                onClick={() => handleCardDelete(card.id, card.title)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete Card"
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
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT SERVICE CARD */}
        {isCardModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {editingCard ? 'Edit Service Card' : 'Add Service Card'}
              </h3>

              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Title *</label>
                  <input
                    required
                    type="text"
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    placeholder="e.g. Continuous System Performance Telemetry"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={cardForm.description}
                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                    placeholder="Provide details about this service card..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Icon Name (Lucide Icon String)
                  </label>
                  <input
                    type="text"
                    value={cardForm.icon_name}
                    onChange={(e) => setCardForm({ ...cardForm, icon_name: e.target.value })}
                    placeholder="e.g. Activity"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Valid examples: Activity, Wrench, ShieldCheck, Cpu, BarChart3, Sun, Zap, Shield</span>
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={cardForm.sort_order}
                    onChange={(e) => setCardForm({ ...cardForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCardModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-blue text-white rounded-full font-semibold hover:bg-slate-900 transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingCard ? 'Save Changes' : 'Add Card'}
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

export default MaintenanceManager;
