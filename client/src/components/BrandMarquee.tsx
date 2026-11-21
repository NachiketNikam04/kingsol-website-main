import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../utils/assetUrl';

export interface BrandMarqueeItem {
  id?: number | string;
  name: string;
  image_url?: string | null;
  route_url?: string;
  linked_brand_id?: number | null;
  is_active?: boolean;
  isActive?: boolean;
  linked_brand?: {
    id: number;
    name: string;
    slug: string;
    category_slug?: string;
  } | null;
}

export interface BrandMarqueeProps {
  brands: BrandMarqueeItem[];
  variant?: 'landing' | 'about';
  speedSecondsPerItem?: number;
  minItemsPerSet?: number;
  className?: string;
  renderItem?: (brand: BrandMarqueeItem, index: number, key: string) => React.ReactNode;
}

export const BrandMarquee: React.FC<BrandMarqueeProps> = ({
  brands,
  variant = 'landing',
  speedSecondsPerItem = 3,
  minItemsPerSet = 10,
  className = '',
  renderItem,
}) => {
  // 1. Filter only active brands
  const activeBrands = (brands || []).filter(
    (b) => b && b.is_active !== false && b.isActive !== false
  );

  // 2. Edge case: If 0 brands are active, hide the marquee gracefully
  if (activeBrands.length === 0) {
    return null;
  }

  // 3. Dynamic Track Filling: Repeat activeBrands so a single base set has at least minItemsPerSet items
  const minItems = Math.max(1, minItemsPerSet);
  const repeatCount = Math.max(1, Math.ceil(minItems / activeBrands.length));

  const baseSet: BrandMarqueeItem[] = [];
  for (let i = 0; i < repeatCount; i++) {
    baseSet.push(...activeBrands);
  }

  // 4. Consistent Speed Scaling: Duration scales directly with number of items in baseSet
  const duration = Math.max(8, baseSet.length * speedSecondsPerItem);

  // 5. Spacing classes: Internal gap and right-padding MUST match for a 100% seamless infinite loop
  const spacingClasses =
    variant === 'about'
      ? 'gap-6 md:gap-8 pr-6 md:pr-8'
      : 'gap-8 md:gap-12 pr-8 md:pr-12';

  // 6. Default card renderer
  const defaultRenderCard = (brand: BrandMarqueeItem, _idx: number, key: string) => {
    const destination = brand.linked_brand
      ? `/brands/${brand.linked_brand.slug || brand.linked_brand.id}`
      : (brand.route_url?.trim() || null);

    const isExternal =
      destination ? (destination.startsWith('http://') || destination.startsWith('https://')) : false;

    if (variant === 'about') {
      const cardClasses = `flex items-center gap-3 px-5 py-2.5 bg-white border-4 border-[#44a0e3] rounded-2xl shadow-xs hover:shadow-lg hover:shadow-slate-200/40 transition-all duration-200 ease-out hover:scale-[1.04] active:scale-[0.98] shrink-0 ${
        destination ? 'cursor-pointer' : ''
      }`;

      const cardContent = (
        <>
          {brand.image_url ? (
            <img
              src={getAssetUrl(brand.image_url)}
              alt={brand.name}
              className="h-8 w-auto max-w-[130px] object-contain transition-transform duration-300"
            />
          ) : (
            <span className="font-bold text-sm text-slate-900">{brand.name}</span>
          )}
        </>
      );

      if (destination) {
        if (isExternal) {
          return (
            <a
              key={key}
              href={destination}
              target="_blank"
              rel="noopener noreferrer"
              className={cardClasses}
            >
              {cardContent}
            </a>
          );
        }
        return (
          <Link key={key} to={destination} className={cardClasses}>
            {cardContent}
          </Link>
        );
      }

      return (
        <div key={key} className={cardClasses}>
          {cardContent}
        </div>
      );
    }

    // Default: 'landing' hero styling (white pills on dark background)
    const cardClasses = `flex-shrink-0 flex items-center justify-center space-x-3 text-slate-900 font-bold tracking-tight text-sm md:text-base transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm rounded-xl px-6 py-2 shadow-sm ${
      destination ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''
    }`;

    const cardContent = (
      <>
        {brand.image_url ? (
          <img
            src={getAssetUrl(brand.image_url)}
            alt={brand.name}
            className="h-8 md:h-12 object-contain max-w-[180px]"
          />
        ) : (
          <span>{brand.name}</span>
        )}
      </>
    );

    if (destination) {
      if (isExternal) {
        return (
          <a
            key={key}
            href={destination}
            target="_blank"
            rel="noopener noreferrer"
            className={cardClasses}
          >
            {cardContent}
          </a>
        );
      }
      return (
        <Link key={key} to={destination} className={cardClasses}>
          {cardContent}
        </Link>
      );
    }

    return (
      <div key={key} className={cardClasses}>
        {cardContent}
      </div>
    );
  };

  const renderCard = renderItem || defaultRenderCard;

  return (
    <div
      className={`relative w-full overflow-hidden group select-none ${className}`}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    >
      <style>{`
        @keyframes brand-marquee-scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
      <div
        className="flex w-max will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          animation: `brand-marquee-scroll ${duration}s linear infinite`,
        }}
      >
        {/* Set 1 */}
        <div className={`flex items-center flex-shrink-0 ${spacingClasses}`}>
          {baseSet.map((brand, idx) => renderCard(brand, idx, `set1-${brand.id || idx}-${idx}`))}
        </div>

        {/* Set 2 (Identical Duplicate for Seamless Infinite Loop) */}
        <div className={`flex items-center flex-shrink-0 ${spacingClasses}`} aria-hidden="true">
          {baseSet.map((brand, idx) => renderCard(brand, idx, `set2-${brand.id || idx}-${idx}`))}
        </div>
      </div>
    </div>
  );
};

export default BrandMarquee;
