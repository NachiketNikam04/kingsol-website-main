import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  MapPin,
  CheckCircle2,
  AlertCircle,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  SlidersHorizontal,
} from 'lucide-react';

interface WarehouseSettings {
  id?: number;
  warehouseTagline: string;
  warehouseHeadline: string;
  warehouseHighlightWord: string;
  warehouseDescription: string;
  warehouseMapImage: string;
  warehouseLocations: string[];
}

export const WarehouseManager: React.FC = () => {
  const [formData, setFormData] = useState<WarehouseSettings>({
    warehouseTagline: 'PAN-INDIA PRESENCE',
    warehouseHeadline: 'Strategic warehousing across High-demand renewable corridors.',
    warehouseHighlightWord: 'High-demand',
    warehouseDescription:
      'To guarantee rapid dispatch and zero transit bottlenecks, Kingsol maintains strategically positioned regional fulfillment hubs stocked with Tier-1 modules, inverters, and BOS infrastructure.',
    warehouseMapImage: '/uploads/india-warehouse-map.jpg',
    warehouseLocations: [
      'Bhiwandi, Maharashtra',
      'Ahmedabad, Gujarat',
      'Bengaluru, Karnataka',
      'Chennai, Tamil Nadu',
      'Jaipur, Rajasthan',
      'Kolkata, West Bengal',
      'Hyderabad, Telangana',
      'Noida, Delhi NCR',
    ],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/about/warehouse');
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setFormData({
          id: d.id,
          warehouseTagline: d.warehouseTagline || d.tagline || 'PAN-INDIA PRESENCE',
          warehouseHeadline:
            d.warehouseHeadline ||
            d.headline ||
            'Strategic warehousing across High-demand renewable corridors.',
          warehouseHighlightWord: d.warehouseHighlightWord || d.highlight_word || 'High-demand',
          warehouseDescription: d.warehouseDescription || d.description || '',
          warehouseMapImage:
            d.warehouseMapImage || d.map_image_url || '/uploads/india-warehouse-map.jpg',
          warehouseLocations: Array.isArray(d.warehouseLocations)
            ? d.warehouseLocations
            : Array.isArray(d.locations)
            ? d.locations
            : [],
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load Warehouse Presence settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Reset input value so re-selecting the exact same file fires onChange
    e.target.value = '';

    const uploadData = new FormData();
    uploadData.append('file', file);

    setUploading(true);
    setMessage(null);

    try {
      // Allow browser and Axios to automatically set Content-Type with multipart boundary
      const res = await api.post('/upload', uploadData);
      const uploadedUrl = res.data?.fileUrl || res.data?.url;

      if (res.data?.success && uploadedUrl) {
        setFormData((prev) => ({ ...prev, warehouseMapImage: uploadedUrl }));

        // Persist immediately to database so the upload is saved right away
        try {
          await api.put('/about/warehouse', {
            ...formData,
            warehouseMapImage: uploadedUrl,
          });
          setMessage({ type: 'success', text: 'Map image uploaded and saved successfully!' });
        } catch (dbErr) {
          console.warn('Map uploaded but auto-save failed; click "Save Warehouse Section" to persist:', dbErr);
          setMessage({ type: 'success', text: 'Map image uploaded! Click "Save Warehouse Section" to persist.' });
        }
      } else {
        const errMsg = res.data?.message || 'No file URL returned from upload server.';
        console.error('❌ Warehouse map upload failed:', errMsg);
        setMessage({ type: 'error', text: `Upload failed: ${errMsg}` });
      }
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload map graphic. Please verify connection and file format.';
      console.error('❌ Warehouse map upload error:', err);
      setMessage({ type: 'error', text: `Upload error: ${errMsg}` });
    } finally {
      setUploading(false);
    }
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    setFormData((prev) => ({
      ...prev,
      warehouseLocations: [...prev.warehouseLocations, newLocation.trim()],
    }));
    setNewLocation('');
  };

  const handleRemoveLocation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      warehouseLocations: prev.warehouseLocations.filter((_, i) => i !== index),
    }));
  };

  const handleLocationChange = (index: number, val: string) => {
    const updated = [...formData.warehouseLocations];
    updated[index] = val;
    setFormData((prev) => ({ ...prev, warehouseLocations: updated }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.put('/about/warehouse', {
        warehouseTagline: formData.warehouseTagline,
        warehouseHeadline: formData.warehouseHeadline,
        warehouseHighlightWord: formData.warehouseHighlightWord,
        warehouseDescription: formData.warehouseDescription,
        warehouseMapImage: formData.warehouseMapImage,
        warehouseLocations: formData.warehouseLocations,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Warehouse Presence section saved successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update Warehouse settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
            <div>
              <span className="text-xs font-bold text-brand-green tracking-widest uppercase block mb-1">
                ABOUT US PAGE MANAGER
              </span>
              <h1 className="text-3xl font-bold text-slate-900">Warehouse Presence Section</h1>
              <p className="text-slate-600 text-sm mt-1">
                Configure India distribution map, regional warehouse hubs, and logistical copy.
              </p>
            </div>
          </div>

          {/* Feedback Message Banner */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span>{message.text}</span>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-slate-500 font-medium">
              Loading Warehouse settings...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Map Graphic Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Warehouse Map Graphic</h2>
                    <p className="text-xs text-slate-500">
                      Upload or specify India map graphic (transparent or white background recommended).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                        Upload Map Graphic
                      </label>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*,.svg"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-3 px-4 rounded-xl border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer text-sm"
                      >
                        <Upload className="w-4 h-4 text-slate-600" />
                        <span>{uploading ? 'Uploading...' : 'Choose Map Image'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                        Or Image URL Path
                      </label>
                      <input
                        type="text"
                        value={formData.warehouseMapImage}
                        onChange={(e) =>
                          setFormData({ ...formData, warehouseMapImage: e.target.value })
                        }
                        placeholder="/uploads/india-warehouse-map.jpg"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                      />
                    </div>
                  </div>

                  {/* Map Preview */}
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                      Map Preview
                    </span>
                    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                      {formData.warehouseMapImage ? (
                        <img
                          src={getAssetUrl(formData.warehouseMapImage)}
                          alt="Warehouse Map Preview"
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8 mb-1" />
                          <span className="text-xs font-medium">No map selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Typography & Copy Settings */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-green/20 text-brand-green flex items-center justify-center font-bold">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Section Typography & Copy</h2>
                    <p className="text-xs text-slate-500">
                      Configure tagline, main headline, accent highlight word, and descriptive paragraph.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Section Tagline (Without dot) *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.warehouseTagline}
                    onChange={(e) =>
                      setFormData({ ...formData, warehouseTagline: e.target.value })
                    }
                    placeholder="e.g. PAN-INDIA PRESENCE"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                      Main Headline *
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.warehouseHeadline}
                      onChange={(e) =>
                        setFormData({ ...formData, warehouseHeadline: e.target.value })
                      }
                      placeholder="e.g. Strategic warehousing across High-demand renewable corridors."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                      Highlight Word * (styled in blue)
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.warehouseHighlightWord}
                      onChange={(e) =>
                        setFormData({ ...formData, warehouseHighlightWord: e.target.value })
                      }
                      placeholder="e.g. High-demand"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-bold text-brand-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1.5">
                    Description Text *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.warehouseDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, warehouseDescription: e.target.value })
                    }
                    placeholder="To guarantee rapid dispatch and zero transit bottlenecks..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none leading-relaxed font-normal"
                  />
                </div>
              </div>

              {/* Section 3: Warehouse Locations Array */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Warehouse Locations List</h2>
                    <p className="text-xs text-slate-500">
                      Add, update, or remove physical fulfillment hubs across India.
                    </p>
                  </div>
                </div>

                {/* Add Location Input Row */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLocation();
                      }
                    }}
                    placeholder="e.g. Pune, Maharashtra"
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    className="bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Hub</span>
                  </button>
                </div>

                {/* Current Locations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.warehouseLocations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 group hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 text-brand-blue shrink-0" />
                        <input
                          type="text"
                          value={loc}
                          onChange={(e) => handleLocationChange(idx, e.target.value)}
                          className="bg-transparent text-slate-900 text-sm font-semibold w-full focus:outline-none border-b border-transparent focus:border-brand-blue py-0.5"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-rose-50"
                        title="Remove location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-brand-blue hover:bg-blue-600 text-white font-bold px-8 py-3.5 rounded-full flex items-center gap-2 text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Warehouse Section'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      </div>
    </div>
  );
};

export default WarehouseManager;
