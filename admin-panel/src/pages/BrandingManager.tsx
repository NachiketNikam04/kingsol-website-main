import { getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import Cropper from 'react-easy-crop';
import {
  Palette,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Save,
} from 'lucide-react';

interface GlobalBranding {
  id?: number;
  logo_url: string;
  footer_logo_url: string;
}

// Canvas Helper Function to Crop Image
const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return reject(new Error('No 2d context'));

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

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

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = (error) => reject(error);
  });
};

export const BrandingManager: React.FC = () => {
  const [formData, setFormData] = useState<GlobalBranding>({
    logo_url: '',
    footer_logo_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cropper State
  const [activeCropField, setActiveCropField] = useState<'logo_url' | 'footer_logo_url' | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRefMain = useRef<HTMLInputElement>(null);
  const fileInputRefFooter = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    setLoading(true);
    try {
      const res = await api.get('/branding');
      if (res.data.success && res.data.data) {
        setFormData({
          logo_url: res.data.data.logo_url || '',
          footer_logo_url: res.data.data.footer_logo_url || '',
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch global logo settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'footer_logo_url') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setActiveCropField(field);
        setImageToCrop(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels && activeCropField) {
      try {
        const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setFormData((prev) => ({ ...prev, [activeCropField]: croppedImageBase64 }));
        setImageToCrop(null);
        setActiveCropField(null);
      } catch (e) {
        console.error(e);
        alert('Failed to crop logo image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.put('/branding', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Global brand logos saved successfully!' });
        setFormData({
          logo_url: res.data.data.logo_url || '',
          footer_logo_url: res.data.data.footer_logo_url || '',
        });
      }
    } catch (err: any) {
      const errMsg = err?.response?.status === 413
        ? 'Payload too large. Please use a smaller image file.'
        : 'Failed to update global logo settings.';
      setMessage({ type: 'error', text: errMsg });
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
            <span className="text-xs font-bold text-brand-green tracking-widest uppercase block mb-1">
              SYSTEM-WIDE LOGO MANAGEMENT
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Global Logo Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Upload, crop, and set the dynamic logo images displayed across Navbar, Footer, and Admin Panel.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading global logo settings...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT FORM COLUMN (7 Cols) */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              {/* Main Header / Navbar Logo */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Main Navbar & Admin Logo</h2>
                    <p className="text-xs text-slate-500">Primary brand logo image for light background headers.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-2">Main Logo URL *</label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      placeholder="https://... or paste image URL"
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-blue font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefMain.current?.click()}
                      className="bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-4 py-3 text-xs flex items-center gap-2 shrink-0"
                    >
                      <Upload className="w-4 h-4 text-brand-blue" />
                      <span>Upload & Crop</span>
                    </button>
                    <input
                      ref={fileInputRefMain}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo_url')}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Footer Logo */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Footer Logo (Optional)</h2>
                    <p className="text-xs text-slate-500">Custom logo for dark background footer. Defaults to Main Logo if left empty.</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-2">Footer Logo URL</label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="text"
                      value={formData.footer_logo_url}
                      onChange={(e) => setFormData({ ...formData, footer_logo_url: e.target.value })}
                      placeholder="Leave blank to reuse main logo URL"
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-blue font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefFooter.current?.click()}
                      className="bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-4 py-3 text-xs flex items-center gap-2 shrink-0"
                    >
                      <Upload className="w-4 h-4 text-brand-blue" />
                      <span>Upload & Crop</span>
                    </button>
                    <input
                      ref={fileInputRefFooter}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'footer_logo_url')}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-blue text-white font-bold px-10 py-4 rounded-full text-sm hover:bg-slate-900 transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving Logos...' : 'Save Global Logos'}</span>
                </button>
              </div>
            </form>

            {/* RIGHT LIVE PREVIEWS COLUMN (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Navbar Live Preview */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Navbar Live Preview
                </span>
                <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    {formData.logo_url ? (
                      <img
                        src={getAssetUrl(formData.logo_url)}
                        alt="Logo Preview"
                        className="h-9 w-auto max-w-[140px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-green text-white font-bold flex items-center justify-center text-sm">
                        K
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-400">Products | Contact</span>
                </div>
              </div>

              {/* Footer Live Preview */}
              <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 shadow-xs space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Footer Live Preview
                </span>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {formData.footer_logo_url || formData.logo_url ? (
                      <img
                        src={getAssetUrl(formData.footer_logo_url || formData.logo_url)}
                        alt="Footer Logo Preview"
                        className="h-9 w-auto max-w-[140px] object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-blue to-brand-green text-white font-bold flex items-center justify-center text-sm">
                        K
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">© 2026 Kingsol Energy Inc.</span>
                </div>
              </div>

              {/* Admin Sidebar Live Preview */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Admin Sidebar Badge Preview
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
                  {formData.logo_url ? (
                    <img
                      src={getAssetUrl(formData.logo_url)}
                      alt="Sidebar Logo Preview"
                      className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-1"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-green text-white font-black text-lg flex items-center justify-center shadow-md">
                      K
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">Kingsol Portal</h4>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Admin v1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: IMAGE CROPPER FOR LOGO */}
        {imageToCrop && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 max-w-xl w-full shadow-2xl relative text-slate-900">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-blue" />
                <span>Crop Logo Image</span>
              </h3>
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 1}
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

              <div className="flex items-center gap-4 mb-6">
                <span className="text-xs font-bold text-slate-600 uppercase">Zoom</span>
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setImageToCrop(null);
                    setActiveCropField(null);
                  }}
                  className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="px-6 py-2.5 rounded-full bg-brand-blue text-white font-semibold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Apply Crop
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

export default BrandingManager;
