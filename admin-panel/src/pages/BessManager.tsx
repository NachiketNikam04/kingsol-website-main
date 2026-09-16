import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { getAssetUrl } from '../utils/assetUrl';
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
  FileText,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

const PRODUCT_CARD_TARGET_WIDTH = 800;
const PRODUCT_CARD_TARGET_HEIGHT = 600;

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

const initialBessForm = {
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
  specsJson: '{\n  "capacity": "100kWh",\n  "rated_power": "50kW",\n  "battery_chemistry": "LiFePO4",\n  "cycle_life": "6000+ Cycles",\n  "protection": "IP55 / IP65 Rated",\n  "warranty": "10 Years"\n}',
};

export const BessManager: React.FC = () => {
  const [bessItems, setBessItems] = useState<BessItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'basic' | 'media' | 'features' | 'docs'>('basic');
  const [editingItem, setEditingItem] = useState<BessItem | null>(null);
  const [deletingItemTarget, setDeletingItemTarget] = useState<BessItem | null>(null);

  // Form State
  const [form, setForm] = useState(initialBessForm);

  // Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperTarget, setCropperTarget] = useState<string | null>(null);
  const [cropperDimensions, setCropperDimensions] = useState({ width: 800, height: 600 });
  const [cropperFreeCrop, setCropperFreeCrop] = useState(true);
  const [cropperTitle, setCropperTitle] = useState('Crop Image');

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

  // Image crop selection trigger
  const handleImageCropSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: string,
    dimensions = { width: 800, height: 600 },
    title = 'Crop Image',
    freeCrop = true
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result as string);
      setCropperTarget(targetField);
      setCropperDimensions(dimensions);
      setCropperTitle(title);
      setCropperFreeCrop(freeCrop);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload cropped PNG file and save URL to form state
  const handleCropComplete = async (croppedFile: File) => {
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', croppedFile);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        if (cropperTarget === 'bess.card_image') {
          setForm((prev) => ({ ...prev, card_image: fileUrl }));
        } else if (cropperTarget?.startsWith('bess.gallery_')) {
          const slotIdx = parseInt(cropperTarget.replace('bess.gallery_', ''), 10);
          setForm((prev) => {
            const updated = [...prev.gallery_urls];
            updated[slotIdx] = fileUrl;
            return {
              ...prev,
              gallery_urls: updated,
              image_url: slotIdx === 0 ? fileUrl : (prev.image_url || fileUrl),
            };
          });
        }
        setMessage({ type: 'success', text: 'Image cropped and uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to upload cropped image.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error uploading cropped image to server.' });
    } finally {
      setUploading(false);
      setCropperOpen(false);
      setCropperImageSrc(null);
      setCropperTarget(null);
    }
  };

  // Standard File Upload helper (for Category Banner & PDFs)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
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
        onSuccess(res.data.fileUrl || res.data.url);
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to upload file.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server error during upload.' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setModalTab('basic');

    const bessCat = categories.find(
      (c) =>
        c.slug?.toLowerCase() === 'bess' ||
        c.name?.toLowerCase() === 'bess' ||
        c.name?.toLowerCase().includes('battery')
    );
    const defaultCatId = bessCat
      ? bessCat.id.toString()
      : categories[0]?.id
      ? categories[0].id.toString()
      : '';

    setForm({
      ...initialBessForm,
      category_id: defaultCatId,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: BessItem) => {
    setEditingItem(item);
    setModalTab('basic');

    const heroImg = item.image_url || '';
    const existingGallery =
      item.gallery && Array.isArray(item.gallery) && item.gallery.length > 0
        ? item.gallery
        : [heroImg].filter(Boolean);

    const gallery_urls = [
      existingGallery[0] || '',
      existingGallery[1] || '',
      existingGallery[2] || '',
      existingGallery[3] || '',
    ];

    let parsedDocs: { title: string; url: string }[] = [];
    if (Array.isArray(item.documents) && item.documents.length > 0) {
      parsedDocs = item.documents
        .filter((d: any) => d && (d.url || typeof d === 'string'))
        .map((d: any) => ({
          title: typeof d === 'string' ? 'Technical Datasheet' : d.title || 'Technical Datasheet',
          url: typeof d === 'string' ? d : d.url || '',
        }))
        .filter((d) => d.url.trim() !== '');
    } else if (item.datasheet_url && item.datasheet_url.trim() !== '') {
      parsedDocs = [{ title: 'Technical Datasheet', url: item.datasheet_url.trim() }];
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
      long_description: item.long_description || item.description || '',
      image_url: heroImg,
      card_image: item.card_image || '',
      category_banner_image: item.category_banner_image || '',
      gallery_urls,
      datasheet_url: parsedDocs[0]?.url || item.datasheet_url || '',
      expertise: item.phase_type || item.expertise || '',
      is_featured: Boolean(item.is_featured),
      key_features:
        item.key_features && item.key_features.length > 0
          ? item.key_features.slice(0, 12)
          : [''],
      documents: parsedDocs,
      specsJson: JSON.stringify(item.specs || {}, null, 2),
    });
    setIsModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedSpecs = {};
      try {
        parsedSpecs = JSON.parse(form.specsJson);
      } catch {
        alert('Invalid JSON format for Technical Specs.');
        return;
      }

      let finalSubcategoryId = form.subcategory_id ? parseInt(form.subcategory_id) : null;

      // Handle "Create New Category" on the fly
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

      const cleanKeyFeatures = form.key_features.filter((f) => f.trim() !== '').slice(0, 12);
      const cleanDocs = form.documents.filter((d) => d.title.trim() !== '' || d.url.trim() !== '');
      const primaryDatasheet = cleanDocs.find((d) => d.url.trim() !== '')?.url || '';

      const cleanGallery = form.gallery_urls.map((u) => u.trim()).filter(Boolean).slice(0, 4);
      if (cleanGallery.length === 0 && form.image_url.trim()) {
        cleanGallery.push(form.image_url.trim());
      }
      const primaryImage = cleanGallery[0] || form.image_url;

      const payload = {
        category_id: parseInt(form.category_id),
        brand_id: parseInt(form.brand_id),
        subcategory_id: finalSubcategoryId,
        title: form.title,
        slug: slugify(form.slug || form.title),
        description: form.description,
        short_description: form.description,
        long_description: form.long_description || form.description,
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

      if (editingItem) {
        await api.put(`/bess/${editingItem.id}`, payload);
        setMessage({ type: 'success', text: `BESS Product '${form.title}' updated successfully.` });
      } else {
        await api.post('/bess', payload);
        setMessage({ type: 'success', text: `BESS Product '${form.title}' created successfully.` });
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving BESS item:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save BESS product details.',
      });
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItemTarget) return;
    try {
      await api.delete(`/bess/${deletingItemTarget.id}`);
      setMessage({
        type: 'success',
        text: `BESS item '${deletingItemTarget.title || deletingItemTarget.name}' deleted.`,
      });
      setDeletingItemTarget(null);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting BESS item:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete BESS item.',
      });
    }
  };

  // Filter available brands based on selected category in form
  const availableBrandsForForm = form.category_id
    ? brands.filter((b) => b.category_id.toString() === form.category_id)
    : brands;

  // Filtered table items
  const filteredItems = bessItems.filter((item) => {
    const matchesSearch =
      (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subcategory_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.expertise || item.phase_type || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.category_id.toString() === selectedCategory ||
      item.category_name === selectedCategory;

    const matchesBrand =
      selectedBrand === 'All' ||
      item.brand_id.toString() === selectedBrand ||
      item.brand_name === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="flex h-screen bg-brand-bg text-slate-900 font-poppins">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-brand-green" />
                BESS Management
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                Manage Battery Energy Storage Systems (BESS), C&I Storage Cabinets, and Containerized Systems.
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 bg-brand-green hover:bg-emerald-600 text-slate-900 px-5 py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add BESS Product</span>
            </button>
          </div>

          {/* Feedback Message */}
          {message && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search BESS products, brands, or series..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none cursor-pointer"
              >
                <option value="All">All Brands</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id.toString()}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading BESS catalog...</div>
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
                <table className="w-full text-left border-collapse text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product Title</th>
                      <th className="px-6 py-4">Brand / Category</th>
                      <th className="px-6 py-4">System / Phase Type</th>
                      <th className="px-6 py-4">2-Image Layout</th>
                      <th className="px-6 py-4">Docs</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {item.image_url || (item.gallery && item.gallery[0]) ? (
                                <img
                                  src={getAssetUrl(item.image_url || (item.gallery && item.gallery[0]) || '')}
                                  alt={item.title}
                                  className="w-full h-full object-contain p-0.5"
                                />
                              ) : (
                                <Zap className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate">
                                {item.title || item.name}
                              </span>
                              <span className="text-xs text-slate-500 font-normal block truncate">
                                {item.subcategory_name || 'BESS Series'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="font-bold text-slate-900 block">{item.brand_name || 'Generic'}</span>
                          <span className="text-slate-500">{item.category_name || 'BESS'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold inline-block">
                            {item.phase_type || item.expertise || 'C&I Storage'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded font-semibold mr-2">
                            Hero Img
                          </span>
                          <span className="px-2 py-0.5 bg-brand-green/20 text-slate-900 rounded font-semibold">
                            {item.gallery && item.gallery[0] ? 'Content Img' : 'No Content Img'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                            {item.documents?.length || 0} PDFs
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit BESS Product"
                            >
                              <Edit className="w-4 h-4 text-brand-blue" />
                            </button>
                            <button
                              onClick={() => setDeletingItemTarget(item)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete BESS Product"
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

        {/* MODAL: ADD / EDIT BESS PRODUCT (1-to-1 Match with Inverter Manager) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-auto flex flex-col max-h-[90vh] text-slate-900">
              {/* Fixed Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingItem ? `Edit BESS: ${editingItem.title}` : 'Add New BESS Component'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Clean 2-Image Layout CMS: Hero Cover Image + Story Content Image.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Internal Tabs (Fixed) */}
              <div className="px-6 pt-4 shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
                  <button
                    type="button"
                    onClick={() => setModalTab('basic')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      modalTab === 'basic'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 1. Basic Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('media')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      modalTab === 'media'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> 2. Media (Up to 4 Images)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('features')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      modalTab === 'features'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 3. Features & Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('docs')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      modalTab === 'docs'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 4. Documents (PDFs)
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveItem} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Form Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* TAB 1: BASIC INFO */}
                  {modalTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Category
                          </label>
                          <select
                            required
                            value={form.category_id}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                category_id: e.target.value,
                                brand_id: '',
                                subcategory_id: '',
                              })
                            }
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Brand Showcase
                          </label>
                          <select
                            required
                            value={form.brand_id}
                            onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Brand</option>
                            {availableBrandsForForm.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            BESS Type / Category
                          </label>
                          <select
                            value={
                              form.is_creating_new_subcategory ? 'create_new' : form.subcategory_id
                            }
                            onChange={(e) => {
                              if (e.target.value === 'create_new') {
                                setForm({
                                  ...form,
                                  is_creating_new_subcategory: true,
                                  subcategory_id: '',
                                });
                              } else {
                                setForm({
                                  ...form,
                                  is_creating_new_subcategory: false,
                                  subcategory_id: e.target.value,
                                });
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Category / Series (Default)</option>
                            {(() => {
                              const rawSubcats = subcategories.filter(
                                (s) =>
                                  (!form.category_id || s.category_id.toString() === form.category_id) &&
                                  (!form.brand_id || s.brand_id.toString() === form.brand_id)
                              );

                              // Strictly deduplicate by lowercase name
                              const uniqueMap = new Map<string, typeof subcategories[0]>();
                              rawSubcats.forEach((s) => {
                                const key = (s.name || s.slug || '').trim().toLowerCase();
                                if (key && !uniqueMap.has(key)) {
                                  uniqueMap.set(key, s);
                                }
                              });
                              const cleanSubcats = Array.from(uniqueMap.values());

                              if (cleanSubcats.length === 0) return null;

                              return (
                                <optgroup label="Existing Categories">
                                  {cleanSubcats.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>
                                      {s.name}
                                    </option>
                                  ))}
                                </optgroup>
                              );
                            })()}
                            <option value="create_new">+ Create New Category</option>
                          </select>

                          {form.is_creating_new_subcategory && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={form.new_category_name}
                                onChange={(e) =>
                                  setForm({ ...form, new_category_name: e.target.value })
                                }
                                className="w-full bg-white border border-brand-green rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                                placeholder="Type custom category name (e.g. C&I Storage Cabinets 100kWh)"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                          Product Title
                        </label>
                        <input
                          type="text"
                          required
                          value={form.title}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              title: e.target.value,
                              slug: slugify(e.target.value),
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Kingsol 100kWh All-In-One C&I Storage Cabinet"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            URL Slug
                          </label>
                          <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green font-mono"
                            placeholder="kingsol-100kwh-storage"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            Phase Type / System Type
                          </label>
                          <select
                            value={
                              form.is_creating_new_phase_type ? 'create_new' : form.expertise
                            }
                            onChange={(e) => {
                              if (e.target.value === 'create_new') {
                                setForm({
                                  ...form,
                                  is_creating_new_phase_type: true,
                                  expertise: '',
                                });
                              } else {
                                setForm({
                                  ...form,
                                  is_creating_new_phase_type: false,
                                  expertise: e.target.value,
                                });
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Phase Type / System Type</option>
                            <option value="Single Phase">Single Phase</option>
                            <option value="Three Phase">Three Phase</option>
                            <option value="Split Phase">Split Phase</option>
                            <option value="C&I Battery Storage">C&I Battery Storage</option>
                            <option value="Utility Container BESS">Utility Container BESS</option>
                            {Array.from(
                              new Set(
                                bessItems
                                  .map((p) => p.phase_type || p.expertise)
                                  .filter((s): s is string => Boolean(s))
                                  .map((s) => s.trim())
                                  .filter(
                                    (s) =>
                                      ![
                                        'Single Phase',
                                        'Three Phase',
                                        'Split Phase',
                                        'C&I Battery Storage',
                                        'Utility Container BESS',
                                      ].includes(s)
                                  )
                              )
                            ).map((pt, ptIdx) => (
                              <option key={ptIdx} value={pt}>
                                {pt}
                              </option>
                            ))}
                            <option value="create_new">+ Create New Phase Type</option>
                          </select>

                          {form.is_creating_new_phase_type && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={form.new_phase_type}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    new_phase_type: e.target.value,
                                    expertise: e.target.value,
                                  })
                                }
                                className="w-full bg-white border border-brand-green rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                                placeholder="Type custom phase/system type (e.g. Three-Phase 400V 50Hz)"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Upload Category Banner (Displays on Portfolio Page) */}
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">
                            Upload BESS Category Banner (Displays on Portfolio Page)
                          </label>
                          <span className="text-[11px] text-emerald-700 font-medium">
                            Split-layout hero image
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.category_banner_image || ''}
                            onChange={(e) =>
                              setForm({ ...form, category_banner_image: e.target.value })
                            }
                            className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="https://... or /uploads/bess_banner.jpg"
                          />
                          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                            <Upload className="w-4 h-4" />
                            <span>{uploading ? '...' : 'Upload Banner'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  setForm((prev) => ({ ...prev, category_banner_image: url }));
                                })
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {form.category_banner_image && (
                          <div className="mt-2 h-32 w-full rounded-xl overflow-hidden border border-emerald-200 bg-slate-900">
                            <img
                              src={getAssetUrl(form.category_banner_image)}
                              alt="Category Banner Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                          Short Description
                        </label>
                        <textarea
                          rows={2}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Short summary of the BESS storage system..."
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={form.is_featured}
                          onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                          className="w-5 h-5 accent-brand-green rounded cursor-pointer"
                        />
                        <label
                          htmlFor="is_featured"
                          className="text-sm font-semibold text-slate-800 cursor-pointer"
                        >
                          Feature on Homepage ("Products We Deliver" section)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: UP TO 4 GALLERY IMAGES */}
                  {modalTab === 'media' && (
                    <div className="space-y-4">
                      {/* Dedicated Card Image for BESS */}
                      <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-sky-950 uppercase tracking-wide">
                            Dedicated Card Thumbnail Image (Displays on Catalog Grid)
                          </label>
                          <span className="text-[11px] text-sky-700 font-semibold">
                            Catalog Grid View (800&times;600)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Upload a separate thumbnail card image to ensure consistent aspect ratio and alignment on the catalog grid. If empty, the grid will fallback to the Hero Cover Image.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={form.card_image || ''}
                            onChange={(e) => setForm({ ...form, card_image: e.target.value })}
                            className="flex-1 bg-white border border-sky-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="https://... or /uploads/bess_card.jpg"
                          />
                          <label className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                            <Crop className="w-4 h-4" />
                            <span>{uploading ? 'Processing...' : 'Upload & Crop Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageCropSelect(
                                  e,
                                  'bess.card_image',
                                  {
                                    width: PRODUCT_CARD_TARGET_WIDTH,
                                    height: PRODUCT_CARD_TARGET_HEIGHT,
                                  },
                                  'Crop BESS Card Thumbnail (800x600)'
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {form.card_image && (
                          <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs">
                            <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                              <img
                                src={getAssetUrl(form.card_image)}
                                alt="Card Image Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800 truncate">
                                  Cropped BESS Card
                                </span>
                                <span className="text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-md">
                                  800&times;600 PNG
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-2">
                                {form.card_image}
                              </p>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1 rounded-lg border border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                  <Crop className="w-3 h-3" />
                                  <span>Re-Crop New</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageCropSelect(
                                        e,
                                        'bess.card_image',
                                        {
                                          width: PRODUCT_CARD_TARGET_WIDTH,
                                          height: PRODUCT_CARD_TARGET_HEIGHT,
                                        },
                                        'Crop BESS Card Thumbnail (800x600)'
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setForm((prev) => ({ ...prev, card_image: '' }))}
                                  className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">
                          Product Image Gallery / Specifications (Up to 4 Images)
                        </label>
                        <span className="text-xs text-slate-400 font-semibold">Max 4 photos</span>
                      </div>

                      {[0, 1, 2, 3].map((imgIdx) => (
                        <div
                          key={imgIdx}
                          className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                              Image {imgIdx + 1}{' '}
                              {imgIdx === 0
                                ? '(Hero Cover Image / Primary View)'
                                : `(Gallery Angle View ${imgIdx + 1})`}
                            </label>
                            <span className="text-[11px] text-brand-green font-bold">
                              Freeform PNG
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={form.gallery_urls[imgIdx] || ''}
                              onChange={(e) => {
                                const updated = [...form.gallery_urls];
                                updated[imgIdx] = e.target.value;
                                setForm({
                                  ...form,
                                  gallery_urls: updated,
                                  image_url:
                                    imgIdx === 0 ? e.target.value : form.image_url || e.target.value,
                                });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                              placeholder={`https://... or upload/crop image ${imgIdx + 1}`}
                            />
                            <label className="bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                              <Crop className="w-4 h-4" />
                              <span>{uploading ? 'Processing...' : 'Upload & Crop (Freeform)'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageCropSelect(
                                    e,
                                    `bess.gallery_${imgIdx}`,
                                    { width: 800, height: 800 },
                                    `Crop BESS Image ${imgIdx + 1} (Freeform)`,
                                    true
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                          {form.gallery_urls[imgIdx] && (
                            <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                              <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-50 flex items-center justify-center">
                                <img
                                  src={getAssetUrl(form.gallery_urls[imgIdx])}
                                  alt={`Preview ${imgIdx + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    BESS View {imgIdx + 1}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                                    Freeform PNG
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mb-2">
                                  {form.gallery_urls[imgIdx]}
                                </p>
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                    <Crop className="w-3 h-3" />
                                    <span>Re-Crop New</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleImageCropSelect(
                                          e,
                                          `bess.gallery_${imgIdx}`,
                                          { width: 800, height: 800 },
                                          `Crop BESS Image ${imgIdx + 1} (Freeform)`,
                                          true
                                        )
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...form.gallery_urls];
                                      updated[imgIdx] = '';
                                      setForm((prev) => ({
                                        ...prev,
                                        gallery_urls: updated,
                                        image_url:
                                          imgIdx === 0
                                            ? updated.find(Boolean) || ''
                                            : prev.image_url,
                                      }));
                                    }}
                                    className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: FEATURES & SPECS */}
                  {modalTab === 'features' && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">
                            Key Features Bullet Points ({form.key_features.length}/12)
                          </label>
                          <button
                            type="button"
                            disabled={form.key_features.length >= 12}
                            onClick={() => {
                              if (form.key_features.length < 12) {
                                setForm({ ...form, key_features: [...form.key_features, ''] });
                              }
                            }}
                            className={`text-xs font-bold flex items-center gap-1 ${
                              form.key_features.length >= 12
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-brand-green hover:underline cursor-pointer'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Feature (Max 12)
                          </button>
                        </div>
                        <div className="space-y-2">
                          {form.key_features.map((feat, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => {
                                  const updated = [...form.key_features];
                                  updated[idx] = e.target.value;
                                  setForm({ ...form, key_features: updated });
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none"
                                placeholder={`Feature ${idx + 1}...`}
                              />
                              {form.key_features.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = form.key_features.filter((_, i) => i !== idx);
                                    setForm({ ...form, key_features: updated });
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                          Technical Specs (JSON Key-Value Pairs)
                        </label>
                        <textarea
                          rows={6}
                          value={form.specsJson}
                          onChange={(e) => setForm({ ...form, specsJson: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder='{\n  "capacity": "100kWh"\n}'
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DOCUMENTS (PDFs) */}
                  {modalTab === 'docs' && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block">
                              Downloadable Product Datasheets & Documents (PDFs)
                            </label>
                            <span className="text-xs text-slate-400">
                              Add technical datasheets, user manuals, and compliance documentation.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                documents: [...form.documents, { title: '', url: '' }],
                              })
                            }
                            className="text-xs font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Datasheet / Document
                          </button>
                        </div>

                        {form.documents.length === 0 ? (
                          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500 font-medium">
                              No datasheets added yet.
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setForm({
                                  ...form,
                                  documents: [{ title: '', url: '' }],
                                })
                              }
                              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                            >
                              + Add First Datasheet
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {form.documents.map((doc, idx) => (
                              <div
                                key={idx}
                                className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200"
                              >
                                <input
                                  type="text"
                                  value={doc.title}
                                  onChange={(e) => {
                                    const updated = [...form.documents];
                                    updated[idx].title = e.target.value;
                                    setForm({ ...form, documents: updated });
                                  }}
                                  className="md:col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                                  placeholder="Document Title (e.g. Technical Datasheet, User Manual)"
                                />
                                <input
                                  type="text"
                                  value={doc.url}
                                  onChange={(e) => {
                                    const updated = [...form.documents];
                                    updated[idx].url = e.target.value;
                                    setForm({
                                      ...form,
                                      documents: updated,
                                      datasheet_url: idx === 0 ? e.target.value : form.datasheet_url,
                                    });
                                  }}
                                  className="md:col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                                  placeholder="PDF URL (/uploads/... or https://...)"
                                />
                                <label className="md:col-span-1 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer flex items-center justify-center p-2 text-xs font-bold text-slate-700">
                                  <Upload className="w-3.5 h-3.5 text-brand-green" />
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) =>
                                      handleFileUpload(e, (url) => {
                                        const updated = [...form.documents];
                                        updated[idx].url = url;
                                        if (!updated[idx].title) {
                                          updated[idx].title = 'Technical Datasheet';
                                        }
                                        setForm({
                                          ...form,
                                          documents: updated,
                                          datasheet_url: idx === 0 ? url : form.datasheet_url,
                                        });
                                      })
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = form.documents.filter((_, i) => i !== idx);
                                    setForm({
                                      ...form,
                                      documents: updated,
                                      datasheet_url: updated[0]?.url || '',
                                    });
                                  }}
                                  className="md:col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer flex items-center justify-center"
                                  title="Delete this datasheet"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-green text-slate-900 font-bold text-xs rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETION CONFIRMATION MODAL */}
        {deletingItemTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Delete BESS Product?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete{' '}
                <strong className="text-slate-800">
                  {deletingItemTarget.title || deletingItemTarget.name}
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingItemTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteItem}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REUSABLE IMAGE CROPPER MODAL (FREEFORM OR EXACT TARGET DIMENSIONS & PNG TRANSPARENCY) */}
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          title={cropperTitle}
          targetWidth={cropperDimensions.width}
          targetHeight={cropperDimensions.height}
          freeCrop={cropperFreeCrop}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropperOpen(false);
            setCropperImageSrc(null);
            setCropperTarget(null);
          }}
        />
      </main>
    </div>
  );
};

export default BessManager;
