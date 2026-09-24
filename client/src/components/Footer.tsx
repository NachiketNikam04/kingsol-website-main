import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DynamicSocialLink } from './SocialLinks';

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

  const getLink = (keyword: string, fallback: string) => {
    const found = socialLinks.find((s) => s.platform_name?.toLowerCase().includes(keyword));
    return found?.url || fallback;
  };

  const instagramUrl = getLink('insta', 'https://instagram.com/kingsolenergy');
  const twitterUrl = getLink('twit', '') || getLink('x', '') || 'https://x.com/kingsolenergy';
  const youtubeUrl = getLink('you', 'https://youtube.com/@kingsolenergy');
  const linkedinUrl = getLink('link', 'https://linkedin.com/company/kingsol-energy');
  const facebookUrl = getLink('face', 'https://facebook.com/kingsolenergy');

  return (
    <footer className="relative bg-[#0b0b0f] text-slate-300 pt-16 md:pt-20 overflow-hidden">
      {/* Phase 1: Top-Right Ambient Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#44a0e3]/40 to-brand-green/20 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

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

            {/* Phase 2: Brand-Colored Social Media SVGs */}
            <div className="pt-2 flex items-center gap-4">
              {/* Instagram */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="transition-transform duration-300 hover:-translate-y-1 hover:scale-110 inline-block"
              >
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 264.583 264.583"><defs><radialGradient xlinkHref="#insta-a" id="insta-f" cx="158.429" cy="578.088" r="52.352" fx="158.429" fy="578.088" gradientTransform="matrix(0 -4.03418 4.28018 0 -2332.227 942.236)" gradientUnits="userSpaceOnUse"/><radialGradient xlinkHref="#insta-b" id="insta-g" cx="172.615" cy="600.692" r="65" fx="172.615" fy="600.692" gradientTransform="matrix(.67441 -1.16203 1.51283 .87801 -814.366 -47.835)" gradientUnits="userSpaceOnUse"/><radialGradient xlinkHref="#insta-c" id="insta-h" cx="144.012" cy="51.337" r="67.081" fx="144.012" fy="51.337" gradientTransform="matrix(-2.3989 .67549 -.23008 -.81732 464.996 -26.404)" gradientUnits="userSpaceOnUse"/><radialGradient xlinkHref="#insta-d" id="insta-e" cx="199.788" cy="628.438" r="52.352" fx="199.788" fy="628.438" gradientTransform="matrix(-3.10797 .87652 -.6315 -2.23914 1345.65 1374.198)" gradientUnits="userSpaceOnUse"/><linearGradient id="insta-d"><stop offset="0" stopColor="#ff005f"/><stop offset="1" stopColor="#fc01d8"/></linearGradient><linearGradient id="insta-c"><stop offset="0" stopColor="#780cff"/><stop offset="1" stopColor="#820bff" stopOpacity="0"/></linearGradient><linearGradient id="insta-b"><stop offset="0" stopColor="#fc0"/><stop offset="1" stopColor="#fc0" stopOpacity="0"/></linearGradient><linearGradient id="insta-a"><stop offset="0" stopColor="#fc0"/><stop offset=".124" stopColor="#fc0"/><stop offset=".567" stopColor="#fe4a05"/><stop offset=".694" stopColor="#ff0f3f"/><stop offset="1" stopColor="#fe0657" stopOpacity="0"/></linearGradient></defs><path fill="url(#insta-e)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="url(#insta-f)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="url(#insta-g)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="url(#insta-h)" d="M204.15 18.143c-55.23 0-71.383.057-74.523.317-11.334.943-18.387 2.728-26.07 6.554-5.922 2.942-10.592 6.351-15.201 11.13-8.394 8.716-13.481 19.439-15.323 32.184-.895 6.188-1.156 7.45-1.209 39.056-.02 10.536 0 24.4 0 42.999 0 55.2.062 71.341.326 74.476.916 11.032 2.645 17.973 6.308 25.565 7 14.533 20.37 25.443 36.12 29.514 5.453 1.404 11.476 2.178 19.208 2.544 3.277.142 36.669.244 70.081.244 33.413 0 66.826-.04 70.02-.203 8.954-.422 14.153-1.12 19.901-2.606 15.852-4.09 28.977-14.838 36.12-29.575 3.591-7.409 5.412-14.614 6.236-25.07.18-2.28.255-38.626.255-74.924 0-36.304-.082-72.583-.26-74.863-.835-10.625-2.656-17.77-6.364-25.32-3.042-6.182-6.42-10.799-11.324-15.519-8.752-8.361-19.455-13.45-32.21-15.29-6.18-.894-7.41-1.158-39.033-1.213z" transform="translate(-71.816 -18.143)"/><path fill="#fff" d="M132.345 33.973c-26.716 0-30.07.117-40.563.594-10.472.48-17.62 2.136-23.876 4.567-6.47 2.51-11.958 5.87-17.426 11.335-5.472 5.464-8.834 10.948-11.354 17.412-2.44 6.252-4.1 13.397-4.57 23.858-.47 10.486-.593 13.838-.593 40.535 0 26.697.119 30.037.594 40.522.482 10.465 2.14 17.609 4.57 23.859 2.515 6.465 5.876 11.95 11.346 17.414 5.466 5.468 10.955 8.834 17.42 11.345 6.26 2.431 13.41 4.088 23.881 4.567 10.493.477 13.844.594 40.559.594 26.719 0 30.061-.117 40.555-.594 10.472-.48 17.63-2.136 23.888-4.567 6.468-2.51 11.948-5.877 17.414-11.345 5.472-5.464 8.834-10.949 11.354-17.412 2.419-6.252 4.079-13.398 4.57-23.858.472-10.486.595-13.828.595-40.525s-.123-30.047-.594-40.533c-.492-10.465-2.152-17.608-4.57-23.858-2.521-6.466-5.883-11.95-11.355-17.414-5.472-5.468-10.944-8.827-17.42-11.335-6.271-2.431-13.424-4.088-23.897-4.567-10.493-.477-13.834-.594-40.558-.594zm-8.825 17.715c2.62-.004 5.542 0 8.825 0 26.266 0 29.38.094 39.752.565 9.591.438 14.797 2.04 18.264 3.385 4.591 1.782 7.864 3.912 11.305 7.352 3.443 3.44 5.575 6.717 7.362 11.305 1.346 3.46 2.951 8.663 3.388 18.247.47 10.363.573 13.475.573 39.71 0 26.233-.102 29.346-.573 39.709-.44 9.584-2.042 14.786-3.388 18.247-1.783 4.587-3.919 7.854-7.362 11.292-3.443 3.441-6.712 5.57-11.305 7.352-3.463 1.352-8.673 2.95-18.264 3.388-10.37.47-13.486.573-39.752.573-26.268 0-29.38-.102-39.751-.573-9.592-.443-14.797-2.044-18.267-3.39-4.59-1.781-7.87-3.911-11.313-7.352-3.443-3.44-5.574-6.709-7.362-11.298-1.346-3.461-2.95-8.663-3.387-18.247-.472-10.363-.566-13.476-.566-39.726s.094-29.347.566-39.71c.438-9.584 2.04-14.786 3.387-18.25 1.783-4.588 3.919-7.865 7.362-11.305 3.443-3.441 6.722-5.57 11.313-7.357 3.468-1.351 8.675-2.949 18.267-3.389 9.075-.41 12.592-.532 30.926-.553zm61.337 16.322c-6.518 0-11.805 5.277-11.805 11.792 0 6.512 5.287 11.796 11.805 11.796 6.517 0 11.804-5.284 11.804-11.796 0-6.513-5.287-11.796-11.805-11.796zm-52.512 13.782c-27.9 0-50.519 22.603-50.519 50.482 0 27.879 22.62 50.471 50.52 50.471s50.51-22.592 50.51-50.471c0-27.879-22.613-50.482-50.513-50.482zm0 17.715c18.11 0 32.792 14.67 32.792 32.767 0 18.096-14.683 32.767-32.792 32.767-18.11 0-32.791-14.671-32.791-32.767 0-18.098 14.68-32.767 32.791-32.767z"/></svg>
              </a>

              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="transition-transform duration-300 hover:-translate-y-1 hover:scale-110 inline-block"
              >
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 666.667 666.667"><defs><clipPath id="fb-a" clipPathUnits="userSpaceOnUse"><path d="M0 700h700V0H0Z"/></clipPath></defs><g clipPath="url(#fb-a)" transform="matrix(1.33333 0 0 -1.33333 -133.333 800)"><path d="M0 0c0 138.071-111.929 250-250 250S-500 138.071-500 0c0-117.245 80.715-215.622 189.606-242.638v166.242h-51.552V0h51.552v32.919c0 85.092 38.508 124.532 122.048 124.532 15.838 0 43.167-3.105 54.347-6.211V81.986c-5.901.621-16.149.932-28.882.932-40.993 0-56.832-15.528-56.832-55.9V0h81.659l-14.028-76.396h-67.631v-171.773C-95.927-233.218 0-127.818 0 0" style={{fill:'#0866ff', fillOpacity:1, fillRule:'nonzero', stroke:'none'}} transform="translate(600 350)"/><path d="m0 0 14.029 76.396H-67.63v27.019c0 40.372 15.838 55.899 56.831 55.899 12.733 0 22.981-.31 28.882-.931v69.253c-11.18 3.106-38.509 6.212-54.347 6.212-83.539 0-122.048-39.441-122.048-124.533V76.396h-51.552V0h51.552v-166.242a250.559 250.559 0 0 1 60.394-7.362c10.254 0 20.358.632 30.288 1.831V0Z" style={{fill:'#fff', fillOpacity:1, fillRule:'nonzero', stroke:'none'}} transform="translate(447.918 273.604)"/></g></svg>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="transition-transform duration-300 hover:-translate-y-1 hover:scale-110 inline-block"
              >
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 256"><path d="M218.123 218.127h-37.931v-59.403c0-14.165-.253-32.4-19.728-32.4-19.756 0-22.779 15.434-22.779 31.369v60.43h-37.93V95.967h36.413v16.694h.51a39.907 39.907 0 0 1 35.928-19.733c38.445 0 45.533 25.288 45.533 58.186l-.016 67.013ZM56.955 79.27c-12.157.002-22.014-9.852-22.016-22.009-.002-12.157 9.851-22.014 22.008-22.016 12.157-.003 22.014 9.851 22.016 22.008A22.013 22.013 0 0 1 56.955 79.27m18.966 138.858H37.95V95.967h37.97v122.16ZM237.033.018H18.89C8.58-.098.125 8.161-.001 18.471v219.053c.122 10.315 8.576 18.582 18.89 18.474h218.144c10.336.128 18.823-8.139 18.966-18.474V18.454c-.147-10.33-8.635-18.588-18.966-18.453" fill="#0A66C2"/></svg>
              </a>

              {/* YouTube */}
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="transition-transform duration-300 hover:-translate-y-1 hover:scale-110 inline-block"
              >
                <svg className="w-7 h-7" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 180"><path fill="red" d="M250.346 28.075A32.18 32.18 0 0 0 227.69 5.418C207.824 0 127.87 0 127.87 0S47.912.164 28.046 5.582A32.18 32.18 0 0 0 5.39 28.24c-6.009 35.298-8.34 89.084.165 122.97a32.18 32.18 0 0 0 22.656 22.657c19.866 5.418 99.822 5.418 99.822 5.418s79.955 0 99.82-5.418a32.18 32.18 0 0 0 22.657-22.657c6.338-35.348 8.291-89.1-.164-123.134Z"/><path fill="#FFF" d="m102.421 128.06 66.328-38.418-66.328-38.418z"/></svg>
              </a>

              {/* X (Twitter) */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="transition-transform duration-300 hover:-translate-y-1 hover:scale-110 inline-block"
              >
                <svg className="w-7 h-7" fill="#ffffff" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>X</title><path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z"/></svg>
              </a>
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
