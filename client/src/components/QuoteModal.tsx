import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Package,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { API_BASE_URL } from '../utils/assetUrl';

interface ProductItem {
  id: string | number;
  title: string;
  brand_name?: string;
  category_name?: string;
  type?: string;
}

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
  'Outside India / International',
];

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  initialProduct = '',
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [stateName, setStateName] = useState('');
  const [productInterest, setProductInterest] = useState(initialProduct);
  const [message, setMessage] = useState('');

  // Products state for smart searchable combobox
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync initialProduct if passed
  useEffect(() => {
    if (initialProduct) {
      setProductInterest(initialProduct);
      setProductSearch(initialProduct);
    }
  }, [initialProduct]);

  // Fetch products from /api/products and /api/bess when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadCatalogProducts() {
      setLoadingProducts(true);
      try {
        const [prodRes, bessRes] = await Promise.all([
          fetch(`${API_BASE_URL}/products`).then((r) => r.json()).catch(() => ({ success: false })),
          fetch(`${API_BASE_URL}/bess`).then((r) => r.json()).catch(() => ({ success: false })),
        ]);

        const combined: ProductItem[] = [];

        if (prodRes && prodRes.success && Array.isArray(prodRes.data)) {
          prodRes.data.forEach((p: any) => {
            combined.push({
              id: `p-${p.id}`,
              title: p.title || p.name || 'Solar Product',
              brand_name: p.brand_name || p.brand || '',
              category_name: p.category_name || p.category || 'Solar',
              type: 'Solar Product',
            });
          });
        }

        if (bessRes && bessRes.success && Array.isArray(bessRes.data)) {
          bessRes.data.forEach((b: any) => {
            combined.push({
              id: `b-${b.id}`,
              title: b.title || b.name || 'BESS Storage System',
              brand_name: b.brand_name || 'BESS',
              category_name: 'BESS',
              type: 'BESS Storage',
            });
          });
        }

        if (isMounted) {
          setProductsList(combined);
        }
      } catch (err) {
        console.warn('⚠️ [QuoteModal] Catalog products fetch notice:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    loadCatalogProducts();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProductDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up auto-close timer
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, []);

  // Filter products by search query
  const filteredProducts = productsList.filter((p) => {
    const q = (productSearch || '').toLowerCase().trim();
    if (!q) return true;
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.brand_name && p.brand_name.toLowerCase().includes(q)) ||
      (p.category_name && p.category_name.toLowerCase().includes(q))
    );
  });

  const handleSelectProduct = (item: ProductItem) => {
    const label = item.brand_name ? `${item.title} (${item.brand_name})` : item.title;
    setProductInterest(label);
    setProductSearch(label);
    setIsProductDropdownOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in your name, phone number, and email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          company_name: companyName.trim(),
          state: stateName.trim(),
          product_interest: (productInterest || productSearch).trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
        // Reset form
        setName('');
        setPhone('');
        setEmail('');
        setCompanyName('');
        setStateName('');
        setProductInterest('');
        setProductSearch('');
        setMessage('');

        // Auto-close modal after 3 seconds
        autoCloseTimerRef.current = setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Failed to submit quote request. Please try again.');
      }
    } catch (err: any) {
      console.error('❌ [QuoteModal] Submission error:', err);
      setErrorMessage('Network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-poppins">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto z-10 text-slate-900"
        >
          {/* Top Decorative Green Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-green via-emerald-400 to-[#78C257]" />

          {/* Modal Header */}
          <div className="px-6 sm:px-8 pt-6 pb-4 flex items-start justify-between border-b border-slate-100 bg-slate-50/50">
            <div>
              <h2 className="font-poppins text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
                Request a Custom Quote
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Connect with our technical solar team for Tier-1 pricing, project sizing & datasheets.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0 ml-4"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="text-2xl font-bold text-slate-900 font-montserrat">
                    Quote Request Received!
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Thank you for contacting <strong className="text-slate-900">Kingsol Solar</strong>. Our engineering and sales team will review your specifications and get in touch within 24 business hours.
                  </p>
                </div>
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-brand-green hover:text-slate-900 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Done (Auto-closing...)
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* 2-Column: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Sharma"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2-Column: Email & State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="procurement@company.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      State / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select State / Region</option>
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company / EPC Firm Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Sterling Solar Solutions Pvt Ltd"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                {/* Smart Product Combobox */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Required Product / System Interest
                  </label>
                  <div className="relative">
                    <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setProductInterest(e.target.value);
                        setIsProductDropdownOpen(true);
                      }}
                      onFocus={() => setIsProductDropdownOpen(true)}
                      placeholder="Type to search or select a product (e.g. Feston Inverters, Goldi Solar, BESS)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {isProductDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto z-50 p-1.5">
                      {loadingProducts ? (
                        <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-brand-green" />
                          <span>Loading catalog items...</span>
                        </div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500">
                          <span>No catalog match found for "<strong>{productSearch}</strong>". You can still submit this custom requirement.</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectProduct(p)}
                              className="w-full text-left px-3.5 py-2 hover:bg-emerald-50/70 hover:text-emerald-950 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer group"
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-semibold text-slate-900 group-hover:text-emerald-950 truncate">
                                  {p.title}
                                </span>
                                {p.brand_name && (
                                  <span className="text-[11px] text-slate-500 group-hover:text-emerald-700 truncate">
                                    Brand: {p.brand_name}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 shrink-0">
                                {p.type || p.category_name || 'Product'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Project Requirements / Message */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Project Requirements / Capacity / Remarks
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter project capacity (e.g. 50kW On-Grid / 100kWh Storage), site location, or delivery timeline..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 rounded-full bg-brand-green hover:bg-[#68ac49] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 order-1 sm:order-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Quote Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuoteModal;
