import { getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

export const GalleryManager: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [form, setForm] = useState({
    title: '',
    image_url: '',
    category: 'Projects',
    is_active: true,
    sort_order: 0,
  });

  const defaultCategories = ['Projects', 'Engineering', 'Events'];
  const existingCategories = Array.from(
    new Set([...defaultCategories, ...items.map((i) => i.category).filter(Boolean)])
  );

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery/all');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item);
      const cat = item.category || 'Projects';
      const isCustom = !existingCategories.includes(cat);
      setIsCreatingNewCategory(isCustom);
      setCustomCategory(isCustom ? cat : '');
      setForm({
        title: item.title,
        image_url: item.image_url,
        category: cat,
        is_active: item.is_active,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingItem(null);
      setIsCreatingNewCategory(false);
      setCustomCategory('');
      setForm({
        title: '',
        image_url: '',
        category: existingCategories[0] || 'Projects',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setForm((prev) => ({ ...prev, image_url: res.data.url }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/gallery/${editingItem.id}`, form);
      } else {
        await api.post('/gallery', form);
      }
      handleCloseModal();
      fetchItems();
    } catch (err) {
      console.error('Error saving gallery item:', err);
      alert('Failed to save gallery item.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      fetchItems();
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      alert('Failed to delete item.');
    }
  };

  const handleToggleActive = async (item: GalleryItem) => {
    try {
      await api.put(`/gallery/${item.id}`, {
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
            <ImageIcon className="w-7 h-7 text-brand-green" />
            <span>Gallery Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage public project photos, events, and technical gallery images.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-brand-green hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Gallery Image</span>
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium">Loading gallery items...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200">
          No gallery images found. Click "Add Gallery Image" above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                  <img
                    src={getAssetUrl(item.image_url)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleToggleActive(item)}
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                      item.is_active
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700/80 text-slate-200'
                    }`}
                  >
                    {item.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{item.is_active ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">{item.title}</h3>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Order: #{item.sort_order}</span>
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
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-slate-100 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 500kW Rooftop Solar Installation"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category *
                </label>
                <select
                  value={isCreatingNewCategory ? '__new__' : form.category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__new__') {
                      setIsCreatingNewCategory(true);
                      setCustomCategory('');
                      setForm((prev) => ({ ...prev, category: '' }));
                    } else {
                      setIsCreatingNewCategory(false);
                      setForm((prev) => ({ ...prev, category: val }));
                    }
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none mb-2 font-medium"
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__">+ Create New Category...</option>
                </select>

                {isCreatingNewCategory && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      setForm((prev) => ({ ...prev, category: e.target.value }));
                    }}
                    placeholder="Enter new category name..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-brand-green outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Image URL or Upload *
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-brand-green outline-none text-sm"
                  />
                  <label className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 cursor-pointer transition-colors shrink-0">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {form.image_url && (
                  <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                    <img src={getAssetUrl(form.image_url)} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
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
                  {editingItem ? 'Update Image' : 'Save Image'}
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

export default GalleryManager;
