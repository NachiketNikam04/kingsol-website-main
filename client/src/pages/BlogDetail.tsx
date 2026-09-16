import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/blogs/${slug}`);
        const json = await res.json();
        if (json.success && json.data) {
          setPost(json.data);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.warn('⚠️ [BlogDetail] Failed to load blog post:', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen bg-[#fdfcf8] pt-48 pb-24 text-center text-slate-500 font-medium">Loading article...</div>;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfcf8] text-slate-900 pt-48 pb-24">
        <h1 className="text-3xl font-extrabold font-poppins text-slate-900 mb-4">Article Not Found</h1>
        <p className="text-slate-600 mb-8">The requested journal post does not exist in our database.</p>
        <button
          onClick={() => navigate('/blogs')}
          className="text-slate-900 bg-brand-green px-8 py-3.5 rounded-full font-semibold cursor-pointer hover:bg-slate-900 hover:text-white transition-colors"
        >
          Return to Journal
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#fdfcf8] pb-[72px] text-slate-900">
      {/* Hero Image */}
      <div className="w-full h-[60vh] md:h-[75vh] relative bg-slate-900 overflow-hidden">
        <img
          src={getAssetUrl(post.image_url) || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=2000&auto=format&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full px-6 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="inline-block px-4 py-2 bg-[#9beb46] text-slate-900 rounded-full text-xs font-bold tracking-widest uppercase mb-6 shadow-md"
            >
              KINGSOL INSIGHTS
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mt-5 text-3xl md:text-4xl font-bold font-poppins text-white leading-tight tracking-tight mb-8"
            >
              {post.title}
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center gap-4 text-slate-300 text-sm font-medium"
            >
              <span>By {post.author || 'Kingsol Team'}</span>
              <span>•</span>
              <span>{new Date(post.published_at || Date.now()).toLocaleDateString()}</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="max-w-3xl mx-auto px-6 py-8 border-b border-slate-100 flex items-center gap-2 text-sm text-slate-500 font-medium">
        <Link className="hover:text-[#44a0e3] transition-colors" to="/blogs">
          Journal
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{post.title}</span>
      </div>

      {/* Article Excerpt Banner */}
      {post.excerpt && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="max-w-3xl mx-auto px-6 mt-12"
        >
          <div className="bg-white rounded-2xl p-6 border-l-4 border-[#44a0e3] border-slate-200 shadow-xs text-slate-800 text-lg leading-relaxed font-medium">
            "{post.excerpt}"
          </div>
        </motion.div>
      )}

      {/* Article Body Content with whitespace-pre-wrap styling */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-6 mt-12"
      >
        <div className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-normal space-y-6">
          {post.content}
        </div>

        {/* Share Action Bar */}
        <div className="mt-16 pt-8 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Share this article</span>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: post.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Article URL copied to clipboard!');
                }
              }}
              className="px-5 py-2.5 rounded-full bg-slate-900 text-white hover:bg-[#44a0e3] text-xs font-semibold transition-colors cursor-pointer"
            >
              Share Article ↗
            </button>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

export { BlogDetail };
