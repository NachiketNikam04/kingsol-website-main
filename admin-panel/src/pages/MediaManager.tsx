import { getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Video, Play, ExternalLink } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export interface MediaItem {
  id: number;
  title: string;
  youtube_url: string;
  thumbnail_url: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export const MediaManager: React.FC = () => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const [form, setForm] = useState({
    title: '',
    youtube_url: '',
    thumbnail_url: '',
    description: '',
    is_active: true,
    sort_order: 0,
  });

  const extractYouTubeThumbnail = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      // Guaranteed to exist, preventing 404s
      return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
    }
    return '';
  };

  const handleYoutubeUrlChange = (url: string) => {
    const computedThumb = extractYouTubeThumbnail(url);
    setForm((prev) => ({
      ...prev,
      youtube_url: url,
      thumbnail_url: computedThumb || prev.thumbnail_url,
    }));
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/media/all');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching media items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: MediaItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        youtube_url: item.youtube_url || '',
        thumbnail_url: item.thumbnail_url || extractYouTubeThumbnail(item.youtube_url),
        description: item.description || '',
        is_active: item.is_active ?? true,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        youtube_url: '',
        thumbnail_url: '',
        description: '',
        is_active: true,
        sort_order: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem?.id) {
        await api.put(`/media/${editingItem.id}`, form);
      } else {
        await api.post('/media', form);
      }
      handleCloseModal();
      fetchItems();
    } catch (err) {
      console.error('Error saving media item:', err);
      alert('Failed to save media item.');
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id || !window.confirm('Are you sure you want to delete this media item?')) return;
    try {
      await api.delete(`/media/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Error deleting media item:', err);
      alert('Failed to delete media item.');
    }
  };

  const handleToggleActive = async (item: MediaItem) => {
    if (!item?.id) return;
    try {
      await api.put(`/media/${item.id}`, {
        ...item,
        is_active: !item.is_active,
      });
      fetchItems();
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Video className="w-7 h-7 text-brand-green" />
            <span>Media & Video Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage public YouTube video presentations, technical demos, and corporate videos.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-green hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Video</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Loading media items...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          No media videos found. Click "Add Media Video" above to add your first YouTube video.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items?.map((item) => {
            if (!item) return null; // Defensive check for bad DB rows

            const itemTitle = item.title || 'Untitled Video';
            const itemUrl = item.youtube_url || '#';
            const isActive = item.is_active ?? true;
            
            // Prefer custom local thumbnail, fallback to YT generation
            const itemThumb = item.thumbnail_url?.startsWith('/uploads') 
  ? getAssetUrl(item.thumbnail_url) 
  : extractYouTubeThumbnail(itemUrl);

return (
  <div
    key={item.id || Math.random()}
    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
  >
    <div>
      <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
        {/* MAKE SURE src={itemThumb} IS HERE */}
        <img
          src={itemThumb}
          alt={itemTitle}
          onError={(e) => {
            e.currentTarget.style.display = 'none'; 
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
        />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />

                    {/* Play Button Overlay */}
                    <div className="w-12 h-12 rounded-full bg-brand-green/90 text-white flex items-center justify-center shadow-lg relative z-10 group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current translate-x-0.5" />
                    </div>

                    <button
                      onClick={() => handleToggleActive(item)}
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm z-20 ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700/80 text-slate-200'
                      }`}
                    >
                      {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2">{itemTitle}</h3>
                  {item.description && (
                    <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-green hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Watch YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(item)}
                    className="p-2 rounded-lg text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingItem ? 'Edit Media Video' : 'Add New Media Video'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Kingsol Solar EPC Workflows"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={form.youtube_url}
                  onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Auto-Generated Thumbnail URL
                </label>
                <input
                  type="text"
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  placeholder="Auto-extracted from YouTube URL"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                />
                {form.thumbnail_url && (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 mt-2">
                    <img
                      src={form.thumbnail_url.startsWith('/uploads') ? getAssetUrl(form.thumbnail_url) : form.thumbnail_url}
                      alt="Thumbnail Preview"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = 'https://placehold.co/600x400/0f172a/ffffff?text=Video+Thumbnail';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary of the video presentation..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-5 h-5 accent-brand-green rounded cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800">Active (Visible Publicly)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md"
                >
                  {editingItem ? 'Update Video' : 'Save Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default MediaManager;