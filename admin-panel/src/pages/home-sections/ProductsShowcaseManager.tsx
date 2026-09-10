import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import { Link } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface ShowcaseSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface ProductItem {
  id: number;
  title: string;
  slug: string;
  image_url: string;
  is_featured: boolean;
  category_name?: string;
  brand_name?: string;
}

export const ProductsShowcaseManager: React.FC = () => {
  const [settings, setSettings] = useState<ShowcaseSettings>({
    tagline: 'FEATURED PICKS',
    headline: 'Products we Deliver',
    highlight_word: 'Deliver',
    subtitle: 'Featured products from our portfolio — click through to product pages',
  });

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchShowcaseData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/home/showcase');
      if (res.data.success) {
        if (res.data.data.settings?.headline) {
          setSettings(res.data.data.settings);
        }
        setProducts(res.data.data.products || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Showcase section configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShowcaseData();
  }, [fetchShowcaseData]);

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/showcase', settings);
      setMessage({ type: 'success', text: 'Showcase section settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update showcase section settings.' });
    } finally {
      setSavingSettings(false);
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
            <h1 className="text-3xl font-bold text-slate-900">Featured Products Showcase Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Customize section header text and view products pulled dynamically from your main catalog.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Showcase section settings...</div>
        ) : (
          <div className="space-y-12 max-w-6xl">
            {/* SECTION 1: SETTINGS FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">1. Showcase Section Headers</h2>
                  <p className="text-xs text-slate-500">Configure tagline, headline text, highlighted word, and subtitle.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Main Headline *</label>
                    <input
                      required
                      type="text"
                      value={settings.headline}
                      onChange={(e) => setSettings({ ...settings, headline: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Subtitle Overview</label>
                    <input
                      type="text"
                      value={settings.subtitle}
                      onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Showcase Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: CATALOG INFORMATION BANNER & LIVE FEATURED TABLE */}
            <div className="space-y-6">
              {/* Guidance Banner */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue text-white flex items-center justify-center shrink-0 shadow-md">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>Dynamic Product Catalog Integration</span>
                      <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                      The products displayed in this Home Page marquee slider are pulled directly from your main database table where <span className="font-bold text-slate-900">is_featured = true</span>. To add or remove products from this marquee, visit the <span className="font-bold text-brand-blue">Products & Brands Manager</span> and toggle the Featured switch on any product.
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard/products"
                  className="bg-slate-900 text-white px-6 py-3.5 rounded-full text-xs font-bold hover:bg-brand-blue transition-all flex items-center gap-2 shrink-0 shadow-sm"
                >
                  <span>Go to Products Manager</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>

              {/* Featured Products List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Currently Featured Products ({products.length})</h2>
                    <p className="text-xs text-slate-500">Products currently rendering inside the landing page marquee slider.</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Product Title</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Brand</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(prod.image_url) || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop'}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">{prod.title}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                            {prod.category_name || 'Solar Catalog'}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-brand-blue">
                            {prod.brand_name || 'Kingsol Tier-1'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                              ★ Featured
                            </span>
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
      </main>
      </div>
    </div>
  );
};

export default ProductsShowcaseManager;
