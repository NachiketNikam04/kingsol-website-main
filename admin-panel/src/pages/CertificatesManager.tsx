import { getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';

export interface CertificateItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  sort_order: number;
  created_at?: string;
}

export const CertificatesManager: React.FC = () => {
  const [items, setItems] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CertificateItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    sort_order: 0,
  });

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/certificates');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setMessage({ type: 'error', text: 'Failed to load certificates.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenModal = (item?: CertificateItem) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title,
        description: item.description || '',
        image_url: item.image_url,
        sort_order: item.sort_order || 0,
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        description: '',
        image_url: '',
        sort_order: items.length > 0 ? Math.max(...items.map((i) => i.sort_order || 0)) + 1 : 1,
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
      if (res.data.success && res.data.fileUrl) {
        setForm((prev) => ({ ...prev, image_url: res.data.fileUrl }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.image_url.trim()) {
      alert('Title and certificate image are required.');
      return;
    }

    try {
      if (editingItem) {
        await api.put(`/certificates/${editingItem.id}`, form);
        setMessage({ type: 'success', text: 'Certificate updated successfully!' });
      } else {
        await api.post('/certificates', form);
        setMessage({ type: 'success', text: 'Certificate added successfully!' });
      }
      handleCloseModal();
      fetchItems();
    } catch (err) {
      console.error('Error saving certificate:', err);
      setMessage({ type: 'error', text: 'Failed to save certificate.' });
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the certificate "${title}"?`)) {
      return;
    }

    try {
      await api.delete(`/certificates/${id}`);
      setMessage({ type: 'success', text: 'Certificate deleted successfully.' });
      fetchItems();
    } catch (err) {
      console.error('Error deleting certificate:', err);
      setMessage({ type: 'error', text: 'Failed to delete certificate.' });
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-brand-green" />
              <h1 className="text-xl font-bold text-slate-900 font-poppins">Certificates & Accreditations</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage ISO, ALMM, BIS, and compliance certificates displayed on the public site.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-green text-slate-900 rounded-xl font-semibold text-xs hover:bg-[#8ee036] transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Certificate</span>
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex items-center gap-4 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search certificates by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-brand-green"
              />
            </div>
            <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
                <span>Loading certificates...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p>No certificates found.</p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-3 text-xs text-brand-green font-semibold hover:underline cursor-pointer"
                >
                  + Add the first certificate
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">Preview</th>
                    <th className="py-3.5 px-6">Title & Description</th>
                    <th className="py-3.5 px-6">Order</th>
                    <th className="py-3.5 px-6">Created At</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <img
                            src={getAssetUrl(item.image_url)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <div className="font-bold text-slate-900">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                          {item.sort_order}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 font-poppins">
                {editingItem ? 'Edit Certificate' : 'Add New Certificate'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certificate Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISO 9001:2015 Quality Management System"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Accrediting Body
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Certified for international manufacturing, quality assurance, and high reliability standards."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-green resize-none"
                />
              </div>

              {/* Certificate Image Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Certificate Document / Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 mb-2">
                  <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="or paste direct image URL (https://...)"
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-green"
                  />
                </div>

                {form.image_url && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                      <img
                        src={getAssetUrl(form.image_url)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs text-slate-600 truncate flex-1">
                      <p className="font-semibold text-slate-800">Preview Ready</p>
                      <p className="text-[11px] text-slate-400 truncate">{form.image_url}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:border-brand-green"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-green text-slate-900 rounded-xl text-xs font-semibold hover:bg-[#8ee036] transition-colors shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Create Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesManager;
