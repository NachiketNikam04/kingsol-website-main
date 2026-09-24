import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, ArrowUpRight } from 'lucide-react';
import SocialLinks, { DynamicSocialLink } from './SocialLinks';

interface FooterSettingsData {
  description?: string;
  hq_label?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const Footer: React.FC = () => {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [footerLogoUrl, setFooterLogoUrl] = useState<string>('');

  const [settings, setSettings] = useState<FooterSettingsData>({
    description: 'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
    hq_label: 'Global HQ',
    address: 'Third floor Shop. no. 326, Vardhaman Moonstone, Pune.',
    phone: '+1 (800) 555-SOLAR',
    email: 'b2b@kingsol-energy.com',
  });

  const [socialLinks, setSocialLinks] = useState<DynamicSocialLink[]>([]);

  useEffect(() => {
    async function loadFooterAndBranding() {
      try {
        const [brandRes, footerRes] = await Promise.all([
          fetch(`${API_BASE_URL}/branding`).then((r) => r.json()).catch(() => null),
          fetch(`${API_BASE_URL}/footer`).then((r) => r.json()).catch(() => null),
        ]);

        if (brandRes && brandRes.success && brandRes.data) {
          setLogoUrl(brandRes.data.logo_url || '');
          setFooterLogoUrl(brandRes.data.footer_logo_url || '');
        }

        if (footerRes && footerRes.success && footerRes.data) {
          if (footerRes.data.settings) {
            setSettings((prev) => ({ ...prev, ...footerRes.data.settings }));
          }
          if (footerRes.data.socialLinks && footerRes.data.socialLinks.length > 0) {
            setSocialLinks(footerRes.data.socialLinks);
          }
        }
      } catch (err) {
        console.warn('⚠️ [Footer] Fetch offline, using default settings:', err);
      }
    }
    loadFooterAndBranding();
  }, []);

  const activeFooterLogo = footerLogoUrl || logoUrl || '/logo.png';

  return (
    <footer className="relative bg-[#fdfcf8] text-slate-800 pt-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-200/80">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link className="relative inline-block flex items-center gap-3 mb-6 w-fit" to="/">
              <img
                src={getAssetUrl(activeFooterLogo)}
                alt="Kingsol Solar Energy"
                // INCREASED SIZE: Changed heights to h-16 / md:h-20 and increased max-width to 280px
                className="h-16 md:h-20 w-auto max-w-[280px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
              <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-[#fdfcf8] via-[#fdfcf8]/70 to-transparent pointer-events-none z-10" />
            </Link>

            <p className="text-slate-600 text-base leading-relaxed max-w-md font-normal whitespace-pre-line">
              {settings.description}
            </p>

            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-900 hover:text-brand-green transition-colors group mb-6"
              >
                <span>Request a Free Quote</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Social Media Icon Bar */}
            <div className="pt-2">
              <SocialLinks initialLinks={socialLinks} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-orange mb-6">
              Solutions
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li>
                <Link to="/products/solar-modules" className="hover:text-[#44a0e3] transition-colors">
                  PV Panels
                </Link>
              </li>
              <li>
                <Link to="/products/solar-inverters" className="hover:text-[#44a0e3] transition-colors">
                  Inverters
                </Link>
              </li>
              <li>
                <Link to="/products/solar-inverters/feston-inverters" className="hover:text-[#44a0e3] transition-colors">
                  LiFePO4 Battery
                </Link>
              </li>
              <li>
                <Link to="/products/solar-modules" className="hover:text-[#44a0e3] transition-colors">
                  Microgrid Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Enterprise */}
          <div className="md:col-span-2">
            <h4 className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-orange mb-6">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 font-medium">
              <li>
                <Link to="/about" className="hover:text-[#44a0e3] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#44a0e3] transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#44a0e3] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-[#44a0e3] transition-colors">
                  Blogs
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="md:col-span-3">
            <h4 className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-[#44a0e3] mb-6">
              {settings.hq_label || 'Global HQ'}
            </h4>
            <ul className="space-y-4 text-sm text-slate-600 font-medium">
              <li className="flex items-start space-x-3">
                <MapPin className="w-6 h-6 text-slate-800 mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-slate-800 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center space-x-3">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                  alt="Gmail" 
                  className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" 
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:underline text-slate-700 hover:text-slate-900 transition-colors"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#25D366] shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <a
                  href="https://wa.me/918483835826?text=Hello%20Kingsol%20team,%20I%20would%20like%20to%20know%20more%20about%20your%20solar%20solutions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-normal">
          <p>© {new Date().getFullYear()} Kingsol Energy Inc. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-supply" className="hover:text-slate-900 transition-colors">
              Terms of Supply
            </Link>
            <Link to="/certificates" className="hover:text-slate-900 transition-colors">
              Certifications
            </Link>
          </div>
        </div>
      </div>

      {/* Giant Semi-Transparent Watermark across bottom */}
      <div className="w-full text-center pointer-events-none select-none overflow-hidden leading-none mt-4 -mb-6 sm:-mb-10 md:-mb-14 lg:-mb-16 relative inline-block">
        <span className="text-[20vw] font-black text-[#44a0e3]/[0.10] tracking-tighter uppercase whitespace-nowrap block">
          KINGSOL
        </span>
        <div className="absolute bottom-0 left-0 w-full h-[20%] bg-gradient-to-t from-[#fdfcf8] via-[#fdfcf8]/70 to-transparent pointer-events-none z-10" />
      </div>
    </footer>
  );
};

export default Footer;
