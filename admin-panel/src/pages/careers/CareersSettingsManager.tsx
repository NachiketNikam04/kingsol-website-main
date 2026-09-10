import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  Send,
} from 'lucide-react';

interface CareersPageSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  hero_bg_image_url: string;
  positions_title: string;
  positions_subtitle: string;
  gen_tagline: string;
  gen_headline: string;
  gen_description: string;
  disclaimer_title: string;
  disclaimer_text: string;
}

// Canvas Helper Function to Crop Base64 / File Image
const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return reject(new Error('No 2d context'));
      }

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

export const CareersSettingsManager: React.FC = () => {
  const [formData, setFormData] = useState<CareersPageSettings>({
    tagline: 'CAREERS',
    headline: 'Help build a cleaner, brighter energy future.',
    highlight_word: 'brighter',
    hero_bg_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
    positions_title: 'Open Positions',
    positions_subtitle: 'Join us in engineering the future of solar.',
    gen_tagline: 'General Application',
    gen_headline: "Don't see your specific tech stack?",
    gen_description:
      "We are always looking for exceptional talent to join our team. If your expertise isn't listed in our open roles, send your details directly to our recruitment team and we'll reach out if a position opens up.",
    disclaimer_title: 'Important Note:',
    disclaimer_text:
      'Kingsol will never ask for any recruitment fees, security deposits, or financial payments from candidates at any stage of the hiring process.',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cropper State (Landscape Aspect 16:9)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/careers/page');
      if (res.data.success && res.data.data && res.data.data.settings) {
        setFormData(res.data.data.settings);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load Careers page settings.' });
    } finally {
      setLoading(false);
    }
  };

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
        setFormData((prev) => ({ ...prev, hero_bg_image_url: croppedImageBase64 }));
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
    setMessage(null);

    try {
      const res = await api.put('/careers/page', formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Careers page content saved successfully!' });
        setFormData(res.data.data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update Careers page settings.' });
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
              CAREERS PAGE MANAGER
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Page Content & Copy</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure hero header, general section copy, anti-fraud disclaimer, and image banners.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Careers page settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
            {/* 1. HERO SECTION SETTINGS */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Careers Hero Section</h2>
                  <p className="text-xs text-slate-500">Top hero banner text and background image.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tagline *</label>
                <input
                  required
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Headline *</label>
                <input
                  required
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Highlighted Word *</label>
                <input
                  required
                  type="text"
                  value={formData.highlight_word}
                  onChange={(e) => setFormData({ ...formData, highlight_word: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold text-brand-blue"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-2">
                  Hero Background Image * (16:9 Aspect Ratio)
                </label>
                <div className="space-y-3">
                  <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                    {formData.hero_bg_image_url ? (
                      <img
                        src={getAssetUrl(formData.hero_bg_image_url)}
                        alt="Careers Hero Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mb-1" />
                        <span className="text-xs">No image uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="url"
                      value={formData.hero_bg_image_url}
                      onChange={(e) => setFormData({ ...formData, hero_bg_image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-blue font-medium"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-slate-900 border border-slate-200 rounded-xl font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-4 py-3 text-xs flex items-center gap-2 shrink-0"
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
            </div>

            {/* 2. OPEN POSITIONS SECTION HEADER */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Open Positions Section Header</h2>
                  <p className="text-xs text-slate-500">Header texts above the jobs list.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Section Title *</label>
                <input
                  required
                  type="text"
                  value={formData.positions_title}
                  onChange={(e) => setFormData({ ...formData, positions_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Section Subtitle *</label>
                <input
                  required
                  type="text"
                  value={formData.positions_subtitle}
                  onChange={(e) => setFormData({ ...formData, positions_subtitle: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                />
              </div>
            </div>

            {/* 3. GENERAL APPLICATION SECTION */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">General Application Card Copy</h2>
                  <p className="text-xs text-slate-500">Text displayed inside the general submission card.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Tagline *</label>
                <input
                  required
                  type="text"
                  value={formData.gen_tagline}
                  onChange={(e) => setFormData({ ...formData, gen_tagline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Headline *</label>
                <input
                  required
                  type="text"
                  value={formData.gen_headline}
                  onChange={(e) => setFormData({ ...formData, gen_headline: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Card Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.gen_description}
                  onChange={(e) => setFormData({ ...formData, gen_description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none leading-relaxed resize-none"
                ></textarea>
              </div>
            </div>

            {/* 4. ANTI-FRAUD DISCLAIMER BOX */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Anti-Fraud Recruitment Disclaimer</h2>
                  <p className="text-xs text-slate-500">Warning message displayed at the bottom of the Careers page.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Disclaimer Title *</label>
                <input
                  required
                  type="text"
                  value={formData.disclaimer_title}
                  onChange={(e) => setFormData({ ...formData, disclaimer_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Disclaimer Text *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.disclaimer_text}
                  onChange={(e) => setFormData({ ...formData, disclaimer_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none leading-relaxed resize-none"
                ></textarea>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-blue text-white px-10 py-4 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-md cursor-pointer"
              >
                {saving ? 'Saving Content...' : 'Save All Careers Page Content'}
              </button>
            </div>
          </form>
        )}

        {/* MODAL: IMAGE CROPPER FOR HERO IMAGE */}
        {imageToCrop && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 max-w-2xl w-full shadow-2xl relative text-slate-900">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-blue" />
                <span>Crop Careers Hero Image (16:9)</span>
              </h3>
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
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

export default CareersSettingsManager;
