import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  ClipboardCheck,
  UserCog,
  ShieldCheck,
  Activity,
  Wrench,
  Cpu,
  BarChart3,
  Sun,
  Zap,
  Shield,
  CheckCircle2,
  Headphones,
  LifeBuoy,
  FileText,
  Settings,
  Clock,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/assetUrl';

export interface SupportSettings {
  tagline: string;
  heading: string;
  description: string;
}

export interface SupportCard {
  id?: number | string;
  title: string;
  description: string;
  icon_name: string;
  sort_order?: number;
}

// Icon mapping dictionary for dynamic database resolution
const iconMap: Record<string, LucideIcon> = {
  ClipboardCheck,
  UserCog,
  ShieldCheck,
  Activity,
  Wrench,
  Cpu,
  BarChart3,
  Sun,
  Zap,
  Shield,
  CheckCircle2,
  Headphones,
  LifeBuoy,
  FileText,
  Settings,
  Clock,
};

// Safe helper function to map icon strings to actual Lucide components
export const getCardIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Activity;
  const cleanName = iconName.trim().toLowerCase();
  const matchedKey = Object.keys(iconMap).find(
    (key) => key.toLowerCase() === cleanName
  );
  return matchedKey ? iconMap[matchedKey] : Activity;
};

// Fallback to exactly 4 default cards if API is empty or offline
const defaultCards: SupportCard[] = [
  {
    id: 1,
    title: 'Project Handover Support',
    description:
      'Comprehensive documentation, system commissioning audits, and seamless transition protocols for peak operational readiness.',
    icon_name: 'ClipboardCheck',
  },
  {
    id: 2,
    title: 'Dedicated Engineering Point of Contact',
    description:
      'Direct access to certified solar technical engineers for swift troubleshooting, preventative advice, and system optimization.',
    icon_name: 'UserCog',
  },
  {
    id: 3,
    title: 'Hassle-Free Warranty Resolution',
    description:
      'Full manufacturer-direct RMA facilitation, guaranteed replacement cycles, and transparent warranty claim management.',
    icon_name: 'ShieldCheck',
  },
  {
    id: 4,
    title: 'Remote Fault Diagnostics',
    description:
      '24/7 AI-driven real-time string monitoring, automated anomaly detection, and rapid virtual troubleshooting to minimize downtime.',
    icon_name: 'Activity',
  },
];

// Helper to highlight key words in headline
const renderHeadline = (headline: string) => {
  if (!headline) return 'Keeping your Solar system efficient.';
  const highlightRegex = /(Solar|BESS|Storage|System|Energy)/i;
  const parts = headline.split(highlightRegex);
  return parts.map((part, index) =>
    highlightRegex.test(part) ? (
      <span key={index} className="text-[#44a0e3]">
        {part}
      </span>
    ) : (
      part
    )
  );
};

// Framer Motion animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

export const MaintenanceSupportSection: React.FC = () => {
  // Phase 1: Dynamic Data & State Management
  const [settings, setSettings] = useState<SupportSettings>({
    tagline: 'MAINTENANCE & SUPPORT',
    heading: 'Keeping your Solar system efficient.',
    description: 'Ensuring smooth performance all year for reliable solar energy output.',
  });

  const [cards, setCards] = useState<SupportCard[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchSupportData() {
      try {
        // Fetch from backend endpoint (/api/home/support or /api/home/maintenance)
        let response = await fetch(`${API_BASE_URL}/home/support`);
        if (!response.ok) {
          response = await fetch(`${API_BASE_URL}/home/maintenance`);
        }

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const json = await response.json();
        if (json.success && json.data && isMounted) {
          const { settings: dbSettings, cards: dbCards } = json.data;

          if (dbSettings) {
            setSettings({
              tagline: dbSettings.tagline || 'MAINTENANCE & SUPPORT',
              heading: dbSettings.headline || dbSettings.heading || 'Keeping your Solar system efficient.',
              description: dbSettings.subtitle || dbSettings.description || 'Ensuring smooth performance all year for reliable solar energy output.',
            });
          }

          if (Array.isArray(dbCards) && dbCards.length > 0) {
            setCards(dbCards);
          } else {
            setCards(defaultCards);
          }
        }
      } catch (err) {
        console.warn('⚠️ [MaintenanceSupportSection] Live API offline or empty, using 4 fallback cards:', err);
        if (isMounted) {
          setCards(defaultCards);
        }
      }
    }

    fetchSupportData();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeCards = cards.length > 0 ? cards : defaultCards;

  return (
    <section className="w-full py-[72px] bg-[#fdfcf8] relative text-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Phase 2: Header Structure */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          {/* Tagline */}
          <span className="font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-4">
            {settings.tagline}
          </span>

          {/* Main Heading */}
          <h2 className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl">
            {renderHeadline(settings.heading)}
          </h2>

          {/* Subtitle / Description */}
          <p className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal">
            {settings.description}
          </p>
        </motion.div>

        {/* Phase 3: The Floating Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {activeCards.map((card, index) => {
            const IconComponent = getCardIcon(card.icon_name);

            return (
              <motion.div
                key={card.id || index}
                variants={cardVariants}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col items-start"
              >
                {/* 14x14 Soft-tinted square wrapper for icon */}
                <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green mb-6 group-hover:bg-brand-green group-hover:text-white transition-all duration-300 shadow-xs shrink-0">
                  <IconComponent className="w-7 h-7 stroke-[2.2]" />
                </div>

                {/* Card Title */}
                <h3 className="font-poppins text-xl font-bold mb-3 group-hover:text-brand-green transition-colors duration-300 text-slate-900">
                  {card.title}
                </h3>

                {/* Card Description */}
                <p className="text-slate-600 font-montserrat text-sm md:text-base leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Phase 4: Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-14 text-center flex justify-center"
        >
          <Link
            to="/contact"
            className="inline-flex items-center gap-2.5 bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-8 py-3.5 rounded-full font-bold text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Call Support Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default MaintenanceSupportSection;
