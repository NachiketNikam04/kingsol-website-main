import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import {
  ToggleLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Layers,
  Video,
  Wrench,
} from 'lucide-react';

interface FeatureToggleItemProps {
  title: string;
  description: string;
  initialCheck: boolean;
  onToggle: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const FeatureToggleItem: React.FC<FeatureToggleItemProps> = ({
  title,
  description,
  initialCheck,
  onToggle,
  icon,
}) => {
  const [isChecked, setIsChecked] = useState(initialCheck);

  useEffect(() => {
    setIsChecked(initialCheck);
  }, [initialCheck]);

  const handleToggle = (checked: boolean) => {
    setIsChecked(checked);
    onToggle(checked);
  };

  return (
    <Field
      className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs hover:border-slate-300 transition-all"
      orientation="horizontal"
    >
      <div className="flex items-start gap-4 flex-1 mr-4">
        {icon && (
          <div
            className={`p-3 rounded-xl shrink-0 transition-colors ${
              isChecked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}
          >
            {icon}
          </div>
        )}
        <FieldContent>
          <div className="flex items-center gap-2">
            <FieldLabel
              className={`font-bold text-base transition-colors duration-200 ${
                isChecked ? 'text-green-600' : 'text-red-600'
              }`}
              htmlFor={`switch-${title}`}
            >
              {title}
            </FieldLabel>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isChecked
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isChecked ? (
                <>
                  <Eye className="w-3 h-3" /> Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3" /> Hidden
                </>
              )}
            </span>
          </div>
          <FieldDescription className="text-slate-500 text-sm mt-1">
            {description}
          </FieldDescription>
        </FieldContent>
      </div>
      <Switch
        id={`switch-${title}`}
        checked={isChecked}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 shrink-0"
      />
    </Field>
  );
};

export const FeatureFlagsManager: React.FC = () => {
  const [features, setFeatures] = useState({
    show_services: false,
    show_videos: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings/features');
      if (res.data.success && res.data.data) {
        setFeatures({
          show_services: Boolean(res.data.data.show_services),
          show_videos: Boolean(res.data.data.show_videos),
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load feature flags settings from server.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const updateFeatureFlag = async (key: 'show_services' | 'show_videos', value: boolean) => {
    const updated = { ...features, [key]: value };
    setFeatures(updated);
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.put('/settings/features', updated);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: `Navigation visibility updated: ${key === 'show_services' ? 'Services' : 'Videos'} is now ${
            value ? 'VISIBLE (Green)' : 'HIDDEN (Red)'
          }.`,
        });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to save feature flag settings to database.' });
      // Revert on error
      fetchFeatures();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-brand-green font-bold text-xs uppercase tracking-wider mb-1">
              <ToggleLeft className="w-4 h-4" />
              <span>System Configuration</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Feature Toggles & Navigation
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Dynamically control visibility of public website navigation items and pages in real-time.
            </p>
          </div>

          {saving && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span>
              <span>Saving changes...</span>
            </div>
          )}
        </div>

        {/* Status Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2.5 font-medium">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer text-base ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-500 font-medium shadow-xs">
            Loading feature flag settings...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Navigation Switches Container */}
            <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-brand-green" />
                  <span>Public Navigation Bar Toggles</span>
                </h2>
                <p className="text-slate-500 text-xs mt-1">
                  Switch <strong className="text-green-600">Green</strong> to display the section in the navbar, or <strong className="text-red-600">Red</strong> to hide it.
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Services Page & Dropdown Toggle */}
                <FeatureToggleItem
                  title="Services Page & Dropdown"
                  description="When enabled (Green), displays the 'Services' link and its multi-service submenu in the top navigation bar. When disabled (Red), hides it completely from the public header."
                  initialCheck={features.show_services}
                  onToggle={(checked) => updateFeatureFlag('show_services', checked)}
                  icon={<Wrench className="w-5 h-5" />}
                />

                {/* 2. Videos / Media Section Toggle */}
                <FeatureToggleItem
                  title="Video & Media Center"
                  description="When enabled (Green), displays the 'Video & Media Center' link under the 'Contents' dropdown in the top navigation bar. When disabled (Red), hides the link seamlessly."
                  initialCheck={features.show_videos}
                  onToggle={(checked) => updateFeatureFlag('show_videos', checked)}
                  icon={<Video className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* Information Card */}
            <div className="p-6 bg-slate-100/70 rounded-2xl border border-slate-200/80 flex items-start gap-3.5">
              <Shield className="w-5 h-5 text-slate-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-600 leading-relaxed space-y-1">
                <p className="font-semibold text-slate-800">Instant Real-Time Persistence</p>
                <p>
                  Changes are stored directly in the NeonDB database. Visitors to the public website will immediately see the updated navigation layout upon their next navigation or page load.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default FeatureFlagsManager;
