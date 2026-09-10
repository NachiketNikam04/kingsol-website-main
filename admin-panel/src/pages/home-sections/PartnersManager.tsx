import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Scissors,
} from 'lucide-react';

interface PartnersSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
}

interface BrandOption {
  id: number;
  name: string;
  slug: string;
  category_name?: string;
}

interface PartnerLogo {
  id: number;
  name: string;
  image_url: string;
  sort_order: number;
  route_url?: string;
  linked_brand_id?: number | null;
  linked_brand?: {
    id: number;
    name: string;
    slug: string;
    category_slug?: string;
  } | null;
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

export const PartnersManager: React.FC = () => {
  const [settings, setSettings] = useState<PartnersSettings>({
    tagline: 'WHO WE TRUST',
    headline: 'Integrated seamlessly with Trusted industry partners',
    highlight_word: 'Trusted',
  });

  const [logos, setLogos] = useState<PartnerLogo[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logo Modal States
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [editingLogo, setEditingLogo] = useState<PartnerLogo | null>(null);
  const [logoForm, setLogoForm] = useState({
    name: '',
    image_url: '',
    sort_order: 1,
    route_url: '',
    linked_brand_id: '' as string | number,
  });

  // Image Cropper Modal States
  const [cropperModalOpen, setCropperModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploadingCropped, setUploadingCropped] = useState(false);

  const fetchPartnersData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, brandRes] = await Promise.all([
        api.get('/home/partners'),
        api.get('/brands').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (res.data.success) {
        if (res.data.data.settings?.headline) {
          setSettings(res.data.data.settings);
        }
        setLogos(res.data.data.logos || []);
      }

      if (brandRes.data?.success && Array.isArray(brandRes.data.data)) {
        setBrands(brandRes.data.data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Partners section configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartnersData();
  }, [fetchPartnersData]);

  // Handle File Input Select -> Trigger Cropper Modal
  const onFileSelectForCrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      formData.append('file', croppedBlob, `partner_logo_${Date.now()}.png`);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        setLogoForm((prev) => ({ ...prev, image_url: fileUrl }));
        setMessage({ type: 'success', text: 'Partner logo cropped and uploaded successfully!' });
      }
      setCropperModalOpen(false);
      setImageToCrop(null);
    } catch {
      setMessage({ type: 'error', text: 'Failed to crop and upload logo.' });
    } finally {
      setUploadingCropped(false);
    }
  };

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/partners', settings);
      setMessage({ type: 'success', text: 'Partners section settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update partners section settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Logo Submit & Delete
  const handleLogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoForm.image_url) {
      alert('Logo image is required.');
      return;
    }

    try {
      const payload = {
        ...logoForm,
        linked_brand_id: logoForm.linked_brand_id ? parseInt(String(logoForm.linked_brand_id), 10) : null,
      };

      if (editingLogo) {
        await api.put(`/home/partners/logos/${editingLogo.id}`, payload);
        setMessage({ type: 'success', text: `Partner logo '${logoForm.name}' updated.` });
      } else {
        await api.post('/home/partners/logos', payload);
        setMessage({ type: 'success', text: `Partner logo '${logoForm.name}' added.` });
      }
      setIsLogoModalOpen(false);
      fetchPartnersData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save partner logo.' });
    }
  };

