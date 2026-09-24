import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BlogsPageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  author: string;
  image_url: string;
  excerpt: string;
  content: string;
  published_at: string;
}

export default function Blogs() {
  const [settings, setSettings] = useState<BlogsPageSettings | null>(null);
  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogsPage() {
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/page`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.settings) setSettings(json.data.settings);
          if (Array.isArray(json.data.blogs)) setBlogs(json.data.blogs);
        }
      } catch (err) {
        console.warn('⚠️ [Blogs Page] Failed to fetch live articles:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogsPage();
  }, []);

  const currentTagline = settings?.tagline || 'KINGSOL JOURNAL & INSIGHTS';
  const currentHeadline = settings?.headline || 'News & Insights on clean energy.';
  const currentHighlightWord = settings?.highlight_word || 'Insights';
  const currentSubtitle =
    settings?.subtitle ||
    'Stay updated with the latest in solar PV technology, grid-tie inverter innovations, and renewable energy policies across India.';

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
    <div className="min-h-screen bg-[#fdfcf8] pt-40 pb-[72px] text-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Dynamic Header Hero Section */}
        <div className="mb-10">
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-brand-green block mb-8"
          >
            <span>{currentTagline}</span>
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl"
          >
            {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-slate-700 text-base md:text-lg mt-6 leading-relaxed font-normal"
          >
            {currentSubtitle}
          </motion.p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading solar journal articles...</div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center text-slate-500 border border-slate-200">
            No published articles available at this moment. Check back soon!
          </div>
        ) : (
          <>
            {/* Featured Post (50/50 Split for Newest Article) */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="mb-12 group"
            >
              <Link
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
                to={`/blogs/${blogs[0].slug}`}
              >
                {/* Left: Featured Image */}
                <div className="w-full aspect-[4/3] lg:aspect-square rounded-[2rem] overflow-hidden bg-slate-100 relative">
                  <img
                    src={getAssetUrl(blogs[0].image_url) || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=1200&auto=format&fit=crop'}
                    alt={blogs[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Right: Featured Content */}
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-[#b7f07a] text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase shadow-sm">
                      FEATURED ARTICLE
                    </span>
                    <span className="text-sm text-slate-700 font-medium">
                      {blogs[0].author} • {new Date(blogs[0].published_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-slate-900 leading-tight tracking-tight group-hover:text-[#44a0e3] transition-colors leading-tight mb-5">
                    {blogs[0].title}
                  </h2>

                  <p className="text-slate-700 text-base md:text-lg mt-1 leading-relaxed font-normal mb-5">{blogs[0].excerpt}</p>

                  <div className="flex items-center text-sm font-semibold text-slate-900 border-b border-slate-900 pb-1 group-hover:text-[#44a0e3] group-hover:border-[#44a0e3] transition-colors">
                    <span>Read Full Article</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Divider */}
            {blogs.length > 1 && (
              <>
                <div className="flex items-center justify-between mb-10">
                  <motion.h3
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mt-5 text-2xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
                  >
                    All Recent Articles
                  </motion.h3>
                </div>

                {/* Standard 3-Column Grid for Remaining Posts */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {blogs.slice(1).map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
                      className="bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-between group hover:shadow-[0_20px_40px_rgba(68,160,227,0.2)] transition-all"
                    >
                      <Link className="block flex-grow" to={`/blogs/${post.slug}`}>
                        <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-slate-100 relative">
                          <img
                            src={getAssetUrl(post.image_url) || 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop'}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-brand-blue uppercase">{post.author}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-xs text-slate-500 font-medium">
                            {new Date(post.published_at || Date.now()).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-xl md:text-2xl font-bold font-poppins text-slate-900 mb-4 group-hover:text-[#44a0e3] transition-colors leading-snug">
                          {post.title}
                        </h4>

                        <p className="mt-2 text-gray-600 font-poppins text-sm leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </Link>

                      <Link
                        to={`/blogs/${post.slug}`}
                        className="w-full bg-slate-50 group-hover:bg-[#44a0e3] group-hover:text-white text-slate-800 text-xs font-semibold py-3 rounded-xl block text-center transition-colors"
                      >
                        Read Article →
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { Blogs };
