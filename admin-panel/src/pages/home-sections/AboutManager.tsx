import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  Users,
  Upload,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Scissors,
  BarChart2,
} from 'lucide-react';

interface AboutSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
  main_image_url: string;
  card_heading: string;
  card_body: string;
  bg_image_url: string;
  image_on_left?: boolean;
}

interface AboutStat {
  id: number;
  end_value: number;
  prefix: string;
  suffix: string;
  label: string;
  sort_order: number;
}

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

export const AboutManager: React.FC = () => {
  const [settings, setSettings] = useState<AboutSettings>({
    tagline: 'WHAT WE DO',
    headline: 'We are dedicated to making clean power accessible, affordable, and effective.',
    highlight_word: 'clean power',
    subtitle: 'Kingsol Energy is a premier solar procurement partner across India, driving rooftop solar installations, commercial PV plants, and grid-tie microgrids with Tier-1 components.',
    main_image_url: 'https://cdn.britannica.com/94/192794-050-3F3F3DDD/panels-electricity-order-sunlight.jpg',
    card_heading: 'SUNERGY VISION',
    card_body: 'Sunergy was founded with a vision to drive sustainable energy solutions that empower individuals, businesses, and communities.',
    bg_image_url: 'https://static.vecteezy.com/system/resources/previews/027/662/778/large_2x/solar-panel-on-sky-sunset-background-free-photo.jpg',
  });

  const [stats, setStats] = useState<AboutStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Stat Modal States
  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<AboutStat | null>(null);
  const [statForm, setStatForm] = useState({ end_value: 100, prefix: '', suffix: '+', label: '', sort_order: 1 });

  // Image Cropper Modal States
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'main_img' | 'bg_img'>('main_img');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploadingCropped, setUploadingCropped] = useState(false);

  const fetchAboutData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/home/about');
      if (res.data.success) {
        if (res.data.data.settings?.headline) {
          setSettings(res.data.data.settings);
        }
        setStats(res.data.data.stats || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch About section configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  // Handle File Input Change -> Trigger Cropper Modal
  const onFileSelectForCrop = (e: React.ChangeEvent<HTMLInputElement>, target: 'main_img' | 'bg_img') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCropTarget(target);
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropperModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
      formData.append('file', croppedBlob, `about_cropped_${Date.now()}.png`);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        if (cropTarget === 'main_img') {
          setSettings((prev) => ({ ...prev, main_image_url: fileUrl }));
        } else {
          setSettings((prev) => ({ ...prev, bg_image_url: fileUrl }));
        }
        setMessage({ type: 'success', text: 'Image cropped and uploaded successfully!' });
      }
      setCropperModalOpen(false);
      setImageToCrop(null);
    } catch {
      setMessage({ type: 'error', text: 'Failed to crop and upload image.' });
    } finally {
      setUploadingCropped(false);
    }
  };

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/about', settings);
      setMessage({ type: 'success', text: 'About section settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update about section settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Stat Counter Submit & Delete
  const handleStatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStat) {
        await api.put(`/home/about/stats/${editingStat.id}`, statForm);
        setMessage({ type: 'success', text: `Statistic '${statForm.label}' updated.` });
      } else {
        await api.post('/home/about/stats', statForm);
        setMessage({ type: 'success', text: `Statistic '${statForm.label}' added.` });
      }
      setIsStatModalOpen(false);
      fetchAboutData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save statistic.' });
    }
  };

  const handleStatDelete = async (id: number, label: string) => {
    if (!window.confirm(`Delete statistic counter '${label}'?`)) return;
    try {
      await api.delete(`/home/about/stats/${id}`);
      setMessage({ type: 'success', text: `Statistic '${label}' deleted.` });
      fetchAboutData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete statistic.' });
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
            <h1 className="text-3xl font-bold text-slate-900">About Section Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Customize company vision text, overlapping card details, background wallpaper, and statistics counter.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading About section settings...</div>
        ) : (
          <div className="space-y-12 max-w-6xl">
            {/* SECTION 1: ABOUT CONTENT SETTINGS FORM (Clean 2-Column Grid) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">1. About Content & Vision Card Settings</h2>
                  <p className="text-xs text-slate-500">Configure text content, vision card overlay, and media images.</p>
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-8">
                {/* 2-COLUMN GRID WRAPPER */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LEFT COLUMN */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Main Text Content & Layout
                    </h3>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-brand-blue transition-colors">
                        <input
                          type="checkbox"
                          checked={settings.image_on_left ?? true}
                          onChange={(e) => setSettings({ ...settings, image_on_left: e.target.checked })}
                          className="w-5 h-5 accent-brand-blue rounded cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 uppercase block">Layout: Image on Left, Text on Right</span>
                          <span className="text-[11px] text-slate-500">When enabled, image is placed on the left. When disabled, image is on the right.</span>
                        </div>
                      </label>
                    </div>

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
                      <span className="text-[11px] text-slate-400 mt-1 block">Renders styled in #0078C8.</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Subtitle Overview *</label>
                      <textarea
                        rows={4}
                        required
                        value={settings.subtitle}
                        onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      ></textarea>
                    </div>
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="space-y-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                      Green Vision Card & Main Image
                    </h3>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Heading</label>
                      <input
                        type="text"
                        value={settings.card_heading}
                        onChange={(e) => setSettings({ ...settings, card_heading: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Body</label>
                      <textarea
                        rows={3}
                        value={settings.card_body}
                        onChange={(e) => setSettings({ ...settings, card_body: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Main Image Link *</label>
                      <div className="flex gap-3">
                        <input
                          required
                          type="text"
                          value={settings.main_image_url}
                          onChange={(e) => setSettings({ ...settings, main_image_url: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                        <label className="bg-white border border-slate-200 text-slate-900 hover:text-brand-blue px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs">
                          <Upload className="w-4 h-4 text-brand-blue" />
                          <span>Crop & Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onFileSelectForCrop(e, 'main_img')}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {settings.main_image_url && (
                        <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                          <img src={getAssetUrl(settings.main_image_url)} alt="Main Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* FULL WIDTH (BELOW 2 COLUMNS) */}
                <div className="pt-6 border-t border-slate-100 space-y-6">
                  {/* <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                      Background Image Link (Map Layer)
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={settings.bg_image_url}
                        onChange={(e) => setSettings({ ...settings, bg_image_url: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                      />
                      <label className="bg-white border border-slate-200 text-slate-900 hover:text-brand-blue px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs">
                        <Scissors className="w-4 h-4 text-brand-blue" />
                        <span>Crop & Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onFileSelectForCrop(e, 'bg_img')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div> */}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="bg-brand-blue text-white px-10 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                    >
                      {savingSettings ? 'Saving Settings...' : 'Save Changes'}
                    </button>
                  </div>
                </div> 
              </form>
            </div>

            {/* SECTION 2: STATISTICS TRACKER TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">2. Live Statistics Counter Grid</h2>
                  <p className="text-xs text-slate-500">Numerical stats displayed with animated count-up.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingStat(null);
                    setStatForm({ end_value: 100, prefix: '', suffix: '+', label: '', sort_order: stats.length + 1 });
                    setIsStatModalOpen(true);
                  }}
                  className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs self-start"
                >
                  <Plus className="w-4 h-4 text-brand-blue" />
                  <span>Add Statistic</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Sort Order</th>
                      <th className="px-6 py-4">Counter Value</th>
                      <th className="px-6 py-4">Label</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{s.sort_order}</td>
                        <td className="px-6 py-4 font-bold text-brand-orange text-base">
                          {s.prefix}{s.end_value.toLocaleString()}{s.suffix}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{s.label}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingStat(s);
                                setStatForm({
                                  end_value: s.end_value,
                                  prefix: s.prefix || '',
                                  suffix: s.suffix || '',
                                  label: s.label,
                                  sort_order: s.sort_order,
                                });
                                setIsStatModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Stat"
                            >
                              <Edit className="w-4 h-4 text-brand-blue" />
                            </button>
                            <button
                              onClick={() => handleStatDelete(s.id, s.label)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Stat"
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

        {/* MODAL: ADD / EDIT STATISTIC */}
        {isStatModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsStatModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-brand-orange" />
                <span>{editingStat ? 'Edit Statistic' : 'Add Statistic Counter'}</span>
              </h3>

              <form onSubmit={handleStatSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Target Number Value *</label>
                  <input
                    required
                    type="number"
                    value={statForm.end_value}
                    onChange={(e) => setStatForm({ ...statForm, end_value: parseInt(e.target.value) || 0 })}
                    placeholder="e.g. 1200"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Prefix Symbol</label>
                    <input
                      type="text"
                      value={statForm.prefix}
                      onChange={(e) => setStatForm({ ...statForm, prefix: e.target.value })}
                      placeholder="e.g. $"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Suffix Symbol</label>
                    <input
                      type="text"
                      value={statForm.suffix}
                      onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })}
                      placeholder="e.g. % or +"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Label Description *</label>
                  <input
                    required
                    type="text"
                    value={statForm.label}
                    onChange={(e) => setStatForm({ ...statForm, label: e.target.value })}
                    placeholder="e.g. Savings on Energy Bills"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={statForm.sort_order}
                    onChange={(e) => setStatForm({ ...statForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsStatModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-blue text-white rounded-full font-semibold hover:bg-slate-900 transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingStat ? 'Save Changes' : 'Add Stat'}
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
                <span>Crop About Image before Uploading</span>
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
                  aspect={cropTarget === 'main_img' ? 4 / 3 : 16 / 9}
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
                  className="w-1/2 bg-brand-blue text-white rounded-full font-semibold hover:bg-slate-900 transition-colors py-3 text-sm cursor-pointer flex items-center justify-center gap-2"
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

export default AboutManager;
