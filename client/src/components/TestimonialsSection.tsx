import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TestimonialSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface TestimonialReview {
  id?: number;
  name: string;
  role: string;
  image_url: string | null;
  review: string;
  rating: number;
  sort_order?: number;
}

interface TestimonialData {
  settings: TestimonialSettings;
  reviews: TestimonialReview[];
}

export const TestimonialsSection: React.FC = () => {
  const [testimonialData, setTestimonialData] = useState<TestimonialData | null>(null);

  useEffect(() => {
    async function loadTestimonialData() {
      try {
        const res = await fetch(`${API_BASE_URL}/home/testimonials`);
        const json = await res.json();
        if (json.success && json.data) {
          setTestimonialData(json.data);
        }
      } catch (err) {
        console.warn('⚠️ [TestimonialsSection] Live API offline, using fallback defaults:', err);
      }
    }
    loadTestimonialData();
  }, []);

  const defaultReviews: TestimonialReview[] = [
    {
      name: 'Rajesh Sharma',
      role: 'Managing Director, Apex Steel Industries',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      review: 'Kingsol Energy transformed our industrial plant energy overhead. Their 500kW rooftop installation reduced our electricity bills by 65% in the first quarter alone.',
      rating: 5,
    },
    {
      name: 'Priya Sundaram',
      role: 'Operations Head, GreenGrid Logistics',
      image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      review: 'The B2B procurement speed and Tier-1 component quality provided by Kingsol were second to none. Net-metering approval was handled flawlessly.',
      rating: 5,
    },
    {
      name: 'Vikramaditya Mehta',
      role: 'Founder, SunRay Commercial Parks',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      review: 'Outstanding engineering support. The Feston inverter setup with zero UPS transfer time keeps our server data center online uninterrupted.',
      rating: 5,
    },
    {
      name: 'Ananya Verma',
      role: 'Chief Sustainability Officer, EcoTextiles',
      image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      review: 'Kingsol delivered our turnkey solar project 2 weeks ahead of schedule. Their post-installation monitoring app is incredibly intuitive.',
      rating: 5,
    },
  ];

  const currentTagline = testimonialData?.settings?.tagline || 'Testimonial';
  const currentHeadline = testimonialData?.settings?.headline || 'What Our Solar Clients Say';
  const currentHighlightWord = testimonialData?.settings?.highlight_word || 'Clients';
  const currentSubtitle = testimonialData?.settings?.subtitle || 'Real feedback from homeowners and businesses who trust our solar solutions.';

  const activeReviews = testimonialData?.reviews && testimonialData.reviews.length > 0 ? testimonialData.reviews : defaultReviews;
  const limitedTestimonials = activeReviews.slice(0, 30);

  // Split reviews across 3 columns
  const columnOne = limitedTestimonials.filter((_, idx) => idx % 3 === 0);
  const columnTwo = limitedTestimonials.filter((_, idx) => idx % 3 === 1);
  const columnThree = limitedTestimonials.filter((_, idx) => idx % 3 === 2);

  // Helper to ensure each column has enough cards to loop smoothly
  const ensureMinCards = (arr: TestimonialReview[], minCount = 3): TestimonialReview[] => {
    if (arr.length === 0) return limitedTestimonials;
    let result = [...arr];
    while (result.length < minCount) {
      result = [...result, ...arr];
    }
    return result;
  };

  const col1Cards = ensureMinCards(columnOne);
  const col2Cards = ensureMinCards(columnTwo);
  const col3Cards = ensureMinCards(columnThree);

  const renderDynamicHeadline = (headline: string, highlightWord: string) => {
    if (!highlightWord || !headline) return headline;

    const regex = new RegExp(`(${highlightWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = headline.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlightWord.toLowerCase() ? (
        <span key={index} className="text-[#44a0e3]">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const renderTestimonialCard = (item: TestimonialReview, key: string) => (
    <div
      key={key}
      className="bg-[#a4dfeb] rounded-2xl p-6 md:p-8 flex flex-col justify-between shrink-0 cursor-pointer w-full mb-6 shadow-xs"
    >
      <div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center border border-slate-300">
            {item.image_url ? (
              <img src={getAssetUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-700 font-bold text-lg">{item.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h4 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900">{item.name}</h4>
            <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1">{item.role}</p>
          </div>
        </div>

        <div className="flex gap-1 text-slate-900 mb-4 text-sm font-bold">
          {'★'.repeat(item.rating || 5)}
        </div>

        <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1">
          "{item.review}"
        </p>
      </div>
    </div>
  );

  return (
    <section className="w-full py-[72px] bg-[#fdfcf8] relative text-slate-900">
      <style>{`
        @keyframes marquee-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes marquee-down {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-marquee-up {
          animation: marquee-up 28s linear infinite;
        }
        .animate-marquee-down {
          animation: marquee-down 28s linear infinite;
        }
        .animate-marquee-up:hover,
        .animate-marquee-down:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. Centered Header at the Top */}
      <div className="text-center max-w-3xl mx-auto mb-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block"
        >
          {currentTagline}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mt-1 text-2xl font-poppins font-bold tracking-tight text-slate-900 leading-tight sm:text-3xl md:text-4xl shrink-0"
        >
          {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-slate-700 text-base md:text-lg mt-4 leading-relaxed font-normal max-w-2xl mx-auto"
        >
          {currentSubtitle}
        </motion.p>
      </div>

      {/* 2. 3-Column Grid with Alternating Scroll Animations */}
      <div className="max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="h-[600px] overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Animates DOWN */}
            <div className="flex flex-col animate-marquee-down">
              {[...col1Cards, ...col1Cards].map((item, index) =>
                renderTestimonialCard(item, `col1-${item.id || index}-${index}`)
              )}
            </div>

            {/* Column 2: Animates UP */}
            <div className="hidden md:flex flex-col animate-marquee-up">
              {[...col2Cards, ...col2Cards].map((item, index) =>
                renderTestimonialCard(item, `col2-${item.id || index}-${index}`)
              )}
            </div>

            {/* Column 3: Animates DOWN */}
            <div className="hidden md:flex flex-col animate-marquee-down">
              {[...col3Cards, ...col3Cards].map((item, index) =>
                renderTestimonialCard(item, `col3-${item.id || index}-${index}`)
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;