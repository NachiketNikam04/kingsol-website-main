import { API_BASE_URL } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Instagram, Facebook, Youtube, Linkedin, Globe } from 'lucide-react';

export interface DynamicSocialLink {
  id?: number;
  platform_name: string;
  url: string;
  icon_name?: string;
  sort_order?: number;
}

const DEFAULT_SOCIAL_LINKS: DynamicSocialLink[] = [
  { platform_name: 'Instagram', url: 'https://instagram.com/kingsolenergy', icon_name: 'Instagram' },
  { platform_name: 'Facebook', url: 'https://facebook.com/kingsolenergy', icon_name: 'Facebook' },
  { platform_name: 'LinkedIn', url: 'https://linkedin.com/company/kingsol-energy', icon_name: 'Linkedin' },
  { platform_name: 'YouTube', url: 'https://youtube.com/@kingsolenergy', icon_name: 'Youtube' },
  { platform_name: 'X (Twitter)', url: 'https://x.com/kingsolenergy', icon_name: 'Twitter' },
];

export const SocialLinks: React.FC<{ initialLinks?: DynamicSocialLink[] }> = ({ initialLinks }) => {
  const [links, setLinks] = useState<DynamicSocialLink[]>(
    initialLinks && initialLinks.length > 0 ? initialLinks : DEFAULT_SOCIAL_LINKS
  );

  useEffect(() => {
    if (initialLinks && initialLinks.length > 0) {
      setLinks(initialLinks);
      return;
    }

    async function fetchSocial() {
      try {
        const res = await fetch(`${API_BASE_URL}/footer`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && json.data && json.data.socialLinks && json.data.socialLinks.length > 0) {
          setLinks(json.data.socialLinks);
        }
      } catch {
        // Safe fallback
      }
    }
    fetchSocial();
  }, [initialLinks]);

  // Bulletproof Icon Lookup Dictionary with Globe Fallback
  const getSocialIcon = (iconName?: string, platformName?: string) => {
    const key = (iconName || platformName || '').toLowerCase().trim();

    if (key.includes('insta')) return <Instagram className="w-5 h-5 stroke-[1.8]" />;
    if (key.includes('face')) return <Facebook className="w-5 h-5 stroke-[1.8]" />;
    if (key.includes('link') || key.includes('in')) return <Linkedin className="w-5 h-5 stroke-[1.8]" />;
    if (key.includes('you') || key.includes('tube')) return <Youtube className="w-5 h-5 stroke-[1.8]" />;
    if (key.includes('twit') || key.includes('x')) {
      return (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    }

    return <Globe className="w-5 h-5 stroke-[1.8]" />;
  };

  return (
    <div className="flex items-center gap-4">
      {links.map((social, idx) => (
        <a
          key={social.id || idx}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.platform_name}
          className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:bg-brand-green hover:text-slate-900 hover:shadow-[0_10px_20px_rgba(120,194,87,0.25)] cursor-pointer shadow-sm"
        >
          {getSocialIcon(social.icon_name, social.platform_name)}
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;