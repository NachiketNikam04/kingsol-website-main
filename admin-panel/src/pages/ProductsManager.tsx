import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import { getAssetUrl, parseDatasheets } from '../utils/assetUrl';
import ImageCropperModal from '../components/ImageCropperModal';
import {
  Package,
  Building2,
  Layers,
  Plus,
  Edit,
  Trash2,
  Upload,
  Crop,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  AlertTriangle,
  Sliders,
  FileText,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  brand_count?: number;
  product_count?: number;
}

interface BrandDoc {
  title: string;
  url: string;
}

export interface CategorizedFeatureGroup {
  category: string;
  features: string[];
}

interface Brand {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  image_url: string;
  card_image?: string;
  certifications?: string[];
  gallery?: string[];
  key_features?: string[];
  highlights?: string[];
  documents?: BrandDoc[];
  specs_image_url?: string;
  specifications_list?: string[];
  product_range_description?: string;
  product_range_features?: string[];
  specs_description?: string;
  certifications_list?: string[];
  product_range_subtitle?: string;
  company_profile_text?: string;
  company_profile_image_url?: string;
  categorized_features?: CategorizedFeatureGroup[];
  badges?: string[];
  capabilities_tagline?: string;
  capabilities_heading?: string;
  brand_highlights?: { id?: number; title: string; subtitle: string }[];
  footer_note?: string;
  category_name?: string;
  category_slug?: string;
}

interface Product {
  id: number;
  category_id: number;
  brand_id: number;
  subcategory_id?: number;
  title: string;
  name?: string;
  slug: string;
  description: string;
  long_description?: string;
  image_url: string;
  card_image?: string;
  category_banner_image?: string;
  datasheet_url: string;
  expertise?: string;
  gallery?: string[];
  key_features?: string[];
  documents?: BrandDoc[];
  specs?: Record<string, string>;
  is_featured?: boolean;
  capabilities_tagline?: string;
  capabilities_heading?: string;
  brand_highlights?: { id?: number; title: string; subtitle: string }[];
  footer_note?: string;
  brand_name?: string;
  brand_slug?: string;
  category_name?: string;
  category_slug?: string;
  subcategory_name?: string;
  subcategory_slug?: string;
}

interface ProductsPageSettings {
  tagline: string;
  headline: string;
  highlight_word: string;
  subtitle: string;
  brands_tagline: string;
  brands_title: string;
  products_tagline: string;
  products_title: string;
  brand_story_tagline?: string;
  brand_story_title?: string;
  features_title?: string;
  capabilities_title?: string;
  capabilities_footer?: string;
  docs_tagline?: string;
  docs_title?: string;
  docs_subtitle?: string;
  slider_tagline?: string;
  alternate_layout?: boolean;
}

