import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { getAssetUrl, parseDatasheets } from '../utils/assetUrl';
import ImageCropperModal from '../components/ImageCropperModal';
import {
  Zap,
  Plus,
  Edit,
  Trash2,
  Upload,
  Crop,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  AlertTriangle,
  ImageIcon,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
}

interface Brand {
  id: number;
  category_id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  category_id: number;
  brand_id: number;
  name: string;
  slug: string;
}

interface BrandDoc {
  title: string;
  url: string;
}

interface BessItem {
  id: number;
  category_id: number;
  brand_id: number;
  subcategory_id?: number;
  title: string;
  name?: string;
  slug: string;
  description: string;
  short_description?: string;
  long_description?: string;
  image_url: string;
  card_image?: string;
  category_banner_image?: string;
  datasheet_url: string;
  expertise?: string;
  phase_type?: string;
  gallery?: string[];
  key_features?: string[];
  documents?: BrandDoc[];
  specs?: Record<string, string>;
  is_featured?: boolean;
  brand_name?: string;
  brand_slug?: string;
  category_name?: string;
  category_slug?: string;
  subcategory_name?: string;
  subcategory_slug?: string;
}

export const BessManager: React.FC = () => {
  const [bessItems, setBessItems] = useState<BessItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'media' | 'features' | 'docs'>('basic');
  const [editingItem, setEditingItem] = useState<BessItem | null>(null);
  const [deletingItemTarget, setDeletingItemTarget] = useState<BessItem | null>(null);

  // Form State
  const [form, setForm] = useState({
    category_id: '',
    brand_id: '',
    subcategory_id: '',
    new_category_name: '',
    is_creating_new_subcategory: false,
    new_phase_type: '',
    is_creating_new_phase_type: false,
    title: '',
    slug: '',
    description: '',
    long_description: '',
    image_url: '',
    card_image: '',
    category_banner_image: '',
    gallery_urls: ['', '', '', ''] as string[],
    datasheet_url: '',
    expertise: '',
    is_featured: false,
    key_features: [''],
    documents: [] as { title: string; url: string }[],
    specsJson: '{\n  "capacity": "100kWh",\n  "power": "50kW",\n  "battery_chemistry": "LiFePO4",\n  "cycle_life": "6000+ Cycles",\n  "protection": "IP55 / IP65 Rated",\n  "warranty": "10 Years"\n}',
  });

  // Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperTargetKey, setCropperTargetKey] = useState<string>('');

  const slugify = (text: string) =>
    (text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bessRes, catRes, brandRes, subRes] = await Promise.all([
        api.get('/bess'),
        api.get('/categories'),
        api.get('/brands'),
        api.get('/subcategories'),
      ]);

      if (bessRes.data.success) setBessItems(bessRes.data.data || []);
      if (catRes.data.success) setCategories(catRes.data.data || []);
      if (brandRes.data.success) setBrands(brandRes.data.data || []);
      if (subRes.data.success) setSubcategories(subRes.data.data || []);
    } catch (err: any) {
      console.warn('BESS Manager data fetch notice:', err);
      setMessage({ type: 'error', text: 'Failed to load BESS data from server.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalTab('basic');

    // Find default BESS category if available
    const bessCat = categories.find((c) => c.slug === 'bess' || c.name.toLowerCase().includes('bess'));
    const defaultCatId = bessCat ? bessCat.id.toString() : categories[0]?.id?.toString() || '';
    const availableBrands = brands.filter((b) => !defaultCatId || b.category_id.toString() === defaultCatId);
    const defaultBrandId = availableBrands[0]?.id?.toString() || brands[0]?.id?.toString() || '';

    setForm({
      category_id: defaultCatId,
      brand_id: defaultBrandId,
      subcategory_id: '',
      new_category_name: '',
      is_creating_new_subcategory: false,
      new_phase_type: '',
      is_creating_new_phase_type: false,
      title: '',
      slug: '',
      description: '',
      long_description: '',
      image_url: '',
      card_image: '',
      category_banner_image: '',
      gallery_urls: ['', '', '', ''],
      datasheet_url: '',
      expertise: 'Commercial & Industrial Energy Storage System (LiFePO4)',
      is_featured: false,
      key_features: [
        'High-density LiFePO4 battery chemistry with integrated active BMS',
        'Sub-10ms UPS grade power transfer for uninterrupted facility uptime',
        'Built-in aerosol fire suppression and multi-level thermal runaway safeguards',
        'Modular scalable capacity from 50kWh up to Multi-MWh containerized solutions',
      ],
      documents: [{ title: 'BESS Technical Datasheet PDF', url: '' }],
      specsJson: '{\n  "capacity": "100kWh",\n  "power": "50kW",\n  "battery_chemistry": "LiFePO4",\n  "cycle_life": "6000+ Cycles",\n  "protection": "IP55 / IP65 Rated",\n  "warranty": "10 Years"\n}',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: BessItem) => {
    setEditingItem(item);
    setModalTab('basic');

    let parsedGallery = ['', '', '', ''];
    if (Array.isArray(item.gallery)) {
      parsedGallery = [
        item.gallery[0] || '',
        item.gallery[1] || '',
        item.gallery[2] || '',
        item.gallery[3] || '',
      ];
    } else if (item.image_url) {
      parsedGallery = [item.image_url, '', '', ''];
    }

    let parsedDocs = parseDatasheets(item.documents);
    if (parsedDocs.length === 0 && item.datasheet_url) {
      parsedDocs = [{ title: 'Technical Datasheet PDF', url: item.datasheet_url }];
    }

    let specsStr = '{\n  "capacity": "100kWh",\n  "power": "50kW",\n  "battery_chemistry": "LiFePO4",\n  "cycle_life": "6000+ Cycles",\n  "protection": "IP55 / IP65 Rated",\n  "warranty": "10 Years"\n}';
    if (item.specs && typeof item.specs === 'object') {
      specsStr = JSON.stringify(item.specs, null, 2);
    }

    setForm({
      category_id: item.category_id ? item.category_id.toString() : '',
      brand_id: item.brand_id ? item.brand_id.toString() : '',
      subcategory_id: item.subcategory_id ? item.subcategory_id.toString() : '',
      new_category_name: '',
      is_creating_new_subcategory: false,
      new_phase_type: '',
      is_creating_new_phase_type: false,
      title: item.title || item.name || '',
      slug: item.slug || '',
      description: item.description || item.short_description || '',
      long_description: item.long_description || '',
      image_url: item.image_url || '',
      card_image: item.card_image || '',
      category_banner_image: item.category_banner_image || '',
      gallery_urls: parsedGallery,
      datasheet_url: item.datasheet_url || '',
      expertise: item.phase_type || item.expertise || '',
      is_featured: Boolean(item.is_featured),
      key_features: Array.isArray(item.key_features) && item.key_features.length > 0 ? item.key_features : [''],
      documents: parsedDocs.length > 0 ? parsedDocs : [{ title: '', url: '' }],
      specsJson: specsStr,
    });
    setIsModalOpen(true);
  };

  // Image Upload helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success && res.data.data?.url) {
        const uploadedUrl = res.data.data.url;
        if (targetKey.startsWith('gallery_')) {
          const idx = parseInt(targetKey.replace('gallery_', ''), 10);
          setForm((prev) => {
            const nextGallery = [...prev.gallery_urls];
            nextGallery[idx] = uploadedUrl;
            return {
              ...prev,
              gallery_urls: nextGallery,
              image_url: idx === 0 ? uploadedUrl : prev.image_url || uploadedUrl,
            };
          });
        } else {
          setForm((prev) => ({ ...prev, [targetKey]: uploadedUrl }));
        }
        setMessage({ type: 'success', text: 'Image uploaded successfully.' });
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setMessage({ type: 'error', text: 'Image upload failed. Please try again.' });
    }
  };

  // Save BESS Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand_id || !form.title.trim()) {
      setMessage({ type: 'error', text: 'Brand and Title are required fields.' });
      return;
    }

    let parsedSpecs: Record<string, string> = {};
    try {
      if (form.specsJson.trim()) {
        parsedSpecs = JSON.parse(form.specsJson);
      }
    } catch {
      setMessage({ type: 'error', text: 'Invalid JSON format in Technical Specifications.' });
      return;
    }

    let finalSubcategoryId: number | null = form.subcategory_id ? parseInt(form.subcategory_id) : null;
    if (form.is_creating_new_subcategory && form.new_category_name.trim()) {
      try {
        const newSubName = form.new_category_name.trim();
        const subRes = await api.post('/subcategories', {
          category_id: parseInt(form.category_id),
          brand_id: parseInt(form.brand_id),
          name: newSubName,
          slug: slugify(newSubName),
        });
        if (subRes.data.success && subRes.data.data) {
          finalSubcategoryId = subRes.data.data.id;
        }
      } catch (e) {
        console.warn('Subcategory creation notice:', e);
      }
    }

    const finalPhaseType =
      form.is_creating_new_phase_type && form.new_phase_type.trim()
        ? form.new_phase_type.trim()
        : form.expertise;

    const cleanKeyFeatures = form.key_features.filter((f) => f.trim() !== '');
    const cleanDocs = form.documents.filter((d) => d.title.trim() !== '' || d.url.trim() !== '');
    const primaryDatasheet = cleanDocs.find((d) => d.url.trim() !== '')?.url || form.datasheet_url;

    const cleanGallery = form.gallery_urls.map((u) => u.trim()).filter(Boolean);
    if (cleanGallery.length === 0 && form.image_url.trim()) {
      cleanGallery.push(form.image_url.trim());
    }
    const primaryImage = cleanGallery[0] || form.image_url;

    const payload = {
      category_id: form.category_id ? parseInt(form.category_id) : null,
      brand_id: parseInt(form.brand_id),
      subcategory_id: finalSubcategoryId,
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      description: form.description.trim(),
      short_description: form.description.trim(),
      long_description: '',
      image_url: primaryImage,
      card_image: form.card_image || '',
      category_banner_image: form.category_banner_image || '',
      datasheet_url: primaryDatasheet,
      expertise: finalPhaseType,
      phase_type: finalPhaseType,
      is_featured: form.is_featured,
      gallery: cleanGallery,
      key_features: cleanKeyFeatures,
      documents: cleanDocs,
      datasheets: cleanDocs,
      specs: parsedSpecs,
    };

    try {
      if (editingItem) {
        await api.put(`/bess/${editingItem.id}`, payload);
        setMessage({ type: 'success', text: `BESS Item '${form.title}' updated successfully.` });
      } else {
        await api.post('/bess', payload);
        setMessage({ type: 'success', text: `BESS Item '${form.title}' created successfully.` });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Save BESS item error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save BESS item.' });
    }
  };

  // Delete BESS Item
  const handleDeleteItem = async () => {
    if (!deletingItemTarget) return;
    try {
      await api.delete(`/bess/${deletingItemTarget.id}`);
      setMessage({ type: 'success', text: `BESS Item '${deletingItemTarget.title}' deleted.` });
      setDeletingItemTarget(null);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete BESS item.' });
    }
  };

  const filteredItems = bessItems.filter((item) => {
    const matchesSearch =
      (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subcategory_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand =
      selectedBrand === 'All' ||
      item.brand_slug === selectedBrand ||
      item.brand_name === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-poppins">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-green to-emerald-500 flex items-center justify-center text-white shadow-md">
                  <Zap className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">BESS Management</h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Manage Battery Energy Storage Systems (BESS), series, technical specs, and datasheets.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add BESS Product</span>
            </button>
          </div>

          {/* Notification Message */}
          {message && (
            <div
              className={`p-4 rounded-xl flex items-center justify-between ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search BESS products, brands, or series..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Filter Brand:
              </span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green font-medium text-slate-700"
              >
                <option value="All">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug || b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 font-medium">Loading BESS items...</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center">
                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
                <h3 className="text-base font-bold text-slate-800">No BESS Products Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Get started by adding your first Battery Energy Storage System (BESS) item.
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="mt-4 inline-flex items-center gap-2 bg-brand-green hover:bg-emerald-600 text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create BESS Product</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Product & Series</th>
                      <th className="py-3.5 px-6">Brand</th>
                      <th className="py-3.5 px-6">System / Phase Type</th>
                      <th className="py-3.5 px-6">Capacity & Specs</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image_url || (item.gallery && item.gallery[0]) ? (
                                <img
                                  src={getAssetUrl(item.image_url || (item.gallery && item.gallery[0]) || '')}
                                  alt={item.title}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <Zap className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">{item.title || item.name}</span>
                              <span className="text-xs text-slate-500 font-medium block truncate">
                                {item.subcategory_name || 'BESS Cabinet'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-brand-green/10 text-brand-green text-xs font-bold rounded-lg uppercase tracking-wider">
                            {item.brand_name || 'Generic'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                            {item.phase_type || item.expertise || 'C&I Storage'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 font-mono">
                          {item.specs && typeof item.specs === 'object' ? (
                            <span className="truncate block max-w-xs">
                              {Object.entries(item.specs)
                                .slice(0, 2)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(' | ')}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No specs listed</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 text-slate-600 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit BESS Item"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingItemTarget(item)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete BESS Item"
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
        </div>
      </main>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingItem ? `Edit: ${editingItem.title || editingItem.name}` : 'New BESS Product'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure BESS specifications, images, and datasheets.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-6 gap-6 bg-white text-xs font-bold uppercase tracking-wider">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'basic' ? 'border-brand-green text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Basic Info & Specs
              </button>
              <button
                type="button"
                onClick={() => setModalTab('media')}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'media' ? 'border-brand-green text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Media & Gallery (4 Slots)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('features')}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'features' ? 'border-brand-green text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Key Features (Bullet Points)
              </button>
              <button
                type="button"
                onClick={() => setModalTab('docs')}
                className={`py-3.5 border-b-2 transition-colors cursor-pointer ${
                  modalTab === 'docs' ? 'border-brand-green text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Datasheets & Documents
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveItem} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* TAB 1: BASIC INFO */}
              {modalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Brand *
                      </label>
                      <select
                        value={form.brand_id}
                        onChange={(e) => {
                          const bId = e.target.value;
                          const selectedB = brands.find((b) => b.id.toString() === bId);
                          setForm((prev) => ({
                            ...prev,
                            brand_id: bId,
                            category_id: selectedB?.category_id?.toString() || prev.category_id,
                            subcategory_id: '',
                          }));
                        }}
                        required
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                      >
                        <option value="">Select Brand</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Series / Subcategory
                      </label>
                      {!form.is_creating_new_subcategory ? (
                        <div className="flex gap-2">
                          <select
                            value={form.subcategory_id}
                            onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                          >
                            <option value="">Select Existing Series</option>
                            {subcategories
                              .filter((s) => !form.brand_id || s.brand_id?.toString() === form.brand_id)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, is_creating_new_subcategory: true })}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer"
                          >
                            + New
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.new_category_name}
                            onChange={(e) => setForm({ ...form, new_category_name: e.target.value })}
                            placeholder="e.g. C&I Energy Storage Cabinets"
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                          />
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, is_creating_new_subcategory: false, new_category_name: '' })}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      BESS Product Title *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value, slug: slugify(e.target.value) })}
                      placeholder="e.g. Kingsol 100kWh All-In-One C&I Storage Cabinet"
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                        placeholder="kingsol-100kwh-storage"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        System / Phase Type
                      </label>
                      <input
                        type="text"
                        value={form.expertise}
                        onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                        placeholder="e.g. C&I 100kW/215kWh, Three-Phase 400V"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Compact high-density LiFePO4 energy storage cabinet designed for peak shaving, backup power, and EV charging support."
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                    />
                  </div>

                  {/* Technical Specs JSON */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Technical Specs (JSON)
                    </label>
                    <textarea
                      rows={6}
                      value={form.specsJson}
                      onChange={(e) => setForm({ ...form, specsJson: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: MEDIA & GALLERY */}
              {modalTab === 'media' && (
                <div className="space-y-6">
                  {/* Category Banner */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Upload BESS Category Banner (Optional Editorial Banner)
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={form.category_banner_image}
                        onChange={(e) => setForm({ ...form, category_banner_image: e.target.value })}
                        placeholder="https://... or /uploads/bess_banner.jpg"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                      <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'category_banner_image')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* 4 Image Gallery Slots */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Interactive 4-Image Product Carousel Slots
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[0, 1, 2, 3].map((slotIdx) => (
                        <div key={slotIdx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-600">Image Slot {slotIdx + 1} {slotIdx === 0 && '(Primary)'}</span>
                            {form.gallery_urls[slotIdx] && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCropperImageSrc(getAssetUrl(form.gallery_urls[slotIdx]));
                                  setCropperTargetKey(`gallery_${slotIdx}`);
                                  setCropperOpen(true);
                                }}
                                className="text-xs text-brand-blue font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Crop className="w-3.5 h-3.5" />
                                <span>Crop</span>
                              </button>
                            )}
                          </div>

                          <div className="h-28 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                            {form.gallery_urls[slotIdx] ? (
                              <img
                                src={getAssetUrl(form.gallery_urls[slotIdx])}
                                alt={`Slot ${slotIdx + 1}`}
                                className="w-full h-full object-contain p-2"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={form.gallery_urls[slotIdx]}
                              onChange={(e) => {
                                const val = e.target.value;
                                setForm((prev) => {
                                  const nextG = [...prev.gallery_urls];
                                  nextG[slotIdx] = val;
                                  return { ...prev, gallery_urls: nextG, image_url: slotIdx === 0 ? val : prev.image_url };
                                });
                              }}
                              placeholder={`URL for slot ${slotIdx + 1}`}
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                            />
                            <label className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors flex items-center gap-1">
                              <Upload className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, `gallery_${slotIdx}`)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KEY FEATURES */}
              {modalTab === 'features' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Product Key Features</h4>
                      <p className="text-xs text-slate-500">Add key technical highlights displayed as green checkmarks on product cards.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, key_features: [...form.key_features, ''] })}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Bullet</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.key_features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => {
                              const nextF = [...prev.key_features];
                              nextF[fIdx] = val;
                              return { ...prev, key_features: nextF };
                            });
                          }}
                          placeholder={`Feature ${fIdx + 1}`}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        />
                        {form.key_features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({
                                ...prev,
                                key_features: prev.key_features.filter((_, idx) => idx !== fIdx),
                              }));
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DATASHEETS */}
              {modalTab === 'docs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Downloadable Datasheet PDFs</h4>
                      <p className="text-xs text-slate-500">Provide official compliance, spec sheets, and installation manuals.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, documents: [...form.documents, { title: '', url: '' }] })}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Datasheet</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.documents.map((doc, dIdx) => (
                      <div key={dIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-2 items-center">
                        <input
                          type="text"
                          value={doc.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => {
                              const nextD = [...prev.documents];
                              nextD[dIdx] = { ...nextD[dIdx], title: val };
                              return { ...prev, documents: nextD };
                            });
                          }}
                          placeholder="Datasheet Title (e.g. Technical Specs PDF)"
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-full sm:w-auto"
                        />
                        <input
                          type="text"
                          value={doc.url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm((prev) => {
                              const nextD = [...prev.documents];
                              nextD[dIdx] = { ...nextD[dIdx], url: val };
                              return { ...prev, documents: nextD };
                            });
                          }}
                          placeholder="/datasheets/bess-spec.pdf or https://..."
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-green/20 w-full sm:w-auto font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              documents: prev.documents.filter((_, idx) => idx !== dIdx),
                            }));
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-green hover:bg-emerald-600 text-slate-900 rounded-xl text-xs font-extrabold transition-colors cursor-pointer shadow-xs"
                >
                  {editingItem ? 'Update BESS Product' : 'Create BESS Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingItemTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Delete BESS Product?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">'{deletingItemTarget.title}'</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingItemTarget(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          freeCrop={true}
          onClose={() => {
            setCropperOpen(false);
            setCropperImageSrc(null);
          }}
          onCropComplete={async (croppedFile: File) => {
            const formData = new FormData();
            formData.append('image', croppedFile);
            try {
              const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
              });
              if (res.data.success && res.data.data?.url) {
                const url = res.data.data.url;
                if (cropperTargetKey.startsWith('gallery_')) {
                  const idx = parseInt(cropperTargetKey.replace('gallery_', ''), 10);
                  setForm((prev) => {
                    const nextG = [...prev.gallery_urls];
                    nextG[idx] = url;
                    return { ...prev, gallery_urls: nextG, image_url: idx === 0 ? url : prev.image_url };
                  });
                } else {
                  setForm((prev) => ({ ...prev, [cropperTargetKey]: url }));
                }
              }
            } catch (e) {
              console.error('Cropped image upload failed:', e);
            }
            setCropperOpen(false);
            setCropperImageSrc(null);
          }}
        />
      )}
    </div>
  );
};

export default BessManager;
