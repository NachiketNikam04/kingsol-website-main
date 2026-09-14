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

  const columnOne = activeReviews.filter((_, idx) => idx % 2 === 0);
  const columnTwo = activeReviews.filter((_, idx) => idx % 2 !== 0);

  // FIX: Use ONE shared duration for both columns, based on the longer column,
  // so both marquees move at the exact same speed. Only direction differs (via animation-direction: reverse).
  const marqueeDuration = Math.max(Math.max(columnOne.length, columnTwo.length) * 15, 15);

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

  return (
    <section className="w-full pt-14 pb-20 bg-[#fdfcf8] relative flex justify-center text-slate-900">
      <style>{`
        /* FIX: Single shared keyframe for both columns. Direction is flipped
           purely via CSS animation-direction: reverse — no second keyframe needed. */
        @keyframes marquee-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .animate-marquee-vertical {
          animation-name: marquee-vertical;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* DESKTOP VIEW (Vertical Marquees) */}
      <div className="hidden md:block w-full">
        <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column (Static Text) */}
          <div className="lg:col-span-4 flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="text-brand-green uppercase tracking-widest text-sm mb-4 font-bold"
            >
              {currentTagline}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="mt-5 text-5xl md:text-6xl font-bold font-poppins text-slate-900 leading-tight max-w-2xl tracking-tight"
            >
              {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal"
            >
              {currentSubtitle}
            </motion.p>
          </div>

          {/* Right Column (Tight Centered Flex Container with Bi-Directional Vertical Marquees) */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-8 h-[600px] overflow-hidden relative [mask-image:linear-gradient(to_bottom,transparent,black_5%,black_95%,transparent)] flex justify-center gap-6"
          >

            {/* Column 1 (Even Cards - Downward Animation) */}
            {/* FIX: same class + same duration as Column 2, direction flipped via inline style */}
            <div
              className="flex flex-col w-full max-w-[300px] animate-marquee-vertical"
              style={{
                animationDuration: `${marqueeDuration / 2.0}s`,
                animationDirection: 'reverse',
              }}
            >
              {[...columnOne, ...columnOne].map((item, index) => (
                <div
                  key={`${item.id || index}-${index}`}
                  className="bg-[#a4dfeb] rounded-2xl p-6 md:p-8 flex flex-col justify-between shrink-0 cursor-pointer w-full min-h-[340px] mb-6"
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
                        <h4 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb">{item.name}</h4>
                        <p className="text-slate-600 leading-relaxed mb">{item.role}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 text-slate-900 mb-4 text-sm font-bold">
                      {'★'.repeat(item.rating || 5)}
                    </div>

                    <p className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed mb-4">
                      "{item.review}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Column 2 Wrapper (Odd Cards - Staggered Offset & Upward Animation) */}
            <div className="pt-12">
              <div
                className="flex flex-col w-full max-w-[300px] animate-marquee-vertical"
                style={{ animationDuration: `${marqueeDuration}s` }}
              >
                {[...columnTwo, ...columnTwo].map((item, index) => (
                  <div
                    key={`${item.id || index}-${index}`}
                    className="bg-[#a4dfeb] rounded-2xl p-6 md:p-8 flex flex-col justify-between shrink-0 cursor-pointer w-full min-h-[340px] mb-6"
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
                          <h4 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb">{item.name}</h4>
                          <p className="text-slate-600 leading-relaxed mb">{item.role}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 text-slate-900 mb-4 text-sm font-bold">
                        {'★'.repeat(item.rating || 5)}
                      </div>

                      <p className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed mb-4">
                        "{item.review}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </div>

      {/* MOBILE VIEW (Horizontal Swipeable Carousel) */}
      <div className="block md:hidden w-full">
        {/* Mobile Header */}
        <div className="px-6 mb-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-brand-green uppercase tracking-widest text-sm mb-4 font-bold"
          >
            {currentTagline}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mt-5 text-4xl sm:text-5xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
          >
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-slate-700 text-base sm:text-lg mt-4 leading-relaxed font-normal"
          >
            {currentSubtitle}
          </motion.p>
        </div>

        {/* Swipeable Scroll-Snap Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="w-full overflow-x-auto snap-x snap-mandatory flex gap-4 px-6 pb-6 pt-2 select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {activeReviews.map((item, index) => (
            <div
              key={item.id || index}
              className="snap-center min-w-[85vw] sm:min-w-[300px] shrink-0 bg-[#a4dfeb] rounded-2xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer min-h-[340px]"
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
                    <h4 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb">{item.name}</h4>
                    <p className="text-slate-600 leading-relaxed mb">{item.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 text-slate-900 mb-4 text-sm font-bold">
                  {'★'.repeat(item.rating || 5)}
                </div>

                <p className="mt-4 font-poppins text-base md:text-lg text-slate-600 leading-relaxed mb-4">
                  "{item.review}"
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;