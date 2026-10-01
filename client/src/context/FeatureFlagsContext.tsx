import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/assetUrl';

export interface FeatureFlags {
  show_services: boolean;
  show_videos: boolean;
  show_bess: boolean;
}

export interface FeatureFlagsContextType {
  featureFlags: FeatureFlags;
  loading: boolean;
  isBessCategory: (slugOrName?: string | null) => boolean;
}

const defaultFlags: FeatureFlags = {
  show_services: false,
  show_videos: false,
  show_bess: true,
};

export function isBessCategory(val?: string | null): boolean {
  if (!val) return false;
  const clean = val.toLowerCase().trim();
  return (
    clean === 'bess' ||
    clean.includes('bess') ||
    clean === 'battery-energy-storage-systems' ||
    clean.includes('battery energy') ||
    clean.includes('energy storage')
  );
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType>({
  featureFlags: defaultFlags,
  loading: true,
  isBessCategory,
});

export const FeatureFlagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(defaultFlags);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchFlags() {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/features`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setFeatureFlags({
              show_services: Boolean(json.data.show_services),
              show_videos: Boolean(json.data.show_videos),
              show_bess: json.data.show_bess !== undefined ? Boolean(json.data.show_bess) : true,
            });
          }
        }
      } catch (err) {
        console.warn('⚠️ [FeatureFlagsContext] Failed to fetch feature flags:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchFlags();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ featureFlags, loading, isBessCategory }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export function useFeatureFlags(): FeatureFlagsContextType {
  return useContext(FeatureFlagsContext);
}
