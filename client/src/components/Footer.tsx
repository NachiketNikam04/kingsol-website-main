import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
    description:
      'High-efficiency solar components, utility-scale storage, and turnkey B2B procurement engineered for a sustainable planet.',
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
    <footer className="relative bg-[#0b0b0f] text-slate-300 pt-16 md:pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Phase 1 & 2: Top (Links & Info) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-16">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link className="inline-block flex items-center gap-3 w-fit" to="/">
              <img
                src={getAssetUrl(activeFooterLogo)}
                alt="Kingsol Solar Energy"
                className="h-14 md:h-16 w-auto max-w-[260px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </Link>

            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-sm whitespace-pre-line">
              {settings.description}
            </p>

            <div>
              <Link
                to="/contact"
                className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-green hover:text-white transition-colors duration-300 group"
              >
                <span>Request a Free Quote</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <SocialLinks initialLinks={socialLinks} />
            </div>
          </div>

          {/* Quick links / Solutions */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base tracking-wide">
              Solutions
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/products/solar-modules"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  PV Panels
                </Link>
              </li>
              <li>
                <Link
                  to="/products/solar-inverters"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Solar Inverters
                </Link>
              </li>
              <li>
                <Link
                  to="/products/bess"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  BESS Storage
                </Link>
              </li>
              <li>
                <Link
                  to="/products/solar-modules"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Microgrid Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base tracking-wide">
              Company
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  to="/blogs"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Blogs & News
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Photo Gallery
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base tracking-wide">
              Legal
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/certificates"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Certifications
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-supply"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Terms of Supply
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / HQ Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm md:text-base tracking-wide">
              {settings.hq_label || 'Contact Us'}
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="w-5 h-5 text-brand-green mt-0.5 shrink-0" />
                <span className="leading-snug">{settings.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-brand-green shrink-0" />
                <a
                  href={`tel:${settings.phone}`}
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
                  alt="Gmail"
                  className="w-5 h-5 shrink-0"
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer truncate"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366] shrink-0">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                <a
                  href="https://wa.me/918483835826?text=Hello%20Kingsol%20team,%20I%20would%20like%20to%20know%20more%20about%20your%20solar%20solutions."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Phase 4: Middle (Copyright & Credits) */}
        <div className="pt-8 pb-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-normal gap-4">
          <p>© 2026 Kingsol. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link
              to="/privacy-policy"
              className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-supply"
              className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Terms of Supply
            </Link>
            <Link
              to="/certificates"
              className="text-slate-400 hover:text-white transition-colors duration-300 cursor-pointer"
            >
              Certifications
            </Link>
          </div>
        </div>
      </div>

      {/* Phase 3: Bottom (Giant 'KINGSOL' Gradient Text) */}
      <div className="w-full overflow-hidden flex justify-center items-end mt-12">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-[18vw] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[#44a0e3] via-[#44a0e3]/80 to-brand-green select-none"
        >
          KINGSOL
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