export const ProductsManager: React.FC = () => {
  // 4 Top-Level Tabs
  const [activeTab, setActiveTab] = useState<'texts' | 'categories' | 'brands' | 'products'>('products');

  const [pageSettings, setPageSettings] = useState<ProductsPageSettings>({
    tagline: 'PORTFOLIO & PRODUCTS',
    headline: 'Authorized Tier-1 Solar Catalog.',
    highlight_word: 'Catalog.',
    subtitle: 'Explore authorized photovoltaic modules, string & hybrid inverters, and DC cabling systems engineered for commercial and industrial energy projects.',
    brands_tagline: 'AUTHORIZED MANUFACTURERS',
    brands_title: 'Partner Brands',
    products_tagline: 'COMPONENT SPECIFICATIONS',
    products_title: 'Featured Components',
    brand_story_tagline: 'BRAND BACKGROUND & ARCHITECTURE',
    brand_story_title: 'Engineering & Technology Story',
    features_title: 'Key Features & Standards',
    capabilities_title: 'Brand Highlights',
    capabilities_footer: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
    docs_tagline: 'TECHNICAL DOCUMENTATION',
    docs_title: 'Downloadable Specs & Certifications',
    docs_subtitle: 'Official Manufacturer Datasheets & Compliance PDFs',
    slider_tagline: 'COMPONENT CATALOG PORTFOLIO',
    alternate_layout: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: number; category_id: number; brand_id: number; name: string; slug: string }[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search & Category Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', tagline: '', description: '' });
  const [deletingCategoryTarget, setDeletingCategoryTarget] = useState<Category | null>(null);

  // Brand Modal States (Strict 2-Image Inputs)
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [brandModalTab, setBrandModalTab] = useState<'basic' | 'media' | 'features' | 'docs'>('basic');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: '',
    long_description: '',
    image_url: '',
    card_image: '',
    content_image_url: '',
    certificationsText: '',
    key_features: [''],
    highlights: [''],
    documents: [{ title: '', url: '' }],
    specs_image_url: '',
    specifications_list: [''],
    product_range_description: '',
    product_range_features: [''],
    specs_description: '',
    certifications_list: [''],
    product_range_subtitle: '',
    company_profile_text: '',
    company_profile_image_url: '',
    categorized_features: [{ category: 'DCR Modules', features: [''] }] as CategorizedFeatureGroup[],
    badgesText: 'Tier-1 Listed, ALMM Approved, TUV Certified, 25-Year Warranty',
    capabilities_tagline: 'CORPORATE CAPABILITIES',
    capabilities_heading: 'Brand Highlights',
    brand_highlights: [
      { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
      { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
      { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
      { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
    ] as { id?: number; title: string; subtitle: string }[],
    footer_note: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
  });

  // Product Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalTab, setProductModalTab] = useState<'basic' | 'media' | 'features' | 'docs'>('basic');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    category_id: '',
    brand_id: '',
    subcategory_id: '',
    new_category_name: '',
    is_creating_new_subcategory: false,
    new_phase_type: '',
    is_creating_new_phase_type: false,
    title: '',
    slug: '',
    description: '',
    long_description: '',
    image_url: '',
    card_image: '',
    category_banner_image: '',
    content_image_url: '',
    gallery_urls: ['', '', '', ''] as string[],
    datasheet_url: '',
    expertise: '',
    is_featured: false,
    key_features: [''],
    documents: [] as { title: string; url: string }[],
    specsJson: '{\n  "wattage": "550W",\n  "efficiency": "21.3%",\n  "warranty": "25 Years"\n}',
    capabilities_tagline: 'CORPORATE CAPABILITIES',
    capabilities_heading: 'Brand Highlights',
    brand_highlights: [
      { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
      { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
      { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
      { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
    ] as { id?: number; title: string; subtitle: string }[],
    footer_note: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
  });

  const [uploading, setUploading] = useState(false);

  // Fetch All Catalog Data & Page Settings
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, catRes, brandRes, prodRes, subRes] = await Promise.all([
        api.get('/catalog/page-settings'),
        api.get('/categories'),
        api.get('/brands'),
        api.get('/products'),
        api.get('/subcategories').catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (settingsRes.data.success) setPageSettings((prev) => ({ ...prev, ...settingsRes.data.data }));
      if (catRes.data.success) setCategories(catRes.data.data);
      if (brandRes.data.success) setBrands(brandRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (subRes.data.success && subRes.data.data) setSubcategories(subRes.data.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch catalog database records.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save Global Page & Layout Texts
  const handleSavePageSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setMessage(null);
    try {
      const res = await api.put('/catalog/page-settings', pageSettings);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Global page headlines and layout section titles updated successfully.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update catalog page settings.' });
    } finally {
      setSavingSettings(false);
    }
  };

  // Handle File Upload (Image or PDF)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        callback(fileUrl);
        setMessage({ type: 'success', text: 'File uploaded successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'File upload failed. Ensure backend server is online.' });
    } finally {
      setUploading(false);
    }
  };

  // Target Dimensions for Dedicated Brand & Product Images
  const BRAND_CARD_TARGET_WIDTH = 800;
  const BRAND_CARD_TARGET_HEIGHT = 400; // 2:1 ratio for brand grid cards

  const BRAND_HERO_TARGET_WIDTH = 1200;
  const BRAND_HERO_TARGET_HEIGHT = 675; // 16:9 ratio for hero banner

  const BRAND_SPECS_TARGET_WIDTH = 800;
  const BRAND_SPECS_TARGET_HEIGHT = 600; // 4:3 ratio for specifications image

  const BRAND_PROFILE_TARGET_WIDTH = 800;
  const BRAND_PROFILE_TARGET_HEIGHT = 600; // 4:3 ratio for company profile image

  const PRODUCT_CARD_TARGET_WIDTH = 800;
  const PRODUCT_CARD_TARGET_HEIGHT = 600; // 4:3 ratio for catalog product cards

  // Image Cropper Modal States
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImageSrc, setCropperImageSrc] = useState<string | null>(null);
  const [cropperTarget, setCropperTarget] = useState<string | null>(null);
  const [cropperFreeCrop, setCropperFreeCrop] = useState(true);
  const [cropperDimensions, setCropperDimensions] = useState<{ width: number; height: number }>({
    width: BRAND_HERO_TARGET_WIDTH,
    height: BRAND_HERO_TARGET_HEIGHT,
  });
  const [cropperTitle, setCropperTitle] = useState('Crop Image');

  // Trigger cropper on image file selection (Defaults to Freeform Crop for 100% boundary selection)
  const handleImageCropSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetField: string,
    dimensions = { width: 800, height: 600 },
    title = 'Crop Image',
    freeCrop = true
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropperImageSrc(reader.result as string);
      setCropperTarget(targetField);
      setCropperDimensions(dimensions);
      setCropperTitle(title);
      setCropperFreeCrop(freeCrop);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Upload cropped PNG file and save URL to form state
  const handleCropComplete = async (croppedFile: File) => {
    setUploading(true);
    setMessage(null);
    const formData = new FormData();
    formData.append('file', croppedFile);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && (res.data.fileUrl || res.data.url)) {
        const fileUrl = res.data.fileUrl || res.data.url;
        if (cropperTarget === 'brand.card_image') {
          setBrandForm((prev) => ({ ...prev, card_image: fileUrl }));
        } else if (cropperTarget === 'brand.image_url') {
          setBrandForm((prev) => ({ ...prev, image_url: fileUrl }));
        } else if (cropperTarget === 'brand.specs_image_url') {
          setBrandForm((prev) => ({ ...prev, specs_image_url: fileUrl }));
        } else if (cropperTarget === 'brand.company_profile_image_url') {
          setBrandForm((prev) => ({ ...prev, company_profile_image_url: fileUrl }));
        } else if (cropperTarget === 'product.card_image') {
          setProductForm((prev) => ({ ...prev, card_image: fileUrl }));
        } else if (cropperTarget?.startsWith('product.gallery_')) {
          const slotIdx = parseInt(cropperTarget.replace('product.gallery_', ''), 10);
          setProductForm((prev) => {
            const updated = [...prev.gallery_urls];
            updated[slotIdx] = fileUrl;
            return {
              ...prev,
              gallery_urls: updated,
              image_url: slotIdx === 0 ? fileUrl : (prev.image_url || fileUrl),
            };
          });
        }
        setMessage({ type: 'success', text: 'Image cropped and uploaded successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to upload cropped image.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error uploading cropped image to server.' });
    } finally {
      setUploading(false);
      setCropperOpen(false);
      setCropperImageSrc(null);
      setCropperTarget(null);
    }
  };

function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

  // CATEGORY SUBMIT & DELETE
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: categoryForm.name,
        slug: slugify(categoryForm.slug || categoryForm.name),
        tagline: categoryForm.tagline,
        description: categoryForm.description,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        setMessage({ type: 'success', text: `Category '${categoryForm.name}' updated.` });
      } else {
        await api.post('/categories', payload);
        setMessage({ type: 'success', text: `Category '${categoryForm.name}' created.` });
      }

      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save category.' });
    }
  };

  const executeCategoryDelete = async () => {
    if (!deletingCategoryTarget) return;
    try {
      await api.delete(`/categories/${deletingCategoryTarget.id}`);
      setMessage({ type: 'success', text: `Category '${deletingCategoryTarget.name}' deleted.` });
      setDeletingCategoryTarget(null);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete category.' });
    }
  };

  // BRAND EDIT & SUBMIT & DELETE
  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandModalTab('basic');
    const heroImg = brand.image_url || '';
    const contentImg = brand.gallery && brand.gallery.length > 0 ? brand.gallery[0] : '';

    // Safely parse brand_highlights structure (object with cards, array, or string)
    let parsedCards: { title: string; subtitle: string }[] = [];
    let parsedTagline = brand.capabilities_tagline;
    let parsedHeading = brand.capabilities_heading;

    let bh: any = brand.brand_highlights;
    if (typeof bh === 'string') {
      try {
        bh = JSON.parse(bh);
      } catch {}
    }

    if (Array.isArray(bh)) {
      parsedCards = bh.map((c: any) =>
        typeof c === 'string' ? { title: c, subtitle: '' } : { title: c.title || '', subtitle: c.subtitle || '' }
      );
    } else if (bh && typeof bh === 'object') {
      if (bh.tagline) parsedTagline = bh.tagline;
      if (bh.heading) parsedHeading = bh.heading;
      if (Array.isArray(bh.cards)) {
        parsedCards = bh.cards.map((c: any) =>
          typeof c === 'string' ? { title: c, subtitle: '' } : { title: c.title || '', subtitle: c.subtitle || '' }
        );
      }
    }

    // Fallback to legacy brand.highlights array if brand_highlights cards is empty
    if (parsedCards.length === 0 && brand.highlights && brand.highlights.length > 0) {
      parsedCards = brand.highlights.map((h: any) =>
        typeof h === 'string' ? { title: h, subtitle: '' } : { title: h.title || '', subtitle: h.subtitle || '' }
      );
    }

    // Only if STILL empty (e.g. creating brand from scratch without data), use standard fallback
    if (parsedCards.length === 0) {
      parsedCards = [
        { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
        { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
        { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
        { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
      ];
    }

    setBrandForm({
      category_id: brand.category_id.toString(),
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      long_description: brand.long_description || '',
      image_url: heroImg,
      card_image: (brand as any).card_image || '',
      content_image_url: contentImg,
      certificationsText: brand.certifications ? brand.certifications.join(', ') : '',
      key_features: brand.key_features && brand.key_features.length > 0 ? brand.key_features : [''],
      highlights: brand.highlights && brand.highlights.length > 0 ? brand.highlights : [''],
      documents: parseDatasheets(brand.documents).length > 0 ? parseDatasheets(brand.documents) : [{ title: '', url: '' }],
      specs_image_url: brand.specs_image_url || '',
      specifications_list: brand.specifications_list && brand.specifications_list.length > 0 ? brand.specifications_list : [''],
      product_range_description: brand.product_range_description || '',
      product_range_features: brand.product_range_features && brand.product_range_features.length > 0 ? brand.product_range_features : [''],
      specs_description: brand.specs_description || '',
      certifications_list: brand.certifications_list && brand.certifications_list.length > 0 ? brand.certifications_list : [''],
      product_range_subtitle: brand.product_range_subtitle || '',
      company_profile_text: brand.company_profile_text || '',
      company_profile_image_url: brand.company_profile_image_url || '',
      categorized_features: brand.categorized_features && brand.categorized_features.length > 0 ? brand.categorized_features : [{ category: 'DCR Modules', features: [''] }],
      badgesText: brand.badges && brand.badges.length > 0 ? brand.badges.join(', ') : 'Tier-1 Listed, ALMM Approved, TUV Certified, 25-Year Warranty',
      capabilities_tagline: parsedTagline || 'CORPORATE CAPABILITIES',
      capabilities_heading: parsedHeading || 'Brand Highlights',
      brand_highlights: parsedCards,
      footer_note: brand.footer_note || 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
    });
    setIsBrandModalOpen(true);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const certs = brandForm.certificationsText.split(',').map((s) => s.trim()).filter(Boolean);
      const cleanKeyFeatures = brandForm.key_features.filter((f) => f.trim() !== '');
      const cleanHighlights = brandForm.highlights.filter((h) => h.trim() !== '');
      const cleanDocs = brandForm.documents.filter((d) => d.title.trim() !== '' && d.url.trim() !== '');
      const cleanSpecsList = brandForm.specifications_list.filter((s) => s.trim() !== '');
      const cleanRangeFeatures = brandForm.product_range_features.filter((r) => r.trim() !== '');
      const cleanCertsList = brandForm.certifications_list.filter((c) => c.trim() !== '');
      const cleanCategorizedFeatures = brandForm.categorized_features
        .filter((cg) => cg.category.trim() !== '')
        .map((cg) => ({
          category: cg.category.trim(),
          features: cg.features.filter((f) => f.trim() !== ''),
        }));
      const cleanBadges = brandForm.badgesText.split(',').map((s) => s.trim()).filter(Boolean);
      const cleanBrandHighlights = brandForm.brand_highlights.filter(
        (h) => h.title.trim() !== '' || h.subtitle.trim() !== ''
      );
      const galleryArr = brandForm.content_image_url.trim() ? [brandForm.content_image_url.trim()] : [];

      const payload = {
        category_id: parseInt(brandForm.category_id),
        name: brandForm.name,
        slug: slugify(brandForm.slug || brandForm.name),
        description: brandForm.description,
        long_description: brandForm.long_description || brandForm.description,
        image_url: brandForm.image_url,
        card_image: brandForm.card_image || '',
        certifications: certs,
        gallery: galleryArr,
        key_features: cleanKeyFeatures,
        highlights: cleanHighlights,
        documents: cleanDocs,
        specs_image_url: brandForm.specs_image_url,
        specifications_list: cleanSpecsList,
        product_range_description: brandForm.product_range_description,
        product_range_features: cleanRangeFeatures,
        specs_description: brandForm.specs_description,
        certifications_list: cleanCertsList,
        product_range_subtitle: brandForm.product_range_subtitle,
        company_profile_text: brandForm.company_profile_text,
        company_profile_image_url: brandForm.company_profile_image_url,
        categorized_features: cleanCategorizedFeatures,
        badges: cleanBadges,
        capabilities_tagline: brandForm.capabilities_tagline,
        capabilities_heading: brandForm.capabilities_heading,
        brand_highlights: {
          tagline: brandForm.capabilities_tagline || 'CORPORATE CAPABILITIES',
          heading: brandForm.capabilities_heading || 'Brand Highlights',
          cards: cleanBrandHighlights,
        },
        footer_note: brandForm.footer_note,
      };

      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, payload);
        setMessage({ type: 'success', text: `Brand '${brandForm.name}' updated successfully.` });
      } else {
        await api.post('/brands', payload);
        setMessage({ type: 'success', text: `Brand '${brandForm.name}' created successfully.` });
      }

      setIsBrandModalOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save brand details.' });
    }
  };

  const handleBrandDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete brand '${name}' and all its products?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      setMessage({ type: 'success', text: `Brand '${name}' deleted.` });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete brand.' });
    }
  };

  // PRODUCT EDIT & SUBMIT & DELETE
  const handleEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductModalTab('basic');
    const heroImg = prod.image_url || '';
    const contentImg = prod.gallery && prod.gallery.length > 0 ? prod.gallery[0] : '';

    // Safely parse brand_highlights structure (object with cards, array, or string)
    let parsedProdCards: { title: string; subtitle: string }[] = [];
    let parsedProdTagline = prod.capabilities_tagline;
    let parsedProdHeading = prod.capabilities_heading;

    let bhProd: any = prod.brand_highlights;
    if (typeof bhProd === 'string') {
      try {
        bhProd = JSON.parse(bhProd);
      } catch {}
    }

    if (Array.isArray(bhProd)) {
      parsedProdCards = bhProd.map((c: any) =>
        typeof c === 'string' ? { title: c, subtitle: '' } : { title: c.title || '', subtitle: c.subtitle || '' }
      );
    } else if (bhProd && typeof bhProd === 'object') {
      if (bhProd.tagline) parsedProdTagline = bhProd.tagline;
      if (bhProd.heading) parsedProdHeading = bhProd.heading;
      if (Array.isArray(bhProd.cards)) {
        parsedProdCards = bhProd.cards.map((c: any) =>
          typeof c === 'string' ? { title: c, subtitle: '' } : { title: c.title || '', subtitle: c.subtitle || '' }
        );
      }
    }

    if (parsedProdCards.length === 0) {
      parsedProdCards = [
        { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
        { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
        { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
        { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
      ];
    }

    const existingGallery = prod.gallery && Array.isArray(prod.gallery) && prod.gallery.length > 0 ? prod.gallery : [heroImg].filter(Boolean);
    const gallery_urls = [
      existingGallery[0] || '',
      existingGallery[1] || '',
      existingGallery[2] || '',
      existingGallery[3] || '',
    ];

    let parsedDocs: { title: string; url: string }[] = [];
    if (Array.isArray(prod.documents) && prod.documents.length > 0) {
      parsedDocs = prod.documents
        .filter((d: any) => d && (d.url || typeof d === 'string'))
        .map((d: any) => ({
          title: typeof d === 'string' ? 'Technical Datasheet' : (d.title || 'Technical Datasheet'),
          url: typeof d === 'string' ? d : (d.url || ''),
        }))
        .filter((d) => d.url.trim() !== '');
    } else if (prod.datasheet_url && prod.datasheet_url.trim() !== '') {
      parsedDocs = [{ title: 'Technical Datasheet', url: prod.datasheet_url.trim() }];
    }

    setProductForm({
      category_id: prod.category_id.toString(),
      brand_id: prod.brand_id.toString(),
      subcategory_id: prod.subcategory_id ? prod.subcategory_id.toString() : '',
      new_category_name: '',
      is_creating_new_subcategory: false,
      new_phase_type: '',
      is_creating_new_phase_type: false,
      title: prod.title || prod.name || '',
      slug: prod.slug,
      description: prod.description || '',
      long_description: prod.long_description || prod.description || '',
      image_url: heroImg,
      card_image: (prod as any).card_image || '',
      category_banner_image: (prod as any).category_banner_image || '',
      content_image_url: contentImg,
      gallery_urls,
      datasheet_url: parsedDocs[0]?.url || prod.datasheet_url || '',
      expertise: (prod as any).phase_type || prod.expertise || '',
      is_featured: prod.is_featured || false,
      key_features: prod.key_features && prod.key_features.length > 0 ? prod.key_features.slice(0, 12) : [''],
      documents: parsedDocs,
      specsJson: JSON.stringify(prod.specs || {}, null, 2),
      capabilities_tagline: parsedProdTagline || 'CORPORATE CAPABILITIES',
      capabilities_heading: parsedProdHeading || 'Brand Highlights',
      brand_highlights: parsedProdCards,
      footer_note: prod.footer_note || 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
    });
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let parsedSpecs = {};
      try {
        parsedSpecs = JSON.parse(productForm.specsJson);
      } catch {
        alert('Invalid JSON format for Technical Specs.');
        return;
      }

      let finalSubcategoryId = productForm.subcategory_id ? parseInt(productForm.subcategory_id) : null;

      // Handle "Create New Category" on the fly
      if (productForm.is_creating_new_subcategory && productForm.new_category_name.trim()) {
        try {
          const newSubName = productForm.new_category_name.trim();
          const subRes = await api.post('/subcategories', {
            category_id: parseInt(productForm.category_id),
            brand_id: parseInt(productForm.brand_id),
            name: newSubName,
            slug: slugify(newSubName),
          });
          if (subRes.data.success && subRes.data.data) {
            finalSubcategoryId = subRes.data.data.id;
          }
        } catch (e) {
          console.warn('Subcategory creation notice:', e);
        }
      }

      const selectedCat = categories.find((c) => c.id.toString() === productForm.category_id);
      const isInverter = selectedCat?.name?.toLowerCase().includes('inverter') || selectedCat?.slug?.includes('inverter');

      const finalPhaseType =
        productForm.is_creating_new_phase_type && productForm.new_phase_type.trim()
          ? productForm.new_phase_type.trim()
          : productForm.expertise;

      const cleanKeyFeatures = productForm.key_features.filter((f) => f.trim() !== '').slice(0, 12);
      const cleanDocs = productForm.documents.filter((d) => d.title.trim() !== '' || d.url.trim() !== '');
      const primaryDatasheet = cleanDocs.find((d) => d.url.trim() !== '')?.url || '';

      const cleanGallery = productForm.gallery_urls.map((u) => u.trim()).filter(Boolean).slice(0, 4);
      if (cleanGallery.length === 0 && productForm.image_url.trim()) {
        cleanGallery.push(productForm.image_url.trim());
      }
      const primaryImage = cleanGallery[0] || productForm.image_url;

      const cleanProdHighlights = productForm.brand_highlights.filter(
        (h) => h.title.trim() !== '' || h.subtitle.trim() !== ''
      );

      const payload = {
        brand_id: parseInt(productForm.brand_id),
        subcategory_id: finalSubcategoryId,
        title: productForm.title,
        slug: slugify(productForm.slug || productForm.title),
        description: productForm.description,
        short_description: productForm.description,
        long_description: isInverter ? '' : (productForm.long_description || productForm.description),
        image_url: primaryImage,
        card_image: productForm.card_image || '',
        category_banner_image: productForm.category_banner_image || '',
        datasheet_url: primaryDatasheet,
        expertise: finalPhaseType,
        phase_type: finalPhaseType,
        is_featured: productForm.is_featured,
        gallery: cleanGallery,
        key_features: cleanKeyFeatures,
        documents: cleanDocs,
        datasheets: cleanDocs,
        specs: parsedSpecs,
        capabilities_tagline: isInverter ? '' : productForm.capabilities_tagline,
        capabilities_heading: isInverter ? '' : productForm.capabilities_heading,
        brand_highlights: isInverter
          ? null
          : {
              tagline: productForm.capabilities_tagline || 'CORPORATE CAPABILITIES',
              heading: productForm.capabilities_heading || 'Brand Highlights',
              cards: cleanProdHighlights,
            },
        footer_note: isInverter ? '' : productForm.footer_note,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        setMessage({ type: 'success', text: `Product '${productForm.title}' updated successfully.` });
      } else {
        await api.post('/products', payload);
        setMessage({ type: 'success', text: `Product '${productForm.title}' created successfully.` });
      }

      setIsProductModalOpen(false);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to save product details.' });
    }
  };

  const handleProductDelete = async (id: number, name: string) => {
    if (!window.confirm(`Delete product '${name}'?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setMessage({ type: 'success', text: `Product '${name}' deleted.` });
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete product.' });
    }
  };

  // Dropdown filtering
  const availableBrandsForProduct = productForm.category_id
    ? brands.filter((b) => b.category_id.toString() === productForm.category_id)
    : brands;

  const filteredCategories = categories.filter((c) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || c.name.toLowerCase().includes(searchLower) || c.slug.toLowerCase().includes(searchLower);
    const matchesCategory = selectedCategory === 'All' || c.name === selectedCategory || c.slug === selectedCategory || String(c.id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredBrands = brands.filter((b) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || b.name.toLowerCase().includes(searchLower) || (b.category_name && b.category_name.toLowerCase().includes(searchLower));
    const matchesCategory = selectedCategory === 'All' || b.category_name === selectedCategory || b.category_slug === selectedCategory || String(b.category_id) === String(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase().trim();

    // Match search against Product Name / Title OR Company/Brand Name
    const matchesSearch =
      !searchLower ||
      (product.title && product.title.toLowerCase().includes(searchLower)) ||
      (product.name && product.name.toLowerCase().includes(searchLower)) ||
      (product.brand_name && product.brand_name.toLowerCase().includes(searchLower)) ||
      ((product as any).company_name && (product as any).company_name.toLowerCase().includes(searchLower));

    // Match against selected category
    const matchesCategory =
      selectedCategory === 'All' ||
      product.category_name === selectedCategory ||
      product.category_slug === selectedCategory ||
      (product as any).category === selectedCategory ||
      (product.category_id && String(product.category_id) === String(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-blue tracking-widest uppercase block mb-1">
              CATALOG CMS MANAGEMENT CENTER
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Catalog Manager</h1>
            <p className="text-slate-600 text-sm mt-1">
              Manage Global Page Texts, Categories, Brands (2-Image Layouts), and Product Specifications.
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => {
                setEditingCategory(null);
                setCategoryForm({ name: '', slug: '', tagline: '', description: '' });
                setIsCategoryModalOpen(true);
              }}
              className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs"
            >
              <Plus className="w-4 h-4 text-brand-blue" />
              <span>Add Category</span>
            </button>

            <button
              onClick={() => {
                setEditingBrand(null);
                setBrandModalTab('basic');
                setBrandForm({
                  category_id: categories[0]?.id.toString() || '1',
                  name: '',
                  slug: '',
                  description: '',
                  long_description: '',
                  image_url: '',
                  card_image: '',
                  content_image_url: '',
                  certificationsText: 'Tier-1 Listed, ALMM Approved',
                  key_features: [''],
                  highlights: [''],
                  documents: [{ title: '', url: '' }],
                  specs_image_url: '',
                  specifications_list: [''],
                  product_range_description: '',
                  product_range_features: [''],
                  specs_description: '',
                  certifications_list: [''],
                  product_range_subtitle: '',
                  company_profile_text: '',
                  company_profile_image_url: '',
                  categorized_features: [{ category: 'DCR Modules', features: [''] }],
                  badgesText: 'Tier-1 Listed, ALMM Approved, TUV Certified, 25-Year Warranty',
                  capabilities_tagline: 'CORPORATE CAPABILITIES',
                  capabilities_heading: 'Brand Highlights',
                  brand_highlights: [
                    { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
                    { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
                    { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
                    { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
                  ],
                  footer_note: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
                });
                setIsBrandModalOpen(true);
              }}
              className="bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm shadow-xs"
            >
              <Plus className="w-4 h-4 text-brand-green" />
              <span>Add Brand</span>
            </button>

            <button
              onClick={() => {
                setEditingProduct(null);
                setProductModalTab('basic');
                const firstCat = categories[0]?.id.toString() || '1';
                const firstBrand = brands.find((b) => b.category_id.toString() === firstCat)?.id.toString() || brands[0]?.id.toString() || '1';
                setProductForm({
                  category_id: firstCat,
                  brand_id: firstBrand,
                  subcategory_id: '',
                  new_category_name: '',
                  is_creating_new_subcategory: false,
                  new_phase_type: '',
                  is_creating_new_phase_type: false,
                  title: '',
                  slug: '',
                  description: '',
                  long_description: '',
                  image_url: '',
                  card_image: '',
                  category_banner_image: '',
                  content_image_url: '',
                  gallery_urls: ['', '', '', ''],
                  datasheet_url: '',
                  expertise: '',
                  is_featured: false,
                  key_features: [''],
                  documents: [] as { title: string; url: string }[],
                  specsJson: '{\n  "wattage": "550W",\n  "efficiency": "21.3%",\n  "warranty": "25 Years"\n}',
                  capabilities_tagline: 'CORPORATE CAPABILITIES',
                  capabilities_heading: 'Brand Highlights',
                  brand_highlights: [
                    { title: 'Tier-1 BloombergNEF', subtitle: 'Recognized Global PV Manufacturer' },
                    { title: 'ALMM & BIS Approved', subtitle: 'MNRE Certified Module Supplier' },
                    { title: '22.8% Module Efficiency', subtitle: 'Ultra-High Power Density' },
                    { title: '25-Year Performance Warranty', subtitle: 'Linear Power Output Guarantee' },
                  ],
                  footer_note: 'Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support.',
                });
                setIsProductModalOpen(true);
              }}
              className="bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white hover:shadow-glow-orange transition-all duration-300 cursor-pointer px-5 py-2.5 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* System Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* REORGANIZED TOP-LEVEL 4 TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex bg-white border border-slate-200 p-1.5 rounded-full w-fit shadow-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('texts')}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'texts' ? 'bg-brand-green text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Tab 1: Global Page Texts</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'categories' ? 'bg-brand-green text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Tab 2: Manage Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('brands')}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'brands' ? 'bg-brand-green text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Tab 3: Manage Brands ({brands.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-5 py-2 rounded-full text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'products' ? 'bg-brand-green text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Tab 4: Manage Products ({products.length})</span>
            </button>
          </div>

          {activeTab !== 'texts' && (
            <div className="flex items-center gap-3 flex-wrap md:flex-nowrap w-full md:w-auto">
              {/* Category Filter Dropdown */}
              <div className="relative w-full sm:w-48">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full px-4 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-brand-green outline-none shadow-xs cursor-pointer appearance-none pr-8"
                  aria-label="Filter by category"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▼
                </div>
              </div>

              {/* Enhanced Search Input */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    activeTab === 'products'
                      ? 'Search by product or company name...'
                      : `Search ${activeTab}...`
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-8 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-brand-green outline-none shadow-xs"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading catalog records from database...</div>
        ) : (
          <>
            {/* TAB 1: GLOBAL PAGE TEXTS & SECTION HEADLINES */}
            {activeTab === 'texts' && (
              <form onSubmit={handleSavePageSettings} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xs max-w-4xl space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-brand-green" /> Products Page Hero Section Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tagline Badge</label>
                      <input
                        type="text"
                        value={pageSettings.tagline}
                        onChange={(e) => setPageSettings({ ...pageSettings, tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Highlight Word (Colored)</label>
                      <input
                        type="text"
                        value={pageSettings.highlight_word}
                        onChange={(e) => setPageSettings({ ...pageSettings, highlight_word: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hero Headline</label>
                      <textarea
                        rows={2}
                        value={pageSettings.headline}
                        onChange={(e) => setPageSettings({ ...pageSettings, headline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hero Subtitle</label>
                      <textarea
                        rows={3}
                        value={pageSettings.subtitle}
                        onChange={(e) => setPageSettings({ ...pageSettings, subtitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-brand-blue" /> Brand & Product Detail Layout Section Titles & Flow
                  </h3>

                  {/* ALTERNATE LAYOUT TOGGLE SWITCH */}
                  <div className="flex items-center justify-between p-4 mb-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 cursor-pointer">
                        Alternate Second Section Layout (Text Left / Image Right)
                      </label>
                      <p className="text-slate-500 text-xs mt-0.5">
                        When enabled, the second section (Story & Features) automatically positions Text on Left and Image on Right for an alternating zigzag flow.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={pageSettings.alternate_layout ?? true}
                      onChange={(e) => setPageSettings({ ...pageSettings, alternate_layout: e.target.checked })}
                      className="w-5 h-5 accent-brand-green rounded cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Story Tagline</label>
                      <input
                        type="text"
                        value={pageSettings.brand_story_tagline || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, brand_story_tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Story Title</label>
                      <input
                        type="text"
                        value={pageSettings.brand_story_title || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, brand_story_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Features Section Title</label>
                      <input
                        type="text"
                        value={pageSettings.features_title || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, features_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Capabilities Title</label>
                      <input
                        type="text"
                        value={pageSettings.capabilities_title || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, capabilities_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Docs Section Tagline</label>
                      <input
                        type="text"
                        value={pageSettings.docs_tagline || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, docs_tagline: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Docs Section Title</label>
                      <input
                        type="text"
                        value={pageSettings.docs_title || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, docs_title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Docs Section Subtitle</label>
                      <input
                        type="text"
                        value={pageSettings.docs_subtitle || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, docs_subtitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Corporate Capabilities Footer Text</label>
                      <textarea
                        rows={2}
                        value={pageSettings.capabilities_footer || ''}
                        onChange={(e) => setPageSettings({ ...pageSettings, capabilities_footer: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-brand-green text-slate-900 px-8 py-3.5 rounded-full font-bold text-sm hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                >
                  {savingSettings ? 'Saving Settings...' : 'Save Global Page Texts & Layout Titles'}
                </button>
              </form>
            )}

            {/* TAB 2: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Category Name</th>
                        <th className="px-6 py-4">URL Slug</th>
                        <th className="px-6 py-4">Tagline</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{cat.name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">/products/{cat.slug}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{cat.tagline || '—'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(cat);
                                  setCategoryForm({ name: cat.name, slug: cat.slug, tagline: cat.tagline || '', description: cat.description || '' });
                                  setIsCategoryModalOpen(true);
                                }}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4 text-brand-blue" />
                              </button>
                              <button
                                onClick={() => setDeletingCategoryTarget(cat)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: BRANDS */}
            {activeTab === 'brands' && (
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Brand Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Slug</th>
                        <th className="px-6 py-4">2-Image Layout</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBrands.map((brand) => (
                        <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{brand.name}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-slate-700">{brand.category_name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-slate-600">/products/{brand.category_slug}/{brand.slug}</td>
                          <td className="px-6 py-4 text-xs">
                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded font-semibold mr-2">
                              Hero Img Set
                            </span>
                            <span className="px-2 py-0.5 bg-brand-green/20 text-slate-900 rounded font-semibold">
                              {brand.gallery && brand.gallery[0] ? 'Content Img Set' : 'No Content Img'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditBrand(brand)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4 text-brand-blue" />
                              </button>
                              <button
                                onClick={() => handleBrandDelete(brand.id, brand.name)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Product Title</th>
                        <th className="px-6 py-4">Brand / Category</th>
                        <th className="px-6 py-4">2-Image Layout</th>
                        <th className="px-6 py-4">Docs</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{prod.title || prod.name}</td>
                          <td className="px-6 py-4 text-xs">
                            <span className="font-bold text-slate-900 block">{prod.brand_name}</span>
                            <span className="text-slate-500">{prod.category_name}</span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded font-semibold mr-2">
                              Hero Img
                            </span>
                            <span className="px-2 py-0.5 bg-brand-green/20 text-slate-900 rounded font-semibold">
                              {prod.gallery && prod.gallery[0] ? 'Content Img' : 'No Content Img'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                              {prod.documents?.length || 0} PDFs
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditProduct(prod)}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4 text-brand-blue" />
                              </button>
                              <button
                                onClick={() => handleProductDelete(prod.id, prod.title || prod.name || '')}
                                className="p-2 rounded-lg bg-slate-50 hover:bg-red-50 border border-slate-200 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* CATEGORY DELETION MODAL */}
        {deletingCategoryTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative text-slate-900">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Category '{deletingCategoryTarget.name}'?</h3>
              <p className="text-slate-600 text-sm mb-6">
                Deleting this category will permanently remove all associated Brands and Products in the database.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingCategoryTarget(null)}
                  className="px-5 py-2.5 rounded-full border border-slate-200 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeCategoryDelete}
                  className="px-5 py-2.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT CATEGORY */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-md w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>

              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="e.g. Solar Inverters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Slug</label>
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="solar-inverters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tagline</label>
                  <input
                    type="text"
                    value={categoryForm.tagline}
                    onChange={(e) => setCategoryForm({ ...categoryForm, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                    placeholder="High-efficiency string inverters..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-green text-slate-900 font-bold text-xs rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT BRAND (Strict 2-Image Inputs + Badges + Brand Highlights) */}
        {isBrandModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-auto flex flex-col max-h-[90vh] text-slate-900">
              
              {/* Fixed Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Brand Showcase'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Clean 2-Image Layout CMS: Hero Cover Image + Story Content Image.
                  </p>
                </div>
                <button
                  onClick={() => setIsBrandModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Internal Tabs (Fixed) */}
              <div className="px-6 pt-4 shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
                  <button
                    type="button"
                    onClick={() => setBrandModalTab('basic')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      brandModalTab === 'basic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 1. Basic Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandModalTab('media')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      brandModalTab === 'media' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> 2. Media (2 Images)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandModalTab('features')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      brandModalTab === 'features' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 3. Features & Highlights
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandModalTab('docs')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      brandModalTab === 'docs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 4. Documents (PDFs)
                  </button>
                </div>
              </div>

              <form onSubmit={handleBrandSubmit} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Form Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* TAB 1: BASIC INFO */}
                  {brandModalTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Parent Category</label>
                          <select
                            required
                            value={brandForm.category_id}
                            onChange={(e) => setBrandForm({ ...brandForm, category_id: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Name</label>
                          <input
                            type="text"
                            required
                            value={brandForm.name}
                            onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="Feston Inverters"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Slug</label>
                          <input
                            type="text"
                            value={brandForm.slug}
                            onChange={(e) => setBrandForm({ ...brandForm, slug: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="feston-inverters"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Range Title</label>
                          <input
                            type="text"
                            value={brandForm.product_range_description}
                            onChange={(e) => setBrandForm({ ...brandForm, product_range_description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="Comprehensive PV Inverter Solutions"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Subtitle / Description</label>
                        <textarea
                          rows={2}
                          value={brandForm.description}
                          onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Short summary description..."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Long Story / Architectural Background</label>
                        <textarea
                          rows={4}
                          value={brandForm.long_description}
                          onChange={(e) => setBrandForm({ ...brandForm, long_description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Detailed engineering story..."
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MEDIA IMAGES */}
                  {brandModalTab === 'media' && (
                    <div className="space-y-6">
                      {/* Dedicated Card Image for Brands (Modules, Cables, Inverters, etc.) */}
                      <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-sky-950 uppercase tracking-wide">
                            Dedicated Card Thumbnail Image (Displays on Brand Grid)
                          </label>
                          <span className="text-[11px] text-sky-700 font-semibold">2:1 Ratio (800&times;400)</span>
                        </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              Upload a separate thumbnail card image to ensure consistent aspect ratio and alignment on the brand cards grid. If empty, the grid will fallback to the Hero Cover Image.
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={brandForm.card_image || ''}
                                onChange={(e) => setBrandForm({ ...brandForm, card_image: e.target.value })}
                                className="flex-1 bg-white border border-sky-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue"
                                placeholder="https://... or /uploads/brand_card_thumbnail.jpg"
                              />
                              <label className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                                <Crop className="w-4 h-4" />
                                <span>{uploading ? 'Processing...' : 'Upload & Crop Image'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleImageCropSelect(
                                      e,
                                      'brand.card_image',
                                      { width: BRAND_CARD_TARGET_WIDTH, height: BRAND_CARD_TARGET_HEIGHT },
                                      'Crop Brand Card Thumbnail (800x400)'
                                    )
                                  }
                                  className="hidden"
                                />
                              </label>
                            </div>
                            {brandForm.card_image && (
                              <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs">
                                <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                                  <img
                                    src={getAssetUrl(brandForm.card_image)}
                                    alt="Card Image Preview"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-800 truncate">Cropped Brand Card</span>
                                    <span className="text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-md">
                                      800&times;400 PNG
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 truncate mb-2">{brandForm.card_image}</p>
                                  <div className="flex items-center gap-2">
                                    <label className="px-3 py-1 rounded-lg border border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                      <Crop className="w-3 h-3" />
                                      <span>Re-Crop New</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) =>
                                          handleImageCropSelect(
                                            e,
                                            'brand.card_image',
                                            { width: BRAND_CARD_TARGET_WIDTH, height: BRAND_CARD_TARGET_HEIGHT },
                                            'Crop Brand Card Thumbnail (800x400)'
                                          )
                                        }
                                        className="hidden"
                                      />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={() => setBrandForm((prev) => ({ ...prev, card_image: '' }))}
                                      className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                          </div>
                        )}
                      </div>

                      {/* Slot 1: Hero Cover Image */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                            1. Hero Cover Image (Main Brand Header Banner) *
                          </label>
                          <span className="text-[11px] text-brand-green font-bold">16:9 Widescreen (1200&times;675)</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Primary high-resolution showcase image displayed in the hero banner on the Brand Detail page.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={brandForm.image_url}
                            onChange={(e) => setBrandForm({ ...brandForm, image_url: e.target.value })}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="https://... or upload cropped image"
                          />
                          <label className="bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                            <Crop className="w-4 h-4" />
                            <span>{uploading ? 'Processing...' : 'Upload & Crop Banner'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageCropSelect(
                                  e,
                                  'brand.image_url',
                                  { width: BRAND_HERO_TARGET_WIDTH, height: BRAND_HERO_TARGET_HEIGHT },
                                  'Crop Hero Cover Banner (1200x675)'
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {brandForm.image_url && (
                          <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(brandForm.image_url)}
                                alt="Hero Cover Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800 truncate">Hero Cover Banner</span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                                  1200&times;675 PNG
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-2">{brandForm.image_url}</p>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                  <Crop className="w-3 h-3" />
                                  <span>Re-Crop New</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageCropSelect(
                                        e,
                                        'brand.image_url',
                                        { width: BRAND_HERO_TARGET_WIDTH, height: BRAND_HERO_TARGET_HEIGHT },
                                        'Crop Hero Cover Banner (1200x675)'
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setBrandForm((prev) => ({ ...prev, image_url: '' }))}
                                  className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Slot 2: Specifications Section Image */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                            2. Specifications Section Image
                          </label>
                          <span className="text-[11px] text-brand-green font-bold">Freeform Crop / Natural Ratio</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Image displayed in the Specifications and Certifications section of the Brand Detail page. Freeform crop allows selecting 100% of tall or wide images.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={brandForm.specs_image_url}
                            onChange={(e) => setBrandForm({ ...brandForm, specs_image_url: e.target.value })}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="https://... or upload cropped image"
                          />
                          <label className="bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                            <Crop className="w-4 h-4" />
                            <span>{uploading ? 'Processing...' : 'Upload & Crop Specs'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageCropSelect(
                                  e,
                                  'brand.specs_image_url',
                                  { width: BRAND_SPECS_TARGET_WIDTH, height: BRAND_SPECS_TARGET_HEIGHT },
                                  'Crop Specifications Image (Freeform / Natural Resolution)',
                                  true
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {brandForm.specs_image_url && (
                          <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(brandForm.specs_image_url)}
                                alt="Specs Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800 truncate">Specifications Image</span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                                  Freeform PNG
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-2">{brandForm.specs_image_url}</p>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                  <Crop className="w-3 h-3" />
                                  <span>Re-Crop New</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageCropSelect(
                                        e,
                                        'brand.specs_image_url',
                                        { width: BRAND_SPECS_TARGET_WIDTH, height: BRAND_SPECS_TARGET_HEIGHT },
                                        'Crop Specifications Image (Freeform / Natural Resolution)',
                                        true
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setBrandForm((prev) => ({ ...prev, specs_image_url: '' }))}
                                  className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Slot 3: Company Profile Section Right Image */}
                      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                            3. Company Profile Section Right Image
                          </label>
                          <span className="text-[11px] text-brand-green font-bold">Freeform Crop / Natural Ratio</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Image displayed in the sticky Company Profile section on the Brand Detail page. Freeform crop allows selecting 100% of tall or wide images.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={brandForm.company_profile_image_url}
                            onChange={(e) => setBrandForm({ ...brandForm, company_profile_image_url: e.target.value })}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="https://... or upload cropped image"
                          />
                          <label className="bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                            <Crop className="w-4 h-4" />
                            <span>{uploading ? 'Processing...' : 'Upload & Crop Profile'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageCropSelect(
                                  e,
                                  'brand.company_profile_image_url',
                                  { width: BRAND_PROFILE_TARGET_WIDTH, height: BRAND_PROFILE_TARGET_HEIGHT },
                                  'Crop Company Profile Image (Freeform / Natural Resolution)',
                                  true
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {brandForm.company_profile_image_url && (
                          <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(brandForm.company_profile_image_url)}
                                alt="Company Profile Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800 truncate">Company Profile Image</span>
                                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                                  Freeform PNG
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-2">{brandForm.company_profile_image_url}</p>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                  <Crop className="w-3 h-3" />
                                  <span>Re-Crop New</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageCropSelect(
                                        e,
                                        'brand.company_profile_image_url',
                                        { width: BRAND_PROFILE_TARGET_WIDTH, height: BRAND_PROFILE_TARGET_HEIGHT },
                                        'Crop Company Profile Image (Freeform / Natural Resolution)',
                                        true
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setBrandForm((prev) => ({ ...prev, company_profile_image_url: '' }))}
                                  className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: FEATURES & HIGHLIGHTS */}
                  {brandModalTab === 'features' && (
                    <div className="space-y-6">
                      {/* --- Section A: Pill Badges --- */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Certification Badges (Comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="Tier-1 Listed, ALMM Approved, TUV Certified, 25-Year Warranty"
                          value={brandForm.badgesText}
                          onChange={(e) => setBrandForm({ ...brandForm, badgesText: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                        />
                      </div>

                      {/* --- Section A: Key Features & Standards (Checklist Items) --- */}
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm">Key Features & Standards (Checklist)</h4>
                            <span className="text-[10px] text-slate-400 block">Rendered with checkmark cards on public Brand detail page</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBrandForm({ ...brandForm, key_features: [...brandForm.key_features, ''] })}
                            className="text-xs font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> + Add Feature
                          </button>
                        </div>
                        <div className="space-y-2">
                          {brandForm.key_features.map((feat, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => {
                                  const updated = [...brandForm.key_features];
                                  updated[idx] = e.target.value;
                                  setBrandForm({ ...brandForm, key_features: updated });
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                                placeholder="e.g. Multi-busbar cell technology for reduced internal resistance"
                              />
                              {brandForm.key_features.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = brandForm.key_features.filter((_, i) => i !== idx);
                                    setBrandForm({ ...brandForm, key_features: updated });
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer font-bold"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* --- Section B: Brand Highlights & Capabilities --- */}
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <h4 className="font-bold text-slate-800 text-sm">Brand Highlights & Capabilities Section</h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Section Tagline</label>
                            <input
                              type="text"
                              value={brandForm.capabilities_tagline}
                              onChange={(e) => setBrandForm({ ...brandForm, capabilities_tagline: e.target.value })}
                              placeholder="CORPORATE CAPABILITIES"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Section Heading</label>
                            <input
                              type="text"
                              value={brandForm.capabilities_heading}
                              onChange={(e) => setBrandForm({ ...brandForm, capabilities_heading: e.target.value })}
                              placeholder="Brand Highlights"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                            />
                          </div>
                        </div>

                        {/* Dynamic Highlight Cards List */}
                        <div className="space-y-3">
                          <label className="block text-xs font-semibold text-slate-700">Highlight Cards (Title & Subtitle)</label>
                          {brandForm.brand_highlights.map((item, index) => (
                            <div key={index} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <input
                                type="text"
                                placeholder="Title (e.g. Tier-1 BloombergNEF)"
                                value={item.title}
                                onChange={(e) => {
                                  const updated = [...brandForm.brand_highlights];
                                  updated[index].title = e.target.value;
                                  setBrandForm({ ...brandForm, brand_highlights: updated });
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Subtitle (e.g. Recognized Global PV Manufacturer)"
                                value={item.subtitle}
                                onChange={(e) => {
                                  const updated = [...brandForm.brand_highlights];
                                  updated[index].subtitle = e.target.value;
                                  setBrandForm({ ...brandForm, brand_highlights: updated });
                                }}
                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = brandForm.brand_highlights.filter((_, i) => i !== index);
                                  setBrandForm({ ...brandForm, brand_highlights: updated });
                                }}
                                className="text-red-500 hover:text-red-700 p-1 font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() =>
                              setBrandForm({
                                ...brandForm,
                                brand_highlights: [...(brandForm.brand_highlights || []), { title: '', subtitle: '' }],
                              })
                            }
                            className="text-xs font-semibold text-brand-blue hover:underline cursor-pointer"
                          >
                            + Add Highlight Card
                          </button>
                        </div>

                        {/* Footer Note */}
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Bottom Sub-note</label>
                          <input
                            type="text"
                            value={brandForm.footer_note}
                            onChange={(e) => setBrandForm({ ...brandForm, footer_note: e.target.value })}
                            placeholder="Authorized B2B Channel Procurement Partner..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Specifications Section Intro Text</label>
                        <textarea
                          rows={2}
                          value={brandForm.specs_description}
                          onChange={(e) => setBrandForm({ ...brandForm, specs_description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Introductory paragraph for specs & certifications section..."
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Certifications & Compliance Bullet Points</label>
                          <button
                            type="button"
                            onClick={() => setBrandForm({ ...brandForm, certifications_list: [...brandForm.certifications_list, ''] })}
                            className="text-xs font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Cert Bullet
                          </button>
                        </div>
                        <div className="space-y-2">
                          {brandForm.certifications_list.map((cert, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={cert}
                                onChange={(e) => {
                                  const updated = [...brandForm.certifications_list];
                                  updated[idx] = e.target.value;
                                  setBrandForm({ ...brandForm, certifications_list: updated });
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none"
                                placeholder="e.g. BIS / ALMM Certified Quality"
                              />
                              {brandForm.certifications_list.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = brandForm.certifications_list.filter((_, i) => i !== idx);
                                    setBrandForm({ ...brandForm, certifications_list: updated });
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Range Section Subtitle</label>
                        <input
                          type="text"
                          value={brandForm.product_range_subtitle}
                          onChange={(e) => setBrandForm({ ...brandForm, product_range_subtitle: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Subtitle for product ranges section..."
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Company Profile Paragraph Text</label>
                        <textarea
                          rows={4}
                          value={brandForm.company_profile_text}
                          onChange={(e) => setBrandForm({ ...brandForm, company_profile_text: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Detailed company profile and history paragraph..."
                        />
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block">Categorized Features (Sub-Headings & Bullets)</label>
                            <span className="text-[10px] text-slate-400">Add category blocks (e.g. DCR Modules) and bullet points underneath</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBrandForm({ ...brandForm, categorized_features: [...brandForm.categorized_features, { category: '', features: [''] }] })}
                            className="text-xs font-bold text-brand-blue hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Sub-Heading Group
                          </button>
                        </div>

                        <div className="space-y-4">
                          {brandForm.categorized_features.map((group, groupIdx) => (
                            <div key={groupIdx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={group.category}
                                  onChange={(e) => {
                                    const updated = [...brandForm.categorized_features];
                                    updated[groupIdx].category = e.target.value;
                                    setBrandForm({ ...brandForm, categorized_features: updated });
                                  }}
                                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                                  placeholder="Sub-heading (e.g., DCR Modules)..."
                                />
                                {brandForm.categorized_features.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = brandForm.categorized_features.filter((_, i) => i !== groupIdx);
                                      setBrandForm({ ...brandForm, categorized_features: updated });
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              <div className="pl-3 border-l-2 border-slate-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase text-slate-500">Feature Bullet Points</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...brandForm.categorized_features];
                                      updated[groupIdx].features.push('');
                                      setBrandForm({ ...brandForm, categorized_features: updated });
                                    }}
                                    className="text-[11px] font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <Plus className="w-3 h-3" /> Add Bullet
                                  </button>
                                </div>
                                {group.features.map((feat, featIdx) => (
                                  <div key={featIdx} className="flex gap-2">
                                    <input
                                      type="text"
                                      value={feat}
                                      onChange={(e) => {
                                        const updated = [...brandForm.categorized_features];
                                        updated[groupIdx].features[featIdx] = e.target.value;
                                        setBrandForm({ ...brandForm, categorized_features: updated });
                                      }}
                                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
                                      placeholder="Bullet point..."
                                    />
                                    {group.features.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updated = [...brandForm.categorized_features];
                                          updated[groupIdx].features = updated[groupIdx].features.filter((_, i) => i !== featIdx);
                                          setBrandForm({ ...brandForm, categorized_features: updated });
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DOCUMENTS & CERTS */}
                  {brandModalTab === 'docs' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Certifications (Comma Separated)</label>
                        <input
                          type="text"
                          value={brandForm.certificationsText}
                          onChange={(e) => setBrandForm({ ...brandForm, certificationsText: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Tier-1 Listed, ALMM Approved"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Downloadable PDF Documents</label>
                          <button
                            type="button"
                            onClick={() => setBrandForm({ ...brandForm, documents: [...brandForm.documents, { title: '', url: '' }] })}
                            className="text-xs font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Document
                          </button>
                        </div>
                        <div className="space-y-3">
                          {brandForm.documents.map((doc, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                              <input
                                type="text"
                                value={doc.title}
                                onChange={(e) => {
                                  const updated = [...brandForm.documents];
                                  updated[idx].title = e.target.value;
                                  setBrandForm({ ...brandForm, documents: updated });
                                }}
                                className="md:col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                                placeholder="Doc Title"
                              />
                              <input
                                type="text"
                                value={doc.url}
                                onChange={(e) => {
                                  const updated = [...brandForm.documents];
                                  updated[idx].url = e.target.value;
                                  setBrandForm({ ...brandForm, documents: updated });
                                }}
                                className="md:col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                                placeholder="PDF URL"
                              />
                              <label className="md:col-span-1 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer flex items-center justify-center p-2 text-xs font-bold text-slate-700">
                                <Upload className="w-3.5 h-3.5 text-brand-green" />
                                <input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) =>
                                    handleFileUpload(e, (url) => {
                                      const updated = [...brandForm.documents];
                                      updated[idx].url = url;
                                      setBrandForm({ ...brandForm, documents: updated });
                                    })
                                  }
                                  className="hidden"
                                />
                              </label>
                              {brandForm.documents.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = brandForm.documents.filter((_, i) => i !== idx);
                                    setBrandForm({ ...brandForm, documents: updated });
                                  }}
                                  className="md:col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsBrandModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-green text-slate-900 font-bold text-xs rounded-xl hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Save Brand Showcase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: ADD / EDIT PRODUCT (Strict 2-Image Inputs) */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-auto flex flex-col max-h-[90vh] text-slate-900">
              
              {/* Fixed Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingProduct ? `Edit Product: ${editingProduct.title}` : 'Add New Solar Component'}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Clean 2-Image Layout CMS: Hero Cover Image + Story Content Image.
                  </p>
                </div>
                <button
                  onClick={() => setIsProductModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Product Modal Internal Tabs (Fixed) */}
              <div className="px-6 pt-4 shrink-0">
                <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto gap-1">
                  <button
                    type="button"
                    onClick={() => setProductModalTab('basic')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      productModalTab === 'basic' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 1. Basic Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalTab('media')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      productModalTab === 'media' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> 2. Media (Up to 4 Images)
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalTab('features')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      productModalTab === 'features' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 3. Features & Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalTab('docs')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                      productModalTab === 'docs' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> 4. Documents (PDFs)
                  </button>
                </div>
              </div>

              <form onSubmit={handleProductSubmit} className="flex flex-col flex-1 overflow-hidden">
                {/* Scrollable Form Body */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                  {/* TAB 1: BASIC INFO */}
                  {productModalTab === 'basic' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                          <select
                            required
                            value={productForm.category_id}
                            onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value, brand_id: '', subcategory_id: '' })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Brand Showcase</label>
                          <select
                            required
                            value={productForm.brand_id}
                            onChange={(e) => setProductForm({ ...productForm, brand_id: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Brand</option>
                            {availableBrandsForProduct.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                            {(() => {
                              const selCat = categories.find((c) => c.id.toString() === productForm.category_id);
                              return selCat?.name?.toLowerCase().includes('inverter') || selCat?.slug?.includes('inverter')
                                ? 'Inverter Type / Category'
                                : 'Subcategory / Series';
                            })()}
                          </label>
                          <select
                            value={productForm.is_creating_new_subcategory ? 'create_new' : productForm.subcategory_id}
                            onChange={(e) => {
                              if (e.target.value === 'create_new') {
                                setProductForm({ ...productForm, is_creating_new_subcategory: true, subcategory_id: '' });
                              } else {
                                setProductForm({ ...productForm, is_creating_new_subcategory: false, subcategory_id: e.target.value });
                              }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          >
                            <option value="">Select Category / Series (Default)</option>
                            {(() => {
                              const rawSubcats = subcategories.filter(
                                (s) =>
                                  (!productForm.category_id || s.category_id.toString() === productForm.category_id) &&
                                  (!productForm.brand_id || s.brand_id.toString() === productForm.brand_id)
                              );

                              // Strictly deduplicate by lowercase name
                              const uniqueMap = new Map<string, typeof subcategories[0]>();
                              rawSubcats.forEach((s) => {
                                const key = (s.name || s.slug || '').trim().toLowerCase();
                                if (key && !uniqueMap.has(key)) {
                                  uniqueMap.set(key, s);
                                }
                              });
                              const cleanSubcats = Array.from(uniqueMap.values());

                              if (cleanSubcats.length === 0) return null;

                              return (
                                <optgroup label="Existing Categories">
                                  {cleanSubcats.map((s) => (
                                    <option key={s.id} value={s.id.toString()}>
                                      {s.name}
                                    </option>
                                  ))}
                                </optgroup>
                              );
                            })()}
                            <option value="create_new">+ Create New Category</option>
                          </select>

                          {productForm.is_creating_new_subcategory && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={productForm.new_category_name}
                                onChange={(e) => setProductForm({ ...productForm, new_category_name: e.target.value })}
                                className="w-full bg-white border border-brand-green rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                                placeholder="Type custom category name (e.g., String Inverter 100kW)"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Title</label>
                        <input
                          type="text"
                          required
                          value={productForm.title}
                          onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Feston 100kW On-Grid String Inverter"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">URL Slug</label>
                          <input
                            type="text"
                            value={productForm.slug}
                            onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="feston-100kw-inverter"
                          />
                        </div>
                        <div>
                          {categories.find((c) => c.id.toString() === productForm.category_id)?.name?.toLowerCase().includes('inverter') ? (
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phase Type</label>
                              <select
                                value={productForm.is_creating_new_phase_type ? 'create_new' : productForm.expertise}
                                onChange={(e) => {
                                  if (e.target.value === 'create_new') {
                                    setProductForm({ ...productForm, is_creating_new_phase_type: true, expertise: '' });
                                  } else {
                                    setProductForm({ ...productForm, is_creating_new_phase_type: false, expertise: e.target.value });
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                              >
                                <option value="">Select Phase Type</option>
                                <option value="Single Phase">Single Phase</option>
                                <option value="Three Phase">Three Phase</option>
                                <option value="Split Phase">Split Phase</option>
                                {Array.from(
                                  new Set(
                                    products
                                      .map((p) => (p as any).phase_type || p.expertise)
                                      .filter(Boolean)
                                      .map((s: string) => s.trim())
                                      .filter((s: string) => !['Single Phase', 'Three Phase', 'Split Phase'].includes(s))
                                  )
                                ).map((pt, ptIdx) => (
                                  <option key={ptIdx} value={pt}>
                                    {pt}
                                  </option>
                                ))}
                                <option value="create_new">+ Create New Phase Type</option>
                              </select>

                              {productForm.is_creating_new_phase_type && (
                                <div className="mt-2">
                                  <input
                                    type="text"
                                    value={productForm.new_phase_type}
                                    onChange={(e) =>
                                      setProductForm({
                                        ...productForm,
                                        new_phase_type: e.target.value,
                                        expertise: e.target.value,
                                      })
                                    }
                                    className="w-full bg-white border border-brand-green rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none"
                                    placeholder="Type custom phase type (e.g. Single Phase 230V)"
                                    required
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Technical Sub-Badge / Expertise Tag
                              </label>
                              <input
                                type="text"
                                value={productForm.expertise}
                                onChange={(e) => setProductForm({ ...productForm, expertise: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                                placeholder="Commercial & Industrial Solar"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {categories.find((c) => c.id.toString() === productForm.category_id)?.name?.toLowerCase().includes('inverter') && (
                        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">
                              Upload Inverter Category Banner (Displays on Portfolio Page)
                            </label>
                            <span className="text-[11px] text-emerald-700 font-medium">Split-layout hero image</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={productForm.category_banner_image || ''}
                              onChange={(e) => setProductForm({ ...productForm, category_banner_image: e.target.value })}
                              className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                              placeholder="https://... or /uploads/inverter_banner.jpg"
                            />
                            <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                              <Upload className="w-4 h-4" />
                              <span>{uploading ? '...' : 'Upload Banner'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleFileUpload(e, (url) => {
                                    setProductForm((prev) => ({ ...prev, category_banner_image: url }));
                                  })
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                          {productForm.category_banner_image && (
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(productForm.category_banner_image)}
                                alt="Category Banner Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Description</label>
                        <textarea
                          rows={2}
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder="Short summary..."
                        />
                      </div>

                      {!categories.find((c) => c.id.toString() === productForm.category_id)?.name?.toLowerCase().includes('inverter') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Long Description (Detailed Overview)</label>
                          <textarea
                            rows={4}
                            value={productForm.long_description}
                            onChange={(e) => setProductForm({ ...productForm, long_description: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                            placeholder="Full product technical description..."
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={productForm.is_featured}
                          onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                          className="w-5 h-5 accent-brand-green rounded cursor-pointer"
                        />
                        <label htmlFor="is_featured" className="text-sm font-semibold text-slate-800 cursor-pointer">
                          Feature on Homepage ("Products We Deliver" section)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: UP TO 4 GALLERY IMAGES */}
                  {productModalTab === 'media' && (
                    <div className="space-y-4">
                      {/* Dedicated Card Image for Products (Modules, Cables, Inverters, etc.) */}
                      <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/90 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-sky-950 uppercase tracking-wide">
                            Dedicated Card Thumbnail Image (Displays on Catalog Grid)
                          </label>
                          <span className="text-[11px] text-sky-700 font-semibold">Catalog Grid View (800&times;600)</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Upload a separate thumbnail card image to ensure consistent aspect ratio and alignment on the catalog grid. If empty, the grid will fallback to the Hero Cover Image.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={productForm.card_image || ''}
                            onChange={(e) => setProductForm({ ...productForm, card_image: e.target.value })}
                            className="flex-1 bg-white border border-sky-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="https://... or /uploads/card_thumbnail.jpg"
                          />
                          <label className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                            <Crop className="w-4 h-4" />
                            <span>{uploading ? 'Processing...' : 'Upload & Crop Image'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageCropSelect(
                                  e,
                                  'product.card_image',
                                  { width: PRODUCT_CARD_TARGET_WIDTH, height: PRODUCT_CARD_TARGET_HEIGHT },
                                  'Crop Product Card Thumbnail (800x600)'
                                )
                              }
                              className="hidden"
                            />
                          </label>
                        </div>
                        {productForm.card_image && (
                          <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-sky-200 shadow-2xs">
                            <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                              <img
                                src={getAssetUrl(productForm.card_image)}
                                alt="Card Image Preview"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800 truncate">Cropped Product Card</span>
                                <span className="text-[10px] bg-sky-100 text-sky-700 font-semibold px-2 py-0.5 rounded-md">
                                  800&times;600 PNG
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate mb-2">{productForm.card_image}</p>
                              <div className="flex items-center gap-2">
                                <label className="px-3 py-1 rounded-lg border border-sky-300 text-sky-700 hover:bg-sky-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                  <Crop className="w-3 h-3" />
                                  <span>Re-Crop New</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleImageCropSelect(
                                        e,
                                        'product.card_image',
                                        { width: PRODUCT_CARD_TARGET_WIDTH, height: PRODUCT_CARD_TARGET_HEIGHT },
                                        'Crop Product Card Thumbnail (800x600)'
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => setProductForm((prev) => ({ ...prev, card_image: '' }))}
                                  className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase">
                          Product Image Gallery / Specifications (Up to 4 Images)
                        </label>
                        <span className="text-xs text-slate-400 font-semibold">Max 4 photos</span>
                      </div>

                      {[0, 1, 2, 3].map((imgIdx) => (
                        <div key={imgIdx} className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                              Image {imgIdx + 1} {imgIdx === 0 ? '(Hero Cover Image / Primary View)' : `(Gallery Angle View ${imgIdx + 1})`}
                            </label>
                            <span className="text-[11px] text-brand-green font-bold">Freeform PNG</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={productForm.gallery_urls[imgIdx] || ''}
                              onChange={(e) => {
                                const updated = [...productForm.gallery_urls];
                                updated[imgIdx] = e.target.value;
                                setProductForm({
                                  ...productForm,
                                  gallery_urls: updated,
                                  image_url: imgIdx === 0 ? e.target.value : (productForm.image_url || e.target.value),
                                });
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                              placeholder={`https://... or upload/crop image ${imgIdx + 1}`}
                            />
                            <label className="bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors shadow-xs">
                              <Crop className="w-4 h-4" />
                              <span>{uploading ? 'Processing...' : 'Upload & Crop (Freeform)'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                  handleImageCropSelect(
                                    e,
                                    `product.gallery_${imgIdx}`,
                                    { width: 800, height: 800 },
                                    `Crop Product Image ${imgIdx + 1} (Freeform)`,
                                    true
                                  )
                                }
                                className="hidden"
                              />
                            </label>
                          </div>
                          {productForm.gallery_urls[imgIdx] && (
                            <div className="mt-2 flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
                              <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
                                <img
                                  src={getAssetUrl(productForm.gallery_urls[imgIdx])}
                                  alt={`Preview ${imgIdx + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    Product View {imgIdx + 1}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                                    Freeform PNG
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 truncate mb-2">
                                  {productForm.gallery_urls[imgIdx]}
                                </p>
                                <div className="flex items-center gap-2">
                                  <label className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer flex items-center gap-1">
                                    <Crop className="w-3 h-3" />
                                    <span>Re-Crop New</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleImageCropSelect(
                                          e,
                                          `product.gallery_${imgIdx}`,
                                          { width: 800, height: 800 },
                                          `Crop Product Image ${imgIdx + 1} (Freeform)`,
                                          true
                                        )
                                      }
                                      className="hidden"
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...productForm.gallery_urls];
                                      updated[imgIdx] = '';
                                      setProductForm((prev) => ({
                                        ...prev,
                                        gallery_urls: updated,
                                        image_url: imgIdx === 0 ? (updated.find(Boolean) || '') : prev.image_url,
                                      }));
                                    }}
                                    className="px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 3: FEATURES & SPECS */}
                  {productModalTab === 'features' && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">
                            Key Features Bullet Points ({productForm.key_features.length}/12)
                          </label>
                          <button
                            type="button"
                            disabled={productForm.key_features.length >= 12}
                            onClick={() => {
                              if (productForm.key_features.length < 12) {
                                setProductForm({ ...productForm, key_features: [...productForm.key_features, ''] });
                              }
                            }}
                            className={`text-xs font-bold flex items-center gap-1 ${
                              productForm.key_features.length >= 12
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-brand-green hover:underline cursor-pointer'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Feature (Max 12)
                          </button>
                        </div>
                        <div className="space-y-2">
                          {productForm.key_features.map((feat, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={feat}
                                onChange={(e) => {
                                  const updated = [...productForm.key_features];
                                  updated[idx] = e.target.value;
                                  setProductForm({ ...productForm, key_features: updated });
                                }}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 outline-none"
                                placeholder={`Feature ${idx + 1}...`}
                              />
                              {productForm.key_features.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = productForm.key_features.filter((_, i) => i !== idx);
                                    setProductForm({ ...productForm, key_features: updated });
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Technical Specs (JSON Key-Value Pairs)</label>
                        <textarea
                          rows={4}
                          value={productForm.specsJson}
                          onChange={(e) => setProductForm({ ...productForm, specsJson: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                          placeholder='{\n  "wattage": "550W"\n}'
                        />
                      </div>

                      {/* Render Corporate Capabilities & Brand Highlights ONLY for Non-Inverter Products */}
                      {!categories.find((c) => c.id.toString() === productForm.category_id)?.name?.toLowerCase().includes('inverter') && (
                        <div className="space-y-4 pt-4 border-t border-slate-200">
                          <h4 className="font-bold text-slate-800 text-sm">Corporate Capabilities & Brand Highlights</h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Section Tagline</label>
                              <input
                                type="text"
                                value={productForm.capabilities_tagline}
                                onChange={(e) => setProductForm({ ...productForm, capabilities_tagline: e.target.value })}
                                placeholder="CORPORATE CAPABILITIES"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1">Section Heading</label>
                              <input
                                type="text"
                                value={productForm.capabilities_heading}
                                onChange={(e) => setProductForm({ ...productForm, capabilities_heading: e.target.value })}
                                placeholder="Brand Highlights"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm"
                              />
                            </div>
                          </div>

                          {/* Dynamic Highlight Cards List */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="block text-xs font-semibold text-slate-700">Highlight Cards (Title & Subtitle)</label>
                              <button
                                type="button"
                                onClick={() =>
                                  setProductForm({
                                    ...productForm,
                                    brand_highlights: [...productForm.brand_highlights, { title: '', subtitle: '' }],
                                  })
                                }
                                className="text-xs font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" /> + Add Highlight Card
                              </button>
                            </div>

                            {productForm.brand_highlights.map((item, index) => (
                              <div key={index} className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl border border-slate-200">
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Card Title (e.g., Tier-1 BloombergNEF)"
                                    value={item.title}
                                    onChange={(e) => {
                                      const updated = [...productForm.brand_highlights];
                                      updated[index].title = e.target.value;
                                      setProductForm({ ...productForm, brand_highlights: updated });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-900"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Card Subtitle (e.g., Recognized Global PV Manufacturer)"
                                    value={item.subtitle}
                                    onChange={(e) => {
                                      const updated = [...productForm.brand_highlights];
                                      updated[index].subtitle = e.target.value;
                                      setProductForm({ ...productForm, brand_highlights: updated });
                                    }}
                                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-600"
                                  />
                                </div>
                                {productForm.brand_highlights.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = productForm.brand_highlights.filter((_, i) => i !== index);
                                      setProductForm({ ...productForm, brand_highlights: updated });
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer text-xs font-bold"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Bottom Sub-note</label>
                            <input
                              type="text"
                              value={productForm.footer_note}
                              onChange={(e) => setProductForm({ ...productForm, footer_note: e.target.value })}
                              placeholder="Authorized B2B Channel Procurement Partner with Factory Direct Warranty Support."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: DOCUMENTS / DATASHEETS */}
                  {productModalTab === 'docs' && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <label className="text-xs font-bold text-slate-700 uppercase block">
                              Downloadable Product Datasheets & Documents (PDFs)
                            </label>
                            <span className="text-xs text-slate-400">
                              Add technical datasheets, user manuals, and compliance documentation.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setProductForm({
                                ...productForm,
                                documents: [...productForm.documents, { title: '', url: '' }],
                              })
                            }
                            className="text-xs font-bold text-brand-green hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Datasheet / Document
                          </button>
                        </div>

                        {productForm.documents.length === 0 ? (
                          <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs text-slate-500 font-medium">No datasheets added yet.</p>
                            <button
                              type="button"
                              onClick={() =>
                                setProductForm({
                                  ...productForm,
                                  documents: [{ title: '', url: '' }],
                                })
                              }
                              className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                            >
                              + Add First Datasheet
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {productForm.documents.map((doc, idx) => (
                              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <input
                                  type="text"
                                  value={doc.title}
                                  onChange={(e) => {
                                    const updated = [...productForm.documents];
                                    updated[idx].title = e.target.value;
                                    setProductForm({ ...productForm, documents: updated });
                                  }}
                                  className="md:col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                                  placeholder="Document Title (e.g. Technical Datasheet, User Manual)"
                                />
                                <input
                                  type="text"
                                  value={doc.url}
                                  onChange={(e) => {
                                    const updated = [...productForm.documents];
                                    updated[idx].url = e.target.value;
                                    setProductForm({
                                      ...productForm,
                                      documents: updated,
                                      datasheet_url: idx === 0 ? e.target.value : productForm.datasheet_url,
                                    });
                                  }}
                                  className="md:col-span-5 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                                  placeholder="PDF URL (/uploads/... or https://...)"
                                />
                                <label className="md:col-span-1 bg-slate-200 hover:bg-slate-300 rounded-xl cursor-pointer flex items-center justify-center p-2 text-xs font-bold text-slate-700">
                                  <Upload className="w-3.5 h-3.5 text-brand-green" />
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) =>
                                      handleFileUpload(e, (url) => {
                                        const updated = [...productForm.documents];
                                        updated[idx].url = url;
                                        if (!updated[idx].title) {
                                          updated[idx].title = 'Technical Datasheet';
                                        }
                                        setProductForm({
                                          ...productForm,
                                          documents: updated,
                                          datasheet_url: idx === 0 ? url : productForm.datasheet_url,
                                        });
                                      })
                                    }
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = productForm.documents.filter((_, i) => i !== idx);
                                    setProductForm({
                                      ...productForm,
                                      documents: updated,
                                      datasheet_url: updated[0]?.url || '',
                                    });
                                  }}
                                  className="md:col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer flex items-center justify-center"
                                  title="Delete this datasheet"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="p-6 border-t border-slate-200 flex justify-end gap-3 shrink-0 bg-slate-50 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-green text-slate-900 font-bold text-xs rounded-full hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* REUSABLE IMAGE CROPPER MODAL (FREEFORM OR EXACT TARGET DIMENSIONS & PNG TRANSPARENCY) */}
        <ImageCropperModal
          isOpen={cropperOpen}
          imageSrc={cropperImageSrc}
          title={cropperTitle}
          targetWidth={cropperDimensions.width}
          targetHeight={cropperDimensions.height}
          freeCrop={cropperFreeCrop}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setCropperOpen(false);
            setCropperImageSrc(null);
            setCropperTarget(null);
          }}
        />
      </main>
      </div>
    </div>
  );
};

export default ProductsManager;
