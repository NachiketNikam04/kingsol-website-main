import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Zap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export interface DynamicBlog {
  id: number;
  title: string;
  slug: string;
  author: string;
  image_url: string;
  excerpt: string;
  content: string;
  published_at: string;
}

interface BlogSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

export const BlogSection: React.FC = () => {
  const [blogs, setBlogs] = useState<DynamicBlog[]>([]);
  const [settings, setSettings] = useState<BlogSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // Parallel safe fetching using separate try/catch
      const fetchSettingsPromise = (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/home/blogs-settings`);
          const json = await res.json();
          if (json.success && json.data) {
            setSettings(json.data);
          }
        } catch (err) {
          console.warn('⚠️ [BlogSection] Header settings offline, using fallbacks:', err);
        }
      })();

      const fetchBlogsPromise = (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/blogs?limit=3`);
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setBlogs(json.data);
          }
        } catch (err) {
          console.warn('⚠️ [BlogSection] Live blogs offline:', err);
        } finally {
          setLoading(false);
        }
      })();

      await Promise.allSettled([fetchSettingsPromise, fetchBlogsPromise]);
    }
    loadData();
  }, []);

  const currentTagline = settings?.tagline || 'BLOGS & NEWS';
  const currentHeadline = settings?.headline || 'Latest Insights';
  const currentHighlightWord = settings?.highlight_word || 'Insights';
  const currentSubtitle = settings?.subtitle || 'News, technical engineering updates, and solar market innovations.';

  const icons = [Sun, Zap, BookOpen];

  // Case-Insensitive Headline Splitting Helper
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
    <section className="w-full py-[72px] bg-[#fdfcf8] relative text-slate-900">
      {/* Section Header */}
      <div className="text-center mb-10 max-w-7xl mx-auto px-6">
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
          className="mt-4 font-poppins text-base md:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto"
        >
          {currentSubtitle}
        </motion.p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 font-medium">Loading latest articles...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12 text-slate-400">No blog articles available yet.</div>
      ) : (
        /* Bulletproof Sticky Overlapping Track Wrapper */
        <div className="max-w-7xl w-full mx-auto px-6 relative pb-12">
          {blogs.map((blog, index) => {
            const IconComponent = icons[index % icons.length];

            return (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="w-full bg-white rounded-[2.5rem] p-6 md:p-8 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] border border-slate-200 sticky mb-[15vh] last:mb-0 transition-all duration-500"
                style={{ top: `calc(10vh + ${index * 2.5}rem)` }}
              >
                {/* The Alternating Inner Flex Container */}
                <div
                  className={`flex flex-col gap-8 w-full h-full ${
                    index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  {/* Text Block */}
                  <div className="w-full md:w-1/2 bg-transparent rounded-3xl p-8 md:p-12 flex flex-col justify-center">
                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-900 mb-8 shadow-sm">
                      <IconComponent className="w-6 h-6 text-brand-orange stroke-[2.5]" />
                    </div>
                    <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-4 leading-tight">
                      {blog.title}
                    </h3>
                    <p className="mt-2 text-gray-600 font-montserrat text-sm leading-relaxed flex-1">{blog.excerpt}</p>
                    <Link
                      to={`/blogs/${blog.slug}`}
                      className="group w-fit bg-white text-[#44a0e3] border border-slate-200 px-6 py-3 rounded-full font-medium text-sm transition-all hover:bg-slate-900 hover:text-white flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <span>Read Full Article</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </Link>
                  </div>

                  {/* Media Block */}
                  <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[400px] rounded-3xl overflow-hidden relative bg-slate-100">
                    <img
                      src={getAssetUrl(blog.image_url) || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1200&auto=format&fit=crop'}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View All Blogs CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="w-full flex justify-center mt-12 relative z-10"
      >
        <Link
          className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:-translate-y-1 shadow-md hover:bg-[#44a0e3] hover:text-white hover:shadow-[0_20px_40px_rgba(243,156,18,0.15)] inline-flex w-fit items-center justify-center gap-2 cursor-pointer border border-slate-200/60 hover:border-transparent"
          to="/blogs"
        >
          <span>View All Articles</span>
          <span>→</span>
        </Link>
      </motion.div>
    </section>
  );
};

export default BlogSection;
