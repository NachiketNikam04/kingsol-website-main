import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  HelpCircle,
  ListPlus,
} from 'lucide-react';

interface WhyChooseSettings {
  id?: number;
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface WhyChooseStep {
  id: number;
  title: string;
  features: string[];
  sort_order: number;
}

export const WhyChooseUsManager: React.FC = () => {
  const [settings, setSettings] = useState<WhyChooseSettings>({
    tagline: 'WHY CHOOSE KINGSOL',
    headline: 'From Consultation to Clean Energy in 4 Simple Steps',
    highlight_word: 'Consultation',
    subtitle: 'We make switching to solar energy simple. Our streamlined process ensures you get the best solar solution quickly, affordably, and completely hassle-free.',
  });

  const [steps, setSteps] = useState<WhyChooseStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Step Modal States
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<WhyChooseStep | null>(null);
  const [stepForm, setStepForm] = useState({ title: '', features: [''], sort_order: 1 });
  const [newFeatureInput, setNewFeatureInput] = useState('');

  const fetchWhyChooseData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/home/why-choose');
      if (res.data.success) {
        if (res.data.data.settings?.headline) {
          setSettings(res.data.data.settings);
        }
        setSteps(res.data.data.steps || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch Why Choose Us section configuration.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWhyChooseData();
  }, [fetchWhyChooseData]);

  // Submit Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.put('/home/why-choose', settings);
      setMessage({ type: 'success', text: 'Why Choose Us section settings saved successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update why choose us settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Feature Bullet Point Handlers
  const addFeatureBullet = () => {
    if (!newFeatureInput.trim()) return;
    setStepForm((prev) => ({ ...prev, features: [...prev.features, newFeatureInput.trim()] }));
    setNewFeatureInput('');
  };

  const updateFeatureBullet = (index: number, value: string) => {
    const updated = [...stepForm.features];
    updated[index] = value;
    setStepForm((prev) => ({ ...prev, features: updated }));
  };

  const removeFeatureBullet = (index: number) => {
    setStepForm((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  // Step Submit & Delete
  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFeatures = stepForm.features.filter((f) => f.trim() !== '');

    if (!stepForm.title) {
      alert('Step title is required.');
      return;
    }

    const payload = {
      title: stepForm.title,
      features: cleanFeatures,
      sort_order: stepForm.sort_order,
    };

    try {
      if (editingStep) {
        await api.put(`/home/why-choose/steps/${editingStep.id}`, payload);
        setMessage({ type: 'success', text: `Step '${stepForm.title}' updated.` });
      } else {
        await api.post('/home/why-choose/steps', payload);
        setMessage({ type: 'success', text: `Step '${stepForm.title}' added.` });
      }
      setIsStepModalOpen(false);
      fetchWhyChooseData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save process step.' });
    }
  };

  const handleStepDelete = async (id: number, title: string) => {
    if (!window.confirm(`Delete step '${title}'?`)) return;
    try {
      await api.delete(`/home/why-choose/steps/${id}`);
      setMessage({ type: 'success', text: `Step '${title}' deleted.` });
      fetchWhyChooseData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete process step.' });
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
            <h1 className="text-3xl font-bold text-slate-900">Why Choose Us Section Settings</h1>
            <p className="text-slate-600 text-sm mt-1">
              Customize left column headers, highlight keyword, and dynamic process step bullet cards.
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
          <div className="text-center py-20 text-slate-500 font-medium">Loading Why Choose Us settings...</div>
        ) : (
          <div className="space-y-12 max-w-6xl">
            {/* 2-COLUMN SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* LEFT SIDE: SETTINGS FORM */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">1. Left Column Headers</h2>
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

              {/* RIGHT SIDE: STEPS CRUD MANAGER */}
              <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">2. Process Steps ({steps.length})</h2>
                    <p className="text-xs text-slate-500">Steps rendered dynamically in order.</p>
                  </div>

                  <button
                    onClick={() => {
                      setEditingStep(null);
                      setStepForm({ title: '', features: [''], sort_order: steps.length + 1 });
                      setIsStepModalOpen(true);
                    }}
                    className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-xs shadow-xs self-start"
                  >
                    <Plus className="w-4 h-4 text-brand-green" />
                    <span>Add Step</span>
                  </button>
                </div>

                {/* Steps Data Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Step #</th>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-5 py-3">Bullet Items</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {steps.map((step, idx) => (
                        <tr key={step.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-xs font-bold text-brand-blue">
                            0{idx + 1}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900">{step.title}</td>
                          <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                            {step.features?.length || 0} features
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingStep(step);
                                  setStepForm({
                                    title: step.title,
                                    features: step.features?.length > 0 ? [...step.features] : [''],
                                    sort_order: step.sort_order,
                                  });
                                  setIsStepModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                                title="Edit Step"
                              >
                                <Edit className="w-4 h-4 text-brand-blue" />
                              </button>
                              <button
                                onClick={() => handleStepDelete(step.id, step.title)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Delete Step"
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

        {/* MODAL: ADD / EDIT PROCESS STEP */}
        {isStepModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsStepModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-900 mb-6">
                {editingStep ? 'Edit Process Step' : 'Add Process Step'}
              </h3>

              <form onSubmit={handleStepSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Step Title *</label>
                  <input
                    required
                    type="text"
                    value={stepForm.title}
                    onChange={(e) => setStepForm({ ...stepForm, title: e.target.value })}
                    placeholder="e.g. Consultation & Site Audit"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none font-bold"
                  />
                </div>

                {/* DYNAMIC BULLET POINT LIST BUILDER */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase block">
                      Feature Bullet Points
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {stepForm.features.filter((f) => f.trim()).length} added
                    </span>
                  </div>

                  {/* Bullet inputs with trash icon */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {stepForm.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-blue w-6 shrink-0">{idx + 1}.</span>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeatureBullet(idx, e.target.value)}
                          placeholder="e.g. Free engineering site assessment"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeatureBullet(idx)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove Bullet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Bullet Input */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addFeatureBullet();
                        }
                      }}
                      placeholder="Type bullet point and press Add..."
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={addFeatureBullet}
                      className="bg-slate-100 hover:bg-brand-blue hover:text-white border border-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <ListPlus className="w-4 h-4" />
                      <span>Add Bullet</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={stepForm.sort_order}
                    onChange={(e) => setStepForm({ ...stepForm, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsStepModalOpen(false)}
                    className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold py-3.5 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-brand-blue text-white rounded-full font-semibold hover:bg-slate-900 transition-colors py-3.5 text-sm cursor-pointer"
                  >
                    {editingStep ? 'Save Changes' : 'Add Step'}
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

export default WhyChooseUsManager;
