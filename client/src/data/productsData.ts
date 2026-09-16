import { API_BASE_URL, getAssetUrl, parseDatasheets } from '../utils/assetUrl';

export interface Product {
  id: string | number;
  slug: string;
  name: string;
  category: string; // Category Slug or Name
  categorySlug?: string;
  brand: string;    // Brand Slug or Name
  brandSlug?: string;
  brandName: string;
  description: string;
  image: string;
  card_image?: string;
  cardImage?: string;
  datasheetUrl?: string;
  datasheet_url?: string;
  documents?: any;
  expertise?: string;
  gallery?: string[];
  specs: Record<string, string>;
  subcategory_slug?: string;
}

export interface Brand {
  id?: number;
  slug: string;
  name: string;
  category: string; // Category Slug or Name
  categorySlug?: string;
  description: string;
  image: string;
  card_image?: string;
  cardImage?: string;
  image_url?: string;
  documents?: any;
  certifications?: string[];
}

export interface Category {
  id?: number;
  slug: string;
  name: string;
  tagline?: string;
  description?: string;
  brand_count?: number;
  product_count?: number;
}

// Fallback Default Static Catalog
export const initialCategories: Category[] = [
  {
    slug: 'solar-modules',
    name: 'Solar Modules',
    tagline: 'Tier-1 photovoltaic modules engineered for maximum energy yield and extreme durability.',
    brand_count: 2,
    product_count: 3,
  },
  {
    slug: 'solar-inverters',
    name: 'Solar Inverters',
    tagline: 'High-efficiency string, hybrid, and micro inverters with smart telemetry and grid management.',
    brand_count: 1,
    product_count: 1,
  },
  {
    slug: 'solar-cables',
    name: 'Solar Cables',
    tagline: 'TUV-certified DC solar cables designed to minimize transmission loss and endure extreme weather.',
    brand_count: 1,
    product_count: 1,
  },
];

export const initialBrands: Brand[] = [
  {
    id: 1,
    slug: 'goldi-solar',
    name: 'Goldi Solar',
    category: 'solar-modules',
    categorySlug: 'solar-modules',
    description: 'High-efficiency PV modules engineered for extreme durability and maximum output across commercial arrays.',
    image: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
    certifications: ['Tier-1 Listed', 'ALMM Approved', 'TUV Certified', '25-Year Warranty'],
  },
  {
    id: 2,
    slug: 'vikram-solar',
    name: 'Vikram Solar',
    category: 'solar-modules',
    categorySlug: 'solar-modules',
    description: 'Tier-1 solar panels with robust performance records across global utility-scale projects.',
    image: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
    certifications: ['Tier-1 Listed', 'BIS Certified', 'PID Resistant', '27-Year Warranty'],
  },
  {
    id: 3,
    slug: 'feston-inverters',
    name: 'Feston Inverters',
    category: 'solar-inverters',
    categorySlug: 'solar-inverters',
    description: 'Advanced on-grid, hybrid, and micro inverters designed for seamless grid tie and energy storage.',
    image: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
    certifications: ['CE Certified', 'IP65 Weatherproof', 'Grid Compliant', '10-Year Warranty'],
  },
  {
    id: 4,
    slug: 'apar-cables',
    name: 'Apar Cables',
    category: 'solar-cables',
    categorySlug: 'solar-cables',
    description: 'TUV-certified DC solar cables engineered for electron-beam cross-linked insulation.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    certifications: ['TUV 2PfG 1169', 'EN 50618', 'Halogen Free', '25-Year Lifespan'],
  },
];

