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
              <div className="text-center py-8 px-2">
                <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-[#78C257]/20 animate-ping" />
                  <span className="absolute inset-2 rounded-full bg-[#78C257]/15" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#8fd16c] to-[#5fa83f] text-white shadow-lg shadow-[#78C257]/40 ring-4 ring-white">
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <span className="mb-3 inline-block rounded-full bg-[#78C257]/10 px-3 py-1 font-poppins text-[11px] font-semibold uppercase tracking-widest text-[#4c8f2f] ring-1 ring-[#78C257]/30">
                  Submitted successfully
                </span>

                <h3 className="mb-3 text-2xl md:text-3xl font-bold tracking-tight font-poppins text-slate-900">
                  Inquiry Submitted!
                </h3>

                <p className="mx-auto mb-6 max-w-md font-poppins text-sm md:text-base text-slate-600 leading-relaxed">
                  Thank you for your interest in{" "}
                  <strong className="text-slate-900">{itemName || 'Kingsol Energy India Pvt Ltd'}</strong>.
                  Our enterprise solar team will contact you within{" "}
                  <span className="font-semibold text-[#4c8f2f]">2-4 hours</span>.
                </p>

                <div className="mx-auto mb-8 flex max-w-md items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#44a0e3] shadow-sm ring-1 ring-slate-200">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                  </div>
                  <p className="font-poppins text-xs md:text-sm leading-relaxed text-slate-600">
                    An automated email notification has been dispatched to our sales desk.
                  </p>
                </div>

                <button
                  onClick={handleResetAndClose}
                  className="cursor-pointer rounded-full bg-slate-900 px-8 py-3.5 text-xs font-medium uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#44a0e3] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#44a0e3] focus-visible:ring-offset-2 active:translate-y-0"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <span className="mb-3 font-poppins text-xs font-semibold uppercase tracking-[0.2em] sm:text-sm text-[#44a0e3] block">
                  OFFICIAL INQUIRY
                </span>
                <h3 className="text-2xl font-poppins font-bold tracking-tight shrink-0 text-slate-900 mb-2">Request Information</h3>
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