  const handleLogoDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete partner logo '${name}'?`)) return;
    try {
      await api.delete(`/home/partners/logos/${id}`);
      setMessage({ type: 'success', text: `Partner logo '${name}' deleted.` });
      fetchPartnersData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete partner logo.' });
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
            <h1 className="text-3xl font-bold text-slate-900">Partners Section Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage section headers, highlighted keyword, and dynamic brand partner logo cards.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Partners section settings...</div>
        ) : (
          <div className="space-y-12 max-w-6xl">
            {/* SECTION 1: SETTINGS FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">1. Partners Header Settings</h2>
                  <p className="text-xs text-slate-500">Configure tagline, headline text, and highlighted keyword.</p>
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

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Highlighted Word *</label>
                  <input
                    required
                    type="text"
                    value={settings.highlight_word}
                    onChange={(e) => setSettings({ ...settings, highlight_word: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold text-[#44a0e3]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Renders styled in #44a0e3.</span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* SECTION 2: PARTNER LOGOS CRUD TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">2. Partner Brand Logos</h2>
                  <p className="text-xs text-slate-500">Logos rendered inside the dynamic centering flexbox container.</p>
                </div>

                <button
                  onClick={() => {
                    setEditingLogo(null);
                    setLogoForm({ name: '', image_url: '', sort_order: logos.length + 1, route_url: '', linked_brand_id: '' });
                    setIsLogoModalOpen(true);
                  }}
                  className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs self-start"
                >
                  <Plus className="w-4 h-4 text-brand-green" />
                  <span>Add Partner Logo</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Sort Order</th>
                      <th className="px-6 py-4">Partner Name</th>
                      <th className="px-6 py-4">Logo Preview</th>
                      <th className="px-6 py-4">Linked Brand / Destination</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logos.map((logo) => (
                      <tr key={logo.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{logo.sort_order}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{logo.name}</td>
                        <td className="px-6 py-4">
                          <div className="h-10 w-24 bg-slate-50 rounded-lg p-1.5 border border-slate-200 flex items-center justify-center">
                            <img src={getAssetUrl(logo.image_url)} alt={logo.name} className="max-h-full max-w-full object-contain" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {logo.linked_brand ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-xs text-brand-green bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 w-fit">
                                <Building2 className="w-3 h-3 text-emerald-600" />
                                {logo.linked_brand.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                /brands/{logo.linked_brand.slug || logo.linked_brand.id}
                              </span>
                            </div>
                          ) : logo.route_url ? (
                            <span className="font-mono text-xs text-brand-blue bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100/60 inline-block max-w-[200px] truncate" title={logo.route_url}>
                              {logo.route_url}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">None (Unlinked)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingLogo(logo);
                                setLogoForm({
                                  name: logo.name,
                                  image_url: logo.image_url,
                                  sort_order: logo.sort_order,
                                  route_url: logo.route_url || '',
                                  linked_brand_id: logo.linked_brand_id ? logo.linked_brand_id.toString() : '',
                                });
                                setIsLogoModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              title="Edit Logo"
                            >
                              <Edit className="w-4 h-4 text-brand-blue" />
                            </button>
                            <button
                              onClick={() => handleLogoDelete(logo.id, logo.name)}
                              className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Logo"
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

        {/* MODAL: ADD / EDIT PARTNER LOGO */}
        {isLogoModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsLogoModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {editingLogo ? 'Edit Partner Logo' : 'Add Partner Logo'}
              </h3>

              <form onSubmit={handleLogoSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Partner Name *</label>
                  <input
                    required
                    type="text"
                    value={logoForm.name}
                    onChange={(e) => setLogoForm({ ...logoForm, name: e.target.value })}
                    placeholder="e.g. SunPower"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Logo Image URL *
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="text"
                      value={logoForm.image_url}
                      onChange={(e) => setLogoForm({ ...logoForm, image_url: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs outline-none"
                    />
                    <label className="bg-white border border-slate-200 text-slate-900 hover:text-brand-blue px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                      <Scissors className="w-3.5 h-3.5 text-brand-blue" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onFileSelectForCrop}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {logoForm.image_url && (
                    <div className="mt-2 h-16 w-full bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-center">
                      <img src={getAssetUrl(logoForm.image_url)} alt="Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Link to Brand Page
                  </label>
                  <select
                    value={logoForm.linked_brand_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      const matched = brands.find((b) => b.id.toString() === val);
                      setLogoForm({
                        ...logoForm,
                        linked_brand_id: val,
                        name: logoForm.name || matched?.name || '',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-medium"
                  >
                    <option value="">None (Unlinked)</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name} {brand.category_name ? `(${brand.category_name})` : ''}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Selecting a brand dynamically links this logo to its showcase page.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                    Or Custom Destination Route / URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={logoForm.route_url}
                    onChange={(e) => setLogoForm({ ...logoForm, route_url: e.target.value })}
                    placeholder="e.g., /brands/rayzon or https://example.com"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Leave blank if this logo should not be clickable or if a brand is linked above.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={logoForm.sort_order}
                    onChange={(e) => setLogoForm({ ...logoForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsLogoModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingLogo ? 'Save Changes' : 'Add Logo'}
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
                <span>Crop Partner Logo before Uploading</span>
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
                  aspect={4 / 2}
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
                  {uploadingCropped ? 'Cropping & Uploading...' : 'Apply Crop & Use Logo'}
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

export default PartnersManager;