export const initialProducts: Product[] = [
  {
    id: 1,
    slug: 'goldi-heloc-pro-550w',
    name: 'Goldi HELOC Pro 550W Mono PERC',
    category: 'solar-modules',
    categorySlug: 'solar-modules',
    brand: 'goldi-solar',
    brandSlug: 'goldi-solar',
    brandName: 'Goldi Solar',
    description: '144-cell monocrystalline module with up to 21.3% efficiency and multi-busbar technology.',
    image: 'https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop',
    datasheetUrl: '/datasheets/goldi-550w.pdf',
    expertise: 'Goldi HELOC Pro series delivers exceptional performance under high ambient temperature conditions.',
    gallery: ['https://images.unsplash.com/photo-1509391366360-1e5088f170af?q=80&w=800&auto=format&fit=crop'],
    specs: {
      wattage: '550W',
      efficiency: '21.3%',
      cellType: 'Mono PERC',
      warranty: '25-Year Performance',
      rating: 'IP68 Junction Box',
    },
    subcategory_slug: 'mono-perc',
  },
  {
    id: 2,
    slug: 'goldi-heloc-plus-540w',
    name: 'Goldi HELOC Plus 540W Bifacial Module',
    category: 'solar-modules',
    categorySlug: 'solar-modules',
    brand: 'goldi-solar',
    brandSlug: 'goldi-solar',
    brandName: 'Goldi Solar',
    description: 'Dual-glass bifacial PV module generating up to 25% extra energy yield from ground reflection.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop',
    datasheetUrl: '/datasheets/goldi-540w-bifacial.pdf',
    expertise: 'Designed for utility-scale solar farms and elevated commercial sheds.',
    gallery: ['https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop'],
    specs: {
      wattage: '540W',
      efficiency: '21.0%',
      cellType: 'Bifacial Mono PERC',
      warranty: '30-Year Performance',
      rating: '1500V DC System',
    },
    subcategory_slug: 'bifacial',
  },
  {
    id: 3,
    slug: 'vikram-somera-545w',
    name: 'Vikram Somera Grand Ultima 545W',
    category: 'solar-modules',
    categorySlug: 'solar-modules',
    brand: 'vikram-solar',
    brandSlug: 'vikram-solar',
    brandName: 'Vikram Solar',
    description: 'Ultra-high efficiency monocrystalline module with advanced anti-PID cell technology.',
    image: 'https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop',
    datasheetUrl: '/datasheets/vikram-545w.pdf',
    expertise: 'Vikram Somera modules are engineered with heavy-duty anodized aluminum alloy frames.',
    gallery: ['https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=800&auto=format&fit=crop'],
    specs: {
      wattage: '545W',
      efficiency: '21.1%',
      cellType: 'Mono PERC Half-Cut',
      warranty: '27-Year Linear Performance',
      rating: 'Class A Fire Safety',
    },
    subcategory_slug: 'somera-series',
  },
  {
    id: 4,
    slug: 'feston-ongrid-10kw',
    name: 'Feston On-Grid Commercial Inverter 10kW',
    category: 'solar-inverters',
    categorySlug: 'solar-inverters',
    brand: 'feston-inverters',
    brandSlug: 'feston-inverters',
    brandName: 'Feston Inverters',
    description: 'Dual MPPT string inverter with 98.6% peak efficiency and built-in Wi-Fi monitoring.',
    image: 'https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop',
    datasheetUrl: '/datasheets/feston-10kw-ongrid.pdf',
    expertise: 'Feston On-Grid 10kW features fanless natural cooling and surge protection devices.',
    gallery: ['https://images.unsplash.com/photo-1620283085439-3f721bc62f92?q=80&w=800&auto=format&fit=crop'],
    specs: {
      wattage: '10kW',
      efficiency: '98.6%',
      mpptTrackers: 'Dual MPPT',
      warranty: '10-Year Standard',
      protection: 'IP65 Rated',
    },
    subcategory_slug: 'on-grid',
  },
  {
    id: 5,
    slug: 'apar-4sqmm-dc-cable',
    name: 'Apar 4 sq mm Single Core DC Solar Cable',
    category: 'solar-cables',
    categorySlug: 'solar-cables',
    brand: 'apar-cables',
    brandSlug: 'apar-cables',
    brandName: 'Apar Cables',
    description: 'Cross-linked polyolefin insulated copper DC solar cable for panel-to-inverter wiring.',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop',
    datasheetUrl: '/datasheets/apar-4sqmm-cable.pdf',
    expertise: 'Features tinned flexible copper conductors with XLPO insulation.',
    gallery: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop'],
    specs: {
      cableSize: '4 sq mm',
      conductor: 'Tinned Annealed Copper',
      rating: '1500V DC Working Voltage',
      warranty: '25-Year Lifespan',
      protection: 'UV & Flame Retardant',
    },
    subcategory_slug: 'dc-solar-cables',
  },
];

