import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  Layers,
  Sliders,
  Plus,
  Edit,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Link as LinkIcon,
} from 'lucide-react';

interface SolutionsSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
}

interface SolutionCard {
  id: number;
  tag: string;
  title: string;
  description: string;
  image_url: string;
  category_slug: string;
  sort_order: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const SolutionsManager: React.FC = () => {
  const [settings, setSettings] = useState<SolutionsSettings>({
    tagline: 'OUR SOLUTIONS',
    headline: 'Powering the Future , one panel at a time.',
    highlight_word: 'Future',
  });

  const [cards, setCards] = useState<SolutionCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Card Modal State
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<SolutionCard | null>(null);
  const [cardForm, setCardForm] = useState({
    tag: '',
    title: '',
    description: '',
    image_url: '',
    category_slug: '',
    sort_order: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [solRes, catRes] = await Promise.all([
        api.get('/solutions'),
        api.get('/categories').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (solRes.data.success && solRes.data.data) {
        if (solRes.data.data.settings) setSettings((prev) => ({ ...prev, ...solRes.data.data.settings }));
        if (solRes.data.data.cards) setCards(solRes.data.data.cards);
      }

      if (catRes.data.success && catRes.data.data) {
        setCategories(catRes.data.data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch solutions configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Header Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);
    try {
      const res = await api.put('/solutions/settings', settings);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Solutions section header settings updated successfully.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update solutions header settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Image File Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        setCardForm((prev) => ({ ...prev, image_url: fileUrl }));
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Image upload failed. Ensure backend server is online.' });
    } finally {
      setUploading(false);
    }
  };

  // Submit Card
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        tag: cardForm.tag,
        title: cardForm.title,
        description: cardForm.description,
        image_url: cardForm.image_url,
        category_slug: cardForm.category_slug,
        sort_order: Number(cardForm.sort_order) || 0,
      };

      if (editingCard) {
        await api.put(`/solutions/cards/${editingCard.id}`, payload);
        setMessage({ type: 'success', text: `Solution card '${cardForm.title}' updated.` });
      } else {
        await api.post('/solutions/cards', payload);
        setMessage({ type: 'success', text: `Solution card '${cardForm.title}' created.` });
      }

      setIsCardModalOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save solution card.' });
    }
  };

  // Delete Card
  const handleCardDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete solution card '${title}'?`)) return;
    try {
      await api.delete(`/solutions/cards/${id}`);
      setMessage({ type: 'success', text: `Solution card '${title}' deleted.` });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete solution card.' });
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
              HOME PAGE SECTION CMS
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Our Solutions Manager</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage section headers and solution cards linking directly to the product catalog categories.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCard(null);
              setCardForm({
                tag: 'PV MODULES',
                title: '',
                description: '',
                image_url: '',
                category_slug: categories[0]?.slug || 'solar-modules',
                sort_order: cards.length + 1,
              });
              setIsCardModalOpen(true);
            }}
            className="bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Solution Card</span>
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading solutions data...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* SECTION 1: SECTION HEADERS FORM */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-green" /> Section Headers
              </h3>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tagline Badge</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="OUR SOLUTIONS"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Highlight Word (Colored)</label>
                  <input
                    type="text"
                    value={settings.highlight_word}
                    onChange={(e) => setSettings({ ...settings, highlight_word: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Future"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section Headline</label>
                  <textarea
                    rows={3}
                    value={settings.headline}
                    onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Powering the Future , one panel at a time."
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-brand-green text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                >
                  {savingSettings ? 'Saving Settings...' : 'Save Header Settings'}
                </button>
              </form>
            </div>

            {/* SECTION 2: SOLUTION CARDS LIST */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-blue" /> Solution Cards ({cards.length})
              </h3>

              {cards.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No solution cards created yet. Click 'Add Solution Card' above.
                </div>
              ) : (
                <div className="space-y-4">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                        <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                          <img src={getAssetUrl(card.image_url)} alt={card.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-green/20 text-slate-900 rounded">
                              {card.tag}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded flex items-center gap-1">
                              <LinkIcon className="w-3 h-3" /> /products/{card.category_slug}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate">{card.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{card.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => {
                            setEditingCard(card);
                            setCardForm({
                              tag: card.tag,
                              title: card.title,
                              description: card.description,
                              image_url: card.image_url,
                              category_slug: card.category_slug,
                              sort_order: card.sort_order || 0,
                            });
                            setIsCardModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4 text-brand-blue" />
                        </button>
                        <button
                          onClick={() => handleCardDelete(card.id, card.title)}
                          className="p-2 rounded-lg bg-white hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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

        {/* MODAL: ADD / EDIT SOLUTION CARD */}
        {isCardModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative my-8 text-slate-900">
              <button
                onClick={() => setIsCardModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingCard ? `Edit Solution Card` : 'Add Solution Card'}
              </h2>

              <form onSubmit={handleCardSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category Tag</label>
                  <input
                    type="text"
                    required
                    value={cardForm.tag}
                    onChange={(e) => setCardForm({ ...cardForm, tag: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="e.g. PV MODULES"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Title</label>
                  <input
                    type="text"
                    required
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Monocrystalline Solar Modules"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                  <textarea
                    rows={3}
                    required
                    value={cardForm.description}
                    onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="Brief technology overview..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Catalog Category Slug</label>
                  <div className="flex gap-2">
                    <select
                      value={cardForm.category_slug}
                      onChange={(e) => setCardForm({ ...cardForm, category_slug: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name} ({c.slug})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={cardForm.category_slug}
                      onChange={(e) => setCardForm({ ...cardForm, category_slug: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="Custom slug"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Cover Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={cardForm.image_url}
                      onChange={(e) => setCardForm({ ...cardForm, image_url: e.target.value })}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      placeholder="https://..."
                    />
                    <label className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-3 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0">
                      <Upload className="w-4 h-4 text-brand-green" />
                      <span>{uploading ? '...' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sort Order</label>
                  <input
                    type="number"
                    value={cardForm.sort_order}
                    onChange={(e) => setCardForm({ ...cardForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCardModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-green text-slate-900 font-bold text-xs rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Save Solution Card
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

export default SolutionsManager;
