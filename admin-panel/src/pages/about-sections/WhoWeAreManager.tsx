import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Info,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WhoWeAreSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  marquee_headline: string;
  marquee_highlight_word: string;
  image_url: string;
}

interface AccordionItem {
  id: number;
  title: string;
  content: string;
  sort_order: number;
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

export const WhoWeAreManager: React.FC = () => {
  const [settings, setSettings] = useState<WhoWeAreSettings>({
    tagline: 'WHO WE ARE',
    headline: 'A solar company built on Clarity and accountability',
    highlight_word: 'Clarity',
    marquee_headline: 'Trusted by 30+ companies',
    marquee_highlight_word: '30+',
    image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2072&auto=format&fit=crop',
  });

  const [accordions, setAccordions] = useState<AccordionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cropper State (Landscape Aspect 4:3)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal State for Accordion CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccordion, setEditingAccordion] = useState<AccordionItem | null>(null);
  const [accordionForm, setAccordionForm] = useState({ title: '', content: '', sort_order: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/about/who-we-are');
      if (res.data.success) {
        if (res.data.data.settings) setSettings(res.data.data.settings);
        if (res.data.data.accordions) setAccordions(res.data.data.accordions);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Who We Are section data.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
        alert('Failed to crop image');
      }
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/about/who-we-are', settings);
      setMessage({ type: 'success', text: 'Who We Are text settings updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update Who We Are settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleOpenModal = (item?: AccordionItem) => {
    if (item) {
      setEditingAccordion(item);
      setAccordionForm({ title: item.title, content: item.content, sort_order: item.sort_order });
    } else {
      setEditingAccordion(null);
      setAccordionForm({ title: '', content: '', sort_order: accordions.length + 1 });
    }
    setIsModalOpen(true);
  };

  const handleSaveAccordion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAccordion) {
        await api.put(`/about/who-we-are/accordions/${editingAccordion.id}`, accordionForm);
        setMessage({ type: 'success', text: 'Accordion item updated successfully!' });
      } else {
        await api.post('/about/who-we-are/accordions', accordionForm);
        setMessage({ type: 'success', text: 'Accordion item created successfully!' });
      }
      setIsModalOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save accordion item.' });
    }
  };

  const handleDeleteAccordion = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this accordion item?')) {
      try {
        await api.delete(`/about/who-we-are/accordions/${id}`);
        setMessage({ type: 'success', text: 'Accordion item deleted.' });
        fetchData();
      } catch {
        setMessage({ type: 'error', text: 'Failed to delete accordion item.' });
      }
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
            <h1 className="text-3xl font-bold text-slate-900">Who We Are Section</h1>
            <p className="text-slate-600 text-sm mt-1">
              Configure tagline, main headline, accordion items, and partner logo marquee header.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Who We Are settings...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: SETTINGS FORM */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Header & Marquee Settings</h2>
                  <p className="text-xs text-slate-500">Main text and side image configuration.</p>
                </div>
              </div>

              {/* Informational Partner Logos Sync Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3 text-xs text-amber-800">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Partner Logos Automatic Sync</span>
                  The logos displayed in the marquee at the bottom of this section are automatically synced from the{' '}
                  <Link to="/dashboard/home/partners" className="underline font-bold hover:text-slate-900">
                    Home Page &gt; Partners Section
                  </Link>.
                </div>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
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
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Headline Highlight Word *</label>
                  <input
                    required
                    type="text"
                    value={settings.highlight_word}
                    onChange={(e) => setSettings({ ...settings, highlight_word: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold text-brand-blue"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Marquee Headline *</label>
                  <input
                    required
                    type="text"
                    value={settings.marquee_headline}
                    onChange={(e) => setSettings({ ...settings, marquee_headline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Marquee Highlight Word *</label>
                  <input
                    required
                    type="text"
                    value={settings.marquee_highlight_word}
                    onChange={(e) => setSettings({ ...settings, marquee_highlight_word: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold text-brand-blue"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-2">Section Side Image</label>
                  <div className="space-y-4">
                    {settings.image_url && (
                      <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                        <img src={getAssetUrl(settings.image_url)} alt="Section Preview" className="w-full h-full object-cover" />
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
                    disabled={savingSettings}
                    className="bg-brand-blue text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 transition-all shadow-xs cursor-pointer"
                  >
                    {savingSettings ? 'Saving Settings...' : 'Save Section Settings'}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: ACCORDION CRUD DATA TABLE */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Accordion Items</h2>
                    <p className="text-xs text-slate-500">Manage hover-revealed details list.</p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal()}
                  className="bg-brand-green text-slate-900 font-bold px-4 py-2.5 rounded-full text-xs hover:bg-slate-900 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {accordions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No accordion items added yet.</div>
              ) : (
                <div className="space-y-4">
                  {accordions.map((acc, index) => (
                    <div
                      key={acc.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-md">
                            0{index + 1}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{acc.title}</h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{acc.content}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenModal(acc)}
                          className="p-2 text-slate-500 hover:text-brand-blue transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAccordion(acc.id)}
                          className="p-2 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: IMAGE CROPPER */}
        {imageToCrop && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 max-w-2xl w-full shadow-2xl relative text-slate-900">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-brand-blue" />
                <span>Crop Who We Are Side Image (4:3)</span>
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

        {/* MODAL: ACCORDION ITEM FORM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative text-slate-900">
              <h3 className="text-xl font-bold mb-6">
                {editingAccordion ? 'Edit Accordion Item' : 'Add Accordion Item'}
              </h3>

              <form onSubmit={handleSaveAccordion} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Title *</label>
                  <input
                    required
                    type="text"
                    value={accordionForm.title}
                    onChange={(e) => setAccordionForm({ ...accordionForm, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={accordionForm.content}
                    onChange={(e) => setAccordionForm({ ...accordionForm, content: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={accordionForm.sort_order}
                    onChange={(e) => setAccordionForm({ ...accordionForm, sort_order: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-brand-blue text-white font-bold text-xs hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    Save Accordion Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default WhoWeAreManager;
