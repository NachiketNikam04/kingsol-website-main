import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogSectionSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

export const BlogsSectionManager: React.FC = () => {
  const [settings, setSettings] = useState<BlogSectionSettings>({
    tagline: 'BLOGS & NEWS',
    headline: 'Latest Insights',
    highlight_word: 'Insights',
    subtitle: 'News, technical engineering updates, and solar market innovations.',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/home/blogs-settings');
        if (res.data.success && res.data.data) {
          setSettings(res.data.data);
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to fetch Blog section header settings.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/home/blogs-settings', settings);
      setMessage({ type: 'success', text: 'Blog section headers updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update blog section headers.' });
    } finally {
      setSaving(false);
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
            <h1 className="text-3xl font-bold text-slate-900">Blog Section Headers</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure tagline, main headline, highlighted keyword, and subtitle for the home page blog showcase.
            </p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm max-w-3xl ${
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

        {/* Guidance Alert Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8 max-w-3xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-brand-blue text-white flex items-center justify-center shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Managing Blog Posts & Articles</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              This form strictly controls the header section text on the Home Page. To create, edit, or publish individual blog posts and articles, visit the main Blogs & News manager.
            </p>
            <Link
              to="/dashboard/blogs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-slate-900 transition-colors"
            >
              <span>Go to Blogs & News Manager</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading Blog section header settings...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Blog Header Controls</h2>
                <p className="text-xs text-slate-500">Configure text displayed above the home page blog grid.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  rows={3}
                  required
                  value={settings.subtitle}
                  onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                >
                  {saving ? 'Saving Header Settings...' : 'Save Header Settings'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default BlogsSectionManager;
