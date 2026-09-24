import { getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Award,
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  Package,
  FileText,
  Home,
  ChevronDown,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Sparkles,
  Users,
  Building2,
  Layers,
  Shield,
  Wrench,
  MessageSquareQuote,
  Send,
  Info,
  SlidersHorizontal,
  UserCheck,
  MapPin,
  Palette,
  Image as ImageIcon,
  Video,
  ToggleLeft,
  Zap,
} from 'lucide-react';
import api from '../api/api';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadInquiries, setUnreadInquiries] = useState(0);
  const [unreadApps, setUnreadApps] = useState(0);
  const [unreadQuotes, setUnreadQuotes] = useState(0);
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Dropdown Toggle States
  const isHomeActive = location.pathname.startsWith('/dashboard/home');
  const isAboutActive = location.pathname.startsWith('/dashboard/about');
  const isCareersActive =
    location.pathname === '/dashboard/careers/settings' || location.pathname === '/dashboard/careers/jobs';

  const [isHomeDropdownOpen, setIsHomeDropdownOpen] = useState(isHomeActive);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(isAboutActive);
  const [isCareersDropdownOpen, setIsCareersDropdownOpen] = useState(isCareersActive);

  useEffect(() => {
    if (isHomeActive) setIsHomeDropdownOpen(true);
    if (isAboutActive) setIsAboutDropdownOpen(true);
    if (isCareersActive) setIsCareersDropdownOpen(true);
  }, [isHomeActive, isAboutActive, isCareersActive]);

  useEffect(() => {
    const fetchBadgesAndBranding = async () => {
      try {
        const resStats = await api.get('/admin/dashboard-stats');
        if (resStats.data.success) {
          setUnreadInquiries(resStats.data.data.unreadInquiries || 0);
          setUnreadApps(resStats.data.data.unreadApplications || 0);
          setUnreadQuotes(resStats.data.data.unreadQuotes || 0);
        }
      } catch {
        // Silent catch
      }

      try {
        const resBrand = await api.get('/branding');
        if (resBrand.data.success && resBrand.data.data) {
          setLogoUrl(resBrand.data.data.logo_url || '');
        }
      } catch {
        // Silent catch
      }
    };

    fetchBadgesAndBranding();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Quote Requests', path: '/dashboard/quotes', icon: MessageSquareQuote, badge: unreadQuotes },
    { name: 'Contact Inquiries', path: '/dashboard/inquiries', icon: MessageSquare, badge: unreadInquiries },
    { name: 'Job Applications', path: '/dashboard/careers', icon: UserCheck, badge: unreadApps },
    { name: 'Services Hub', path: '/dashboard/services', icon: Wrench },
    { name: 'Products & Brands', path: '/dashboard/products', icon: Package },
    { name: 'BESS Management', path: '/dashboard/bess', icon: Zap },
    { name: 'Blogs & News', path: '/dashboard/blogs', icon: FileText },
    { name: 'Gallery Hub', path: '/dashboard/gallery', icon: ImageIcon },
    { name: 'Media Videos', path: '/dashboard/media', icon: Video },
    { name: 'Certificates', path: '/dashboard/certificates', icon: Award },
    { name: 'Contact Page', path: '/dashboard/contact', icon: MapPin },
    { name: 'Footer Manager', path: '/dashboard/footer', icon: SlidersHorizontal },
    { name: 'Brand Settings', path: '/dashboard/branding', icon: Palette },
    { name: 'Feature Toggles', path: '/dashboard/feature-flags', icon: ToggleLeft },
  ];

  const homeSubItems = [
    { name: 'Main Landing (Hero)', path: '/dashboard/home/hero', icon: Sparkles },
    { name: 'About Section', path: '/dashboard/home/about', icon: Users },
    { name: 'Partners Section', path: '/dashboard/home/partners', icon: Building2 },
    { name: 'Our Solutions', path: '/dashboard/home/solutions', icon: Layers },
    { name: 'All Products (Showcase)', path: '/dashboard/home/products', icon: Package },
    { name: 'Why Choose Kingsol', path: '/dashboard/home/why-choose-us', icon: Shield },
    { name: 'Maintenance & Support', path: '/dashboard/home/maintenance', icon: Wrench },
    { name: 'Testimonials', path: '/dashboard/home/testimonials', icon: MessageSquareQuote },
    { name: 'Blog Section', path: '/dashboard/home/blogs', icon: FileText },
    { name: 'Free Quote Settings', path: '/dashboard/home/quote', icon: Send },
  ];

  const aboutSubItems = [
    { name: 'Hero Section', path: '/dashboard/about/hero', icon: Sparkles },
    { name: 'Who We Are', path: '/dashboard/about/who-we-are', icon: Users },
    { name: 'Foundation Section', path: '/dashboard/about/foundation', icon: Layers },
    { name: 'Warehouse Presence', path: '/dashboard/about/warehouse', icon: MapPin },
    { name: 'Careers CTA', path: '/dashboard/about/careers-cta', icon: Briefcase },
  ];

  const careersSubItems = [
    { name: 'Page Content', path: '/dashboard/careers/settings', icon: SlidersHorizontal },
    { name: 'Manage Openings', path: '/dashboard/careers/jobs', icon: Briefcase },
  ];

  return (
    <aside className="w-64 flex-shrink-0 h-full overflow-y-auto bg-white border-r border-slate-200 flex flex-col justify-between p-6 shadow-xs">
      <div>
        {/* Dynamic Brand Logo Header */}
        <div className="flex items-center gap-3 mb-8 px-2">
          {logoUrl ? (
            <img
              src={getAssetUrl(logoUrl)}
              alt="Kingsol Logo"
              className="w-10 h-10 rounded-xl object-contain bg-white border border-slate-200 p-1 shadow-xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-blue to-brand-green flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
              K
            </div>
          )}
          <div className="truncate">
            <h1 className="text-lg font-bold text-slate-900 leading-tight truncate">Kingsol Portal</h1>
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue" /> Admin v1.0
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase px-3 block mb-3">
            Content & Inbox
          </span>

          {/* Standard Nav Items */}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={
                  item.path === '/dashboard' ||
                  item.path === '/dashboard/services' ||
                  item.path === '/dashboard/careers' ||
                  item.path === '/dashboard/contact' ||
                  item.path === '/dashboard/branding'
                }
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-green/20 text-slate-900 font-bold border-r-4 border-brand-green'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-blue transition-colors'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-brand-orange text-slate-900 text-[11px] font-black px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Collapsible Home Page Dropdown */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsHomeDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isHomeActive
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4 text-brand-blue" />
                <span>Home Page</span>
              </div>
              {isHomeDropdownOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Sub-links */}
            {isHomeDropdownOpen && (
              <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1.5 space-y-1 transition-all duration-300">
                {homeSubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-blue/10 text-brand-blue font-bold border-l-2 border-brand-blue'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <SubIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sub.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapsible About Page Dropdown */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsAboutDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isAboutActive
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-brand-green" />
                <span>About Page</span>
              </div>
              {isAboutDropdownOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Sub-links */}
            {isAboutDropdownOpen && (
              <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1.5 space-y-1 transition-all duration-300">
                {aboutSubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-blue/10 text-brand-blue font-bold border-l-2 border-brand-blue'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <SubIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sub.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>

          {/* Collapsible Careers Page Dropdown */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsCareersDropdownOpen((prev) => !prev)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isCareersActive
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-brand-orange" />
                <span>Careers Page</span>
              </div>
              {isCareersDropdownOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Sub-links */}
            {isCareersDropdownOpen && (
              <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1.5 space-y-1 transition-all duration-300">
                {careersSubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <NavLink
                      key={sub.name}
                      to={sub.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-blue/10 text-brand-blue font-bold border-l-2 border-brand-blue'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <SubIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{sub.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Admin Profile & Logout */}
      <div className="pt-6 border-t border-slate-200">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500">Logged in as:</p>
          <p className="text-sm font-bold text-slate-900 truncate">admin@kingsol.com</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white hover:bg-red-50 hover:text-red-600 text-slate-700 text-sm font-semibold transition-colors border border-slate-200 shadow-xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