export function getBrandBySlug(brandSlug: string): Brand | undefined {
  return initialBrands.find((b) => b.slug === brandSlug);
}

export function getProductBySlug(productSlug: string): Product | undefined {
  return initialProducts.find((p) => p.slug === productSlug);
}

export async function fetchLiveCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (error) {
    console.warn('⚠️ [Live Catalog] Falling back to default categories:', error);
  }
  return initialCategories;
}

export async function fetchLiveCatalog(): Promise<{
  categories: Category[];
  brands: Brand[];
  products: Product[];
}> {
  try {
    const [catRes, brandRes, prodRes] = await Promise.all([
      fetch(`${API_BASE_URL}/categories`),
      fetch(`${API_BASE_URL}/brands`),
      fetch(`${API_BASE_URL}/products`),
    ]);

    if (!catRes.ok || !brandRes.ok || !prodRes.ok) throw new Error('Catalog fetch failed');

    const catJson = await catRes.json();
    const brandJson = await brandRes.json();
    const prodJson = await prodRes.json();

    const categories: Category[] = catJson.success ? catJson.data : initialCategories;

    const brands: Brand[] = brandJson.success
      ? brandJson.data.map((b: any) => ({
          id: b.id,
          slug: b.slug,
          name: b.name,
          category: b.category_slug || b.category_name,
          categorySlug: b.category_slug,
          description: b.description || '',
          image: b.card_image
            ? getAssetUrl(b.card_image)
            : getAssetUrl(b.image_url),
          card_image: b.card_image ? getAssetUrl(b.card_image) : undefined,
          cardImage: b.card_image ? getAssetUrl(b.card_image) : undefined,
          image_url: getAssetUrl(b.image_url),
          documents: parseDatasheets(b.documents),
          certifications: b.certifications || [],
        }))
      : initialBrands;

    const products: Product[] = prodJson.success
      ? prodJson.data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          name: p.title || p.name,
          category: p.category_slug || p.category_name,
          categorySlug: p.category_slug,
          brand: p.brand_slug || p.brand_name,
          brandSlug: p.brand_slug,
          brandName: p.brand_name,
          description: p.description || '',
          image: p.card_image
            ? getAssetUrl(p.card_image)
            : getAssetUrl(p.image_url || (Array.isArray(p.gallery) && p.gallery[0]) || ''),
          card_image: p.card_image ? getAssetUrl(p.card_image) : undefined,
          cardImage: p.card_image ? getAssetUrl(p.card_image) : undefined,
          datasheetUrl: getAssetUrl(p.datasheet_url),
          datasheet_url: getAssetUrl(p.datasheet_url),
          documents: parseDatasheets(p.documents),
          expertise: p.expertise || '',
          gallery: Array.isArray(p.gallery) && p.gallery.length > 0
            ? p.gallery.map((url: string) => getAssetUrl(url))
            : [getAssetUrl(p.image_url)],
          specs: p.specs || {},
          subcategory_slug: p.subcategory_slug || '',
        }))
      : initialProducts;

    return { categories, brands, products };
  } catch (error) {
    console.warn('⚠️ [Live Catalog] Backend offline. Using initial catalog:', error);
    return {
      categories: initialCategories,
      brands: initialBrands,
      products: initialProducts,
    };
  }
}
