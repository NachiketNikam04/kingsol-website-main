import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  SlidersHorizontal,
  FileText,
  Save,
} from 'lucide-react';

interface BlogsPageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  author: string;
  image_url: string;
  excerpt: string;
  content: string;
  is_published: boolean;
  published_at: string;
}

export const BlogsManager: React.FC = () => {
  // Settings Form State
  const [settings, setSettings] = useState<BlogsPageSettings>({
    tagline: 'KINGSOL JOURNAL & INSIGHTS',
    headline: 'News & Insights on clean energy.',
    highlight_word: 'Insights',
    subtitle:
      'Stay updated with the latest in solar PV technology, grid-tie inverter innovations, and renewable energy policies across India.',
  });

  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Blog Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    author: 'Kingsol Team',
    image_url: '',
    excerpt: '',
    content: '',
    is_published: true,
  });

  const fetchBlogsPageData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/blogs/page');
      if (res.data.success && res.data.data) {
        if (res.data.data.settings) setSettings(res.data.data.settings);
        if (Array.isArray(res.data.data.blogs)) setBlogs(res.data.data.blogs);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Blogs page settings and article list.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogsPageData();
  }, [fetchBlogsPageData]);

  // Handle Header Settings Submission
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);

    try {
      const res = await api.put('/blogs/page', settings);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Blogs page header settings saved successfully!' });
        setSettings(res.data.data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update Blogs page header settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Image Upload for Articles
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
        setForm((prev) => ({ ...prev, image_url: fileUrl }));
        setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Image upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (blog: BlogArticle) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      author: blog.author || 'Kingsol Team',
      image_url: blog.image_url || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      is_published: blog.is_published ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete blog post '${title}'?`)) return;
    try {
      await api.delete(`/blogs/${id}`);
      setMessage({ type: 'success', text: `Blog '${title}' deleted successfully.` });
      fetchBlogsPageData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete blog article.' });
    }
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        author: form.author,
        image_url: form.image_url,
        excerpt: form.excerpt,
        content: form.content,
        is_published: form.is_published,
      };

      if (editingBlog) {
        await api.put(`/blogs/${editingBlog.id}`, payload);
        setMessage({ type: 'success', text: `Blog '${form.title}' updated successfully.` });
      } else {
        await api.post('/blogs', payload);
        setMessage({ type: 'success', text: `Blog '${form.title}' created successfully.` });
      }

      setIsModalOpen(false);
      fetchBlogsPageData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save blog article.' });
    }
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-blue tracking-widest uppercase block mb-1">
              DYNAMIC CONTENT ENGINE
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Blogs & News Manager</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage page hero header text along with corporate articles and technical news.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingBlog(null);
              setForm({
                title: '',
                slug: '',
                author: 'Kingsol Team',
                image_url: '',
                excerpt: '',
                content: '',
                is_published: true,
              });
              setIsModalOpen(true);
            }}
            className="bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white hover:shadow-glow-orange transition-all duration-300 cursor-pointer px-6 py-3 flex items-center gap-2 text-sm shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Article</span>
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

        {/* SECTION 1: PAGE HEADER SETTINGS FORM */}
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs mb-10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Blogs Page Header Settings</h2>
                <p className="text-xs text-slate-500">Configure top hero tagline, headline, highlighted word, and subtitle.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="bg-brand-blue text-white font-bold px-6 py-2.5 rounded-full text-xs hover:bg-slate-900 transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingSettings ? 'Saving...' : 'Save Header Settings'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Headline *</label>
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
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Subtitle / Page Description *</label>
            <textarea
              rows={2}
              required
              value={settings.subtitle}
              onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none leading-relaxed resize-none"
            ></textarea>
          </div>
        </form>

        {/* SECTION 2: BLOG ARTICLES DATA TABLE */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Blog Articles Data Table</h2>
                <p className="text-xs text-slate-500">Total: {blogs.length} published & draft articles</p>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-full pl-11 pr-4 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-brand-green outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-500 font-medium">Loading articles from database...</div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No blog articles match your search query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Author</th>
                    <th className="px-6 py-4">URL Slug</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 max-w-xs truncate">{blog.title}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-600">{blog.author}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">/blogs/{blog.slug}</td>
                      <td className="px-6 py-4 text-xs">
                        {blog.is_published ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full">
                            Published
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold rounded-full">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`http://localhost:5173/blogs/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                            title="Preview Article"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit className="w-4 h-4 text-brand-blue" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id, blog.title)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Article"
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
          )}
        </div>

        {/* MODAL: ADD / EDIT BLOG */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-3xl w-full shadow-2xl relative my-8 text-slate-900">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingBlog ? 'Edit Article' : 'Create Article'}
              </h2>

              <form onSubmit={handleSubmitArticle} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Article Title *</label>
                  <input
                    required
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. The Future of Grid-Tied Solar"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Author Name</label>
                    <input
                      type="text"
                      value={form.author}
                      onChange={(e) => setForm({ ...form, author: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Featured Image URL *</label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="text"
                        value={form.image_url}
                        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs outline-none"
                      />
                      <label className="bg-white border border-slate-200 text-slate-900 hover:text-brand-blue px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Article Excerpt (Short Summary) *</label>
                  <textarea
                    rows={2}
                    required
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Brief 2-sentence overview displayed on post cards..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Full Article Content (Markdown / Text) *</label>
                  <textarea
                    rows={8}
                    required
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Type or paste complete blog post content..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs rounded-xl p-4 outline-none focus:ring-2 focus:ring-brand-green"
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-1/2 bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingBlog ? 'Save Changes' : 'Publish Article'}
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

export default BlogsManager;
