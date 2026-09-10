import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  AlertTriangle,
  Scissors,
} from 'lucide-react';

export interface HeroSlide {
  image: string;
  headline: string;
  highlightWord: string;
}

interface HeroSettings {
  id?: number;
  bg_image_url?: string;
  headline?: string;
  highlight_word?: string;
  subtitle: string;
  heroSlides: HeroSlide[];
}

interface TrustedBrand {
  id: number;
  name: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}

const defaultSlides: HeroSlide[] = [
  {
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=80',
    headline: 'Powering the future of the world',
    highlightWord: 'future',
  },
  {
    image: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?auto=format&fit=crop&w=2000&q=80',
    headline: 'Engineered for maximum Clean energy yield',
    highlightWord: 'Clean',
  },
  {
    image: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=2000&q=80',
    headline: 'Tier-1 Solar components distributed across India',
    highlightWord: 'Solar',
  },
];

// Utility to crop image canvas into Blob
const getCroppedImg = (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No 2D canvas context'));
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas is empty'));
        }
      }, 'image/png');
    };
    image.onerror = (err) => reject(err);
  });
};

export const HeroManager: React.FC = () => {
  const [settings, setSettings] = useState<HeroSettings>({
    subtitle: 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
    heroSlides: defaultSlides,
  });

  const [brands, setBrands] = useState<TrustedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Brand Modal States
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<TrustedBrand | null>(null);
  const [brandForm, setBrandForm] = useState({ name: '', image_url: '', is_active: true, sort_order: 0 });

  // Cropper Modal States
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<string>('slide_0');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploadingCropped, setUploadingCropped] = useState(false);

  const fetchHeroData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/home/hero/all');
      if (res.data.success) {
        const s = res.data.data.settings;
        const incomingSlides = (Array.isArray(s?.heroSlides) && s.heroSlides.length > 0)
          ? s.heroSlides
          : (Array.isArray(s?.hero_slides) && s.hero_slides.length > 0)
          ? s.hero_slides
          : defaultSlides;

        const fullSlides: HeroSlide[] = [0, 1, 2].map((idx) => ({
          image: incomingSlides[idx]?.image || incomingSlides[idx]?.bg_image_url || defaultSlides[idx].image,
          headline: incomingSlides[idx]?.headline || defaultSlides[idx].headline,
          highlightWord: incomingSlides[idx]?.highlightWord || incomingSlides[idx]?.highlight_word || defaultSlides[idx].highlightWord,
        }));

        setSettings({
          id: s?.id,
          subtitle: s?.subtitle || 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
          heroSlides: fullSlides,
        });
        setBrands(res.data.data.brands || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch hero section data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeroData();
  }, [fetchHeroData]);

  // Handle File Input Change -> Trigger Cropper Modal
  const onFileSelectForCrop = (e: React.ChangeEvent<HTMLInputElement>, target: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCropTarget(target);
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropperModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Process & Upload Cropped Image
  const applyCropAndUpload = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    setUploadingCropped(true);
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const formData = new FormData();
      formData.append('file', croppedBlob, `cropped_${Date.now()}.png`);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        if (cropTarget.startsWith('slide_')) {
          const slideIdx = parseInt(cropTarget.replace('slide_', ''), 10);
          setSettings((prev) => {
            const nextSlides = [...prev.heroSlides];
            nextSlides[slideIdx] = { ...nextSlides[slideIdx], image: fileUrl };
            return { ...prev, heroSlides: nextSlides };
          });
        } else {
          setBrandForm((prev) => ({ ...prev, image_url: fileUrl }));
        }
        setMessage({ type: 'success', text: 'Cropped image uploaded successfully!' });
      }
      setCropperModalOpen(false);
      setImageToCrop(null);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to process and upload cropped image.' });
    } finally {
      setUploadingCropped(false);
    }
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setSettings((prev) => {
      const nextSlides = [...prev.heroSlides];
      nextSlides[index] = { ...nextSlides[index], [field]: value };
      return { ...prev, heroSlides: nextSlides };
    });
  };

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/hero', {
        heroSlides: settings.heroSlides,
        subtitle: settings.subtitle,
      });
      setMessage({ type: 'success', text: 'Hero 3-slide carousel settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update hero settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Trusted Brand Submit & Delete
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBrand) {
        await api.put(`/home/hero/brands/${editingBrand.id}`, brandForm);
        setMessage({ type: 'success', text: `Trusted brand '${brandForm.name}' updated.` });
      } else {
        await api.post('/home/hero/brands', brandForm);
        setMessage({ type: 'success', text: `Trusted brand '${brandForm.name}' added.` });
      }
      setIsBrandModalOpen(false);
      fetchHeroData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save trusted brand.' });
    }
  };

  const handleBrandDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete trusted brand '${name}' from marquee?`)) return;
    try {
      await api.delete(`/home/hero/brands/${id}`);
      setMessage({ type: 'success', text: `Brand '${name}' deleted.` });
      fetchHeroData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete trusted brand.' });
    }
  };

  const activeBrandsCount = brands.filter((b) => b.is_active).length;

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
            <h1 className="text-3xl font-bold text-slate-900">Main Landing (Hero) Section</h1>
            <p className="text-slate-600 text-sm mt-1">
              Customize the background wallpaper, main headline, highlighted keyword, and marquee brand list.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading hero section configuration...</div>
        ) : (
          <div className="space-y-12 max-w-5xl">
            {/* SECTION 1: HERO CONTENT SETTINGS FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-slate-900 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-brand-green" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">1. Hero Carousel Slides Settings</h2>
                  <p className="text-xs text-slate-500">Configure background wallpapers, headlines, and highlighted keywords for up to 3 carousel slides.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* Repeating Slide Cards */}
                <div className="space-y-6">
                  {settings.heroSlides.map((slide, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative transition-all"
                    >
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-brand-blue/10 text-brand-blue font-black text-xs flex items-center justify-center">
                            0{index + 1}
                          </span>
                          <h3 className="text-base font-bold text-slate-900">Slide {index + 1}</h3>
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          {index === 0 ? 'Primary Default Slide' : `Carousel Slide ${index + 1}`}
                        </span>
                      </div>

                      <div className="space-y-4">
                        {/* Background Image Input */}
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                            Slide {index + 1} Background Image *
                          </label>
                          <div className="flex gap-3">
                            <input
                              required
                              type="text"
                              value={slide.image}
                              onChange={(e) => updateSlide(index, 'image', e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-green outline-none"
                            />
                            <label className="bg-white border border-slate-200 text-slate-900 hover:text-brand-blue px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs hover:border-slate-300 transition-colors">
                              <Upload className="w-4 h-4 text-brand-blue" />
                              <span>Crop & Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onFileSelectForCrop(e, `slide_${index}`)}
                                className="hidden"
                              />
                            </label>
                          </div>
                          {slide.image && (
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(slide.image)}
                                alt={`Slide ${index + 1} Preview`}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                                Slide {index + 1} Live Preview
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Headline & Highlight Word */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                              Headline *
                            </label>
                            <input
                              required
                              type="text"
                              value={slide.headline}
                              onChange={(e) => updateSlide(index, 'headline', e.target.value)}
                              placeholder="e.g. Powering the future of the world"
                              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-green outline-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                              Highlight Keyword *
                            </label>
                            <input
                              required
                              type="text"
                              value={slide.highlightWord}
                              onChange={(e) => updateSlide(index, 'highlightWord', e.target.value)}
                              placeholder="e.g. future"
                              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-green outline-none font-bold text-brand-orange"
                            />
                            <span className="text-[11px] text-slate-400 mt-1 block">Renders styled in #F39C12.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtitle Text */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Hero Subtitle Text *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={settings.subtitle}
                    onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-green outline-none resize-none font-normal leading-relaxed"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-brand-green text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 hover:text-white transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingSettings ? 'Saving Hero Carousel...' : 'Save Hero Carousel'}
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: TRUSTED MARQUEE BRANDS TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">2. Trusted Partner Brands (Marquee)</h2>
                  <p className="text-xs text-slate-500">Brands displayed in the seamless infinite banner.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingBrand(null);
                    setBrandForm({ name: '', image_url: '', is_active: true, sort_order: brands.length + 1 });
                    setIsBrandModalOpen(true);
                  }}
                  className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs self-start"
                >
                  <Plus className="w-4 h-4 text-brand-green" />
                  <span>Add Trusted Brand</span>
                </button>
              </div>

              {/* Density Warning Banner if < 6 active brands */}
              {activeBrandsCount < 6 && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    <strong>Marquee Density Warning:</strong> You currently have {activeBrandsCount} active brand(s). We recommend at least 6 active brands for a smooth infinite marquee scroll.
                  </span>
                </div>
              )}

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Brand Name</th>
                      <th className="px-6 py-4">Display Asset</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {brands.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{b.name}</td>
                        <td className="px-6 py-4 text-xs">
                          {b.image_url ? (
                            <img src={getAssetUrl(b.image_url)} alt={b.name} className="h-6 object-contain" />
                          ) : (
                            <span className="text-slate-400 font-mono">Text Badge Only</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {b.is_active ? (
                            <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingBrand(b);
                                setBrandForm({
                                  name: b.name,
                                  image_url: b.image_url || '',
                                  is_active: b.is_active,
                                  sort_order: b.sort_order,
                                });
                                setIsBrandModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Brand"
                            >
                              <Edit className="w-4 h-4 text-brand-blue" />
                            </button>
                            <button
                              onClick={() => handleBrandDelete(b.id, b.name)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Brand"
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
        )}

        {/* MODAL: ADD / EDIT TRUSTED BRAND */}
        {isBrandModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {editingBrand ? 'Edit Trusted Brand' : 'Add Trusted Brand'}
              </h3>

              <form onSubmit={handleBrandSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Brand Name *</label>
                  <input
                    required
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                    placeholder="e.g. SUNPOWER CORP"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Logo Image URL (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={brandForm.image_url}
                      onChange={(e) => setBrandForm({ ...brandForm, image_url: e.target.value })}
                      placeholder="Leave blank to use text title"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs outline-none"
                    />
                    <label className="bg-white border border-slate-200 text-slate-900 hover:text-brand-blue px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                      <Scissors className="w-3.5 h-3.5 text-brand-blue" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onFileSelectForCrop(e, 'brand_logo')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={brandForm.is_active}
                    onChange={(e) => setBrandForm({ ...brandForm, is_active: e.target.checked })}
                    className="w-4 h-4 text-brand-green rounded-sm focus:ring-brand-green"
                  />
                  <label htmlFor="is_active_check" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Active (Show in Marquee)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingBrand ? 'Save Changes' : 'Add Brand'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: IMAGE CROPPING TOOL */}
        {cropperModalOpen && imageToCrop && (
          <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-2xl w-full flex flex-col shadow-2xl relative">
              <button
                onClick={() => setCropperModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 cursor-pointer z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-brand-blue" />
                <span>Crop Image before Uploading</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Drag to position and pinch/scroll to scale the crop box.
              </p>

              {/* Cropper Container */}
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropTarget.startsWith('slide_') || cropTarget === 'hero_bg' ? 16 / 9 : 4 / 2}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  style={{
                    containerStyle: { backgroundColor: 'transparent' },
                    mediaStyle: { backgroundColor: 'transparent' },
                  }}
                  classes={{
                    containerClassName: '!bg-transparent',
                    mediaClassName: '!bg-transparent',
                  }}
                />
              </div>

              {/* Zoom Slider */}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-xs font-bold text-slate-600">Zoom:</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-brand-blue"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setCropperModalOpen(false)}
                  className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3 text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCropAndUpload}
                  disabled={uploadingCropped}
                  className="w-1/2 bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-colors py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  {uploadingCropped ? 'Cropping & Uploading...' : 'Apply Crop & Use Image'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default HeroManager;
