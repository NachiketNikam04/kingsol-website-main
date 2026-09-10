import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface AboutHeroSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  description: string;
  image_url: string;
}

// Helper to crop image blob
const getCroppedImg = (imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string> => {
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
        reject(new Error('No 2d context'));
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

      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = (error) => reject(error);
  });
};

export const AboutHeroManager: React.FC = () => {
  const [settings, setSettings] = useState<AboutHeroSettings>({
    tagline: 'ABOUT',
    headline: 'A better way to deliver Clean energy',
    highlight_word: 'Clean',
    description:
      'Kingsol designs, installs, and supports high-performance solar and storage systems for homes, businesses, and large-scale projects. Our work is grounded in engineering rigor, transparency, and a commitment to long-term performance.',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cropper State (Landscape Aspect 4:3 for About Page Hero Image)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchHeroSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/about/hero');
        if (res.data.success && res.data.data) {
          setSettings(res.data.data);
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to fetch About Us hero section settings.' });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setSettings((prev) => ({ ...prev, image_url: croppedImageBase64 }));
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
        alert('Failed to crop hero image');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/about/hero', settings);
      setMessage({ type: 'success', text: 'About Page Hero section settings updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update About Page Hero settings.' });
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
              ABOUT PAGE MANAGER
            </span>
            <h1 className="text-3xl font-bold text-slate-900">About Hero Section Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure top tagline, main headline, highlight word, overview description, and feature image.
            </p>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm max-w-3xl ${
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading About Page Hero settings...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-3xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Hero Section Controls</h2>
                <p className="text-xs text-slate-500">Configure content rendered in the top header of the About Us page.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <span className="text-[11px] text-slate-400 mt-1 block">Renders styled in #44a0e3.</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Overview Description *</label>
                <textarea
                  rows={4}
                  required
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none leading-relaxed resize-none"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-2">Hero Feature Image</label>
                <div className="space-y-4">
                  {settings.image_url && (
                    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                      <img src={getAssetUrl(settings.image_url)} alt="Hero Preview" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      type="url"
                      value={settings.image_url}
                      onChange={(e) => setSettings({ ...settings, image_url: e.target.value })}
                      placeholder="Paste Image URL or upload below..."
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-4 py-3 text-xs flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-brand-blue" />
                      <span>Upload & Crop</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                >
                  {saving ? 'Saving Hero Settings...' : 'Save About Hero Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: IMAGE CROPPER FOR ABOUT HERO IMAGE */}
        {imageToCrop && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 max-w-2xl w-full shadow-2xl relative text-slate-900">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-blue" />
                <span>Crop About Hero Feature Image (4:3)</span>
              </h3>
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
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
                  onClick={() => setImageToCrop(null)}
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

export default AboutHeroManager;
