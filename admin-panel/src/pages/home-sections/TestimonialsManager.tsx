import { getAssetUrl } from '../../utils/assetUrl';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import Cropper from 'react-easy-crop';
import {
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Star,
  User,
} from 'lucide-react';

interface TestimonialSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface TestimonialReview {
  id: number;
  name: string;
  role: string;
  image_url: string | null;
  review: string;
  rating: number;
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

export const TestimonialsManager: React.FC = () => {
  const [settings, setSettings] = useState<TestimonialSettings>({
    tagline: 'Testimonial',
    headline: 'What Our Solar Clients Say',
    highlight_word: 'Clients',
    subtitle: 'Real feedback from homeowners and businesses who trust our solar solutions.',
  });

  const [reviews, setReviews] = useState<TestimonialReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal & Form state for Review CRUD
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<TestimonialReview | null>(null);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    role: '',
    image_url: '',
    review: '',
    rating: 5,
    sort_order: 1,
  });

  // Cropper State (1:1 square ratio for avatar)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTestimonialsData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/home/testimonials');
      if (res.data.success) {
        if (res.data.data.settings?.headline) {
          setSettings(res.data.data.settings);
        }
        setReviews(res.data.data.reviews || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Testimonials section configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonialsData();
  }, [fetchTestimonialsData]);

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/testimonials', settings);
      setMessage({ type: 'success', text: 'Testimonials section settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update testimonials settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Image Cropping Handler
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
        setReviewForm((prev) => ({ ...prev, image_url: croppedImageBase64 }));
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
        alert('Failed to crop image');
      }
    }
  };

  // Review Submit & Delete
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.role || !reviewForm.review) {
      alert('Name, role, and review text are required.');
      return;
    }

    try {
      if (editingReview) {
        await api.put(`/home/testimonials/reviews/${editingReview.id}`, reviewForm);
        setMessage({ type: 'success', text: `Review by '${reviewForm.name}' updated.` });
      } else {
        await api.post('/home/testimonials/reviews', reviewForm);
        setMessage({ type: 'success', text: `Review by '${reviewForm.name}' added.` });
      }
      setIsReviewModalOpen(false);
      fetchTestimonialsData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save testimonial review.' });
    }
  };

  const handleReviewDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete testimonial review by '${name}'?`)) return;
    try {
      await api.delete(`/home/testimonials/reviews/${id}`);
      setMessage({ type: 'success', text: `Review by '${name}' deleted.` });
      fetchTestimonialsData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete review.' });
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
            <h1 className="text-3xl font-bold text-slate-900">Testimonials Section Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage client reviews, 1:1 avatar cropping, star ratings, and headline keyword highlights.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Testimonials configuration...</div>
        ) : (
          <div className="space-y-12 max-w-6xl">
            {/* 2-COLUMN SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* LEFT SIDE: SETTINGS FORM */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange/20 text-brand-orange flex items-center justify-center font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">1. Left Side Headers</h2>
                    <p className="text-xs text-slate-500">Tagline, main headline, highlight keyword, and overview text.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
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
                    <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Subtitle Overview *</label>
                    <textarea
                      rows={4}
                      required
                      value={settings.subtitle}
                      onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                    ></textarea>
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

              {/* RIGHT SIDE: REVIEWS CRUD MANAGER */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span>2. Client Reviews</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </h2>
                    <p className="text-xs text-slate-500">Rendered in bi-directional scrolling marquee columns on client.</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingReview(null);
                      setReviewForm({
                        name: '',
                        role: '',
                        image_url: '',
                        review: '',
                        rating: 5,
                        sort_order: reviews.length + 1,
                      });
                      setIsReviewModalOpen(true);
                    }}
                    className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-xs shadow-xs self-start"
                  >
                    <Plus className="w-4 h-4 text-brand-green" />
                    <span>Add Review</span>
                  </button>
                </div>

                {/* Reviews Data Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Avatar</th>
                        <th className="px-5 py-3">Client Info</th>
                        <th className="px-5 py-3">Rating</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            {rev.image_url ? (
                              <img
                                src={getAssetUrl(rev.image_url)}
                                alt={rev.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                                {rev.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-900">{rev.name}</div>
                            <div className="text-xs text-slate-500">{rev.role}</div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center text-amber-500 font-bold text-xs gap-1">
                              <span>{'★'.repeat(rev.rating || 5)}</span>
                              <span className="text-slate-400 font-normal">({rev.rating}/5)</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingReview(rev);
                                  setReviewForm({
                                    name: rev.name,
                                    role: rev.role,
                                    image_url: rev.image_url || '',
                                    review: rev.review,
                                    rating: rev.rating || 5,
                                    sort_order: rev.sort_order,
                                  });
                                  setIsReviewModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Edit Review"
                              >
                                <Edit className="w-4 h-4 text-brand-blue" />
                              </button>
                              <button
                                onClick={() => handleReviewDelete(rev.id, rev.name)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete Review"
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
          </div>
        )}

        {/* MODAL: ADD / EDIT REVIEW */}
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {editingReview ? 'Edit Client Review' : 'Add Client Review'}
              </h3>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Client Name *</label>
                  <input
                    required
                    type="text"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Client Role / Company *</label>
                  <input
                    required
                    type="text"
                    value={reviewForm.role}
                    onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                    placeholder="e.g. Managing Director, Apex Steel Industries"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                  >
                    <option value={5}>★★★★★ (5 Stars)</option>
                    <option value={4}>★★★★☆ (4 Stars)</option>
                    <option value={3}>★★★☆☆ (3 Stars)</option>
                    <option value={2}>★★☆☆☆ (2 Stars)</option>
                    <option value={1}>★☆☆☆☆ (1 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Avatar Image (1:1 Square)</label>
                  <div className="flex items-center gap-4">
                    {reviewForm.image_url ? (
                      <img
                        src={getAssetUrl(reviewForm.image_url)}
                        alt="Avatar Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-brand-blue"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-4 py-2.5 text-xs flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-brand-blue" />
                      <span>{reviewForm.image_url ? 'Change Avatar' : 'Upload & Crop Avatar'}</span>
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

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Review Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    placeholder="Write the full feedback review here..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={reviewForm.sort_order}
                    onChange={(e) => setReviewForm({ ...reviewForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-blue text-white rounded-full font-semibold hover:bg-slate-900 transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingReview ? 'Save Changes' : 'Add Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: IMAGE CROPPER FOR AVATAR */}
        {imageToCrop && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 max-w-lg w-full shadow-2xl relative text-slate-900">
              <h3 className="text-lg font-bold mb-4">Crop Avatar Image (1:1 Square)</h3>
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
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

export default TestimonialsManager;
