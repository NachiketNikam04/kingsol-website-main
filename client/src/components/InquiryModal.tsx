import { API_BASE_URL } from '../utils/assetUrl';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledItem?: string;
  productName?: string;
  product?: any;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  prefilledItem = '',
  productName = '',
  product,
}) => {
  const initialTitle = productName || prefilledItem || product?.name || '';
  const [itemName, setItemName] = useState(initialTitle);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: '',
  });

  useEffect(() => {
    setItemName(productName || prefilledItem || product?.name || '');
  }, [productName, prefilledItem, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          productName: itemName,
          inquiry_type: 'Catalog Quote Inquiry',
          message: formData.message,
        }),
      });
    } catch {
      // Fallback
    }
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          ></motion.div>

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl z-10 text-slate-900"
          >
            <button
              onClick={handleResetAndClose}
              className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>

            {submitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-[#78C257]/20 text-[#78C257] flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-bold font-lato text-slate-900 mb-2">Inquiry Submitted!</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Thank you for your interest in <strong className="text-slate-900">{itemName || 'Kingsol Solar'}</strong>. Our enterprise solar team will contact you within 2-4 hours. An automated email notification has been dispatched to our sales desk.
                </p>
                <button
                  onClick={handleResetAndClose}
                  className="bg-slate-900 text-white px-8 py-3.5 rounded-full font-medium text-xs uppercase tracking-wider hover:bg-[#44a0e3] transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <span className="text-xs font-semibold tracking-widest text-[#44a0e3] uppercase block mb-2">
                  OFFICIAL INQUIRY
                </span>
                <h3 className="text-2xl md:text-3xl font-bold font-lato text-slate-900 mb-2">Request Information</h3>
                {itemName && (
                  <p className="text-slate-600 text-sm mb-6">
                    Inquiring about <strong className="text-slate-900">{itemName}</strong>
                  </p>
                )}

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-900 uppercase">Selected Item / Product</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none text-slate-900 text-sm font-medium"
                      placeholder="Product or Brand Name"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-900 uppercase">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none text-slate-900 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-900 uppercase">Phone No. *</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none text-slate-900 text-sm"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-900 uppercase">Work Email *</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none text-slate-900 text-sm"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-900 uppercase">Project Details</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#44a0e3] outline-none text-slate-900 text-sm resize-none"
                      placeholder="Specify capacity, timeline, or site requirements..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium text-sm mt-2 hover:bg-[#44a0e3] transition-colors duration-300 cursor-pointer shadow-md"
                  >
                    Submit Official Inquiry
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InquiryModal;
