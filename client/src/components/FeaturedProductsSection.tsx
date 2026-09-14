import { API_BASE_URL, getAssetUrl } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ShowcaseSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
}

interface ProductItem {
  id: number;
  title: string;
  name?: string;
  slug: string;
  image_url?: string;
  card_image?: string;
  gallery?: string[];
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
  brand_slug?: string;
}

interface ShowcaseData {
  settings: ShowcaseSettings;
  products: ProductItem[];
}

export const FeaturedProductsSection: React.FC = () => {
  const [showcaseData, setShowcaseData] = useState<ShowcaseData | null>(null);

  useEffect(() => {
    async function loadShowcaseData() {
      try {
        const [showcaseRes, featProdRes] = await Promise.all([
          fetch(`${API_BASE_URL}/home/showcase`),
          fetch(`${API_BASE_URL}/products?featured=true`),
        ]);
        const showcaseJson = await showcaseRes.json();
        const featProdJson = await featProdRes.json();

        let fetchedProducts: ProductItem[] = [];
        if (featProdJson.success && Array.isArray(featProdJson.data) && featProdJson.data.length > 0) {
          fetchedProducts = featProdJson.data;
        } else if (showcaseJson.success && showcaseJson.data?.products) {
          fetchedProducts = showcaseJson.data.products;
        }

        setShowcaseData({
          settings: showcaseJson.data?.settings || {
            tagline: 'FEATURED PICKS',
            headline: 'Products we Deliver',
            highlight_word: 'Deliver',
            subtitle: 'Featured products from our portfolio — click through to product pages',
          },
          products: fetchedProducts,
        });
      } catch (err) {
        console.warn('⚠️ [FeaturedProductsSection] Live API offline, using fallback defaults:', err);
      }
    }
    loadShowcaseData();
  }, []);

  const fallbackProducts: ProductItem[] = [
    {
      id: 1,
      title: 'Goldi HELOC Pro 550W Mono PERC',
      slug: 'goldi-heloc-pro-550w',
      image_url: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?auto=format&fit=crop&w=600&q=80',
      category_name: 'SOLAR MODULES',
      category_slug: 'solar-modules',
      brand_slug: 'goldi-solar',
    },
    {
      id: 2,
      title: 'Feston On-Grid Commercial Inverter 10kW',
      slug: 'feston-ongrid-10kw',
      image_url: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?auto=format&fit=crop&w=600&q=80',
      category_name: 'SOLAR INVERTERS',
      category_slug: 'solar-inverters',
      brand_slug: 'feston-inverters',
    },
    {
      id: 3,
      title: 'Vikram Somera Grand Ultima 545W',
      slug: 'vikram-somera-545w',
      image_url: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?auto=format&fit=crop&w=600&q=80',
      category_name: 'SOLAR MODULES',
      category_slug: 'solar-modules',
      brand_slug: 'vikram-solar',
    },
    {
      id: 4,
      title: 'Apar 4 sq mm Single Core DC Solar Cable',
      slug: 'apar-4sqmm-dc-cable',
      image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
      category_name: 'SOLAR CABLES',
      category_slug: 'solar-cables',
      brand_slug: 'apar-cables',
    },
  ];

  const currentTagline = showcaseData?.settings?.tagline || 'FEATURED PICKS';
  const currentHeadline = showcaseData?.settings?.headline || 'Products we Deliver';
  const currentHighlightWord = showcaseData?.settings?.highlight_word || 'Deliver';
  const currentSubtitle = showcaseData?.settings?.subtitle || 'Featured products from our portfolio — click through to product pages';

  const activeProducts = showcaseData?.products && showcaseData.products.length > 0 ? showcaseData.products : fallbackProducts;

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

  const defaultImageFallback = 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=80';

  return (
    <section className="w-full pt-24 pb-20 bg-[#fdfcf8] overflow-hidden text-slate-900">
      {/* Header Area */}
      <div className="text-center max-w-3xl mx-auto px-6 mb-16">
        <motion.span
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-brand-green uppercase tracking-widest text-sm mt-10 mb-4 font-bold block"
        >
          {currentTagline}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-5xl md:text-6xl font-bold font-poppins text-slate-900 leading-tight tracking-tight"
        >
          {renderDynamicHeadline(currentHeadline, currentHighlightWord)}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-slate-700 text-base md:text-lg mt-3 leading-relaxed font-normal"
        >
          {currentSubtitle}
        </motion.p>
      </div>

      {/* Marquee Track Wrapper with Gradient Mask Edges */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="relative flex overflow-x-hidden group [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
      >
        <div className="flex animate-marquee whitespace-nowrap gap-6 py-4 pr-6 group-hover:[animation-play-state:paused] w-max">
          {[...activeProducts, ...activeProducts].map((product, index) => {
            const displayImg = (product.card_image ? getAssetUrl(product.card_image) : '') || (product.image_url ? getAssetUrl(product.image_url) : '') || (product.gallery?.[0] ? getAssetUrl(product.gallery[0]) : '') || defaultImageFallback;
            const categoryBadge = product.category_name || product.brand_name || 'SOLAR CATALOG';
            const detailRoute = `/products/${product.category_slug || 'solar-modules'}/${product.brand_slug || 'goldi-solar'}/${product.slug}`;

            return (
              <Link
                key={`${product.id}-${index}`}
                to={detailRoute}
                className="w-[320px] md:w-[380px] shrink-0 bg-white border border-slate-200/60 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 hover:border-white hover:shadow-[0_10px_30px_rgba(68,160,227,0.2)] hover:-translate-y-1 group/card"
              >
                {/* Image Container (h-48) */}
                <div className="w-full h-48 bg-white rounded-xl mb-6 overflow-hidden relative border border-slate-200/50 flex items-center justify-center p-2">
                  <img
                    src={displayImg}
                    alt={product.title || product.name}
                    className="w-full h-full object-cover rounded-lg group/card:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = defaultImageFallback;
                    }}
                  />
                </div>

                {/* Category Tag */}
                <span className="text-slate-600 font-bold leading-relaxed mb-2">
                  {categoryBadge}
                </span>

                {/* Product Name */}
                <h3 className="text-lg font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-3 whitespace-normal line-clamp-2 leading-snug group-hover/card:text-[#44a0e3] transition-colors">
                  {product.title || product.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
};

export default FeaturedProductsSection;
