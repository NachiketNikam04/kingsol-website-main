import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloatingContact: React.FC = () => {
  const [hoveredButton, setHoveredButton] = useState<'whatsapp' | 'email' | null>(null);

  const whatsappNumber = '918483835826';
  const whatsappMessage = encodeURIComponent('Hi! I am interested in your solar products.');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const emailUrl = 'mailto:info@kingsol.in?subject=Website%20Inquiry';

  return (
    <div className="fixed bottom-24 right-5 sm:right-7 z-[90] flex flex-col gap-3.5 items-end pointer-events-auto select-none">
      
      {/* WhatsApp Action Button */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="relative flex items-center"
        onMouseEnter={() => setHoveredButton('whatsapp')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <AnimatePresence>
          {hoveredButton === 'whatsapp' && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-16 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-md pointer-events-none z-20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366]"></span>
              <span>Chat on WhatsApp</span>
            </motion.div>
          )}
        </AnimatePresence>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg hover:shadow-xl hover:shadow-[#25D366]/20 border border-slate-100 hover:border-[#25D366]/40 p-3 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          aria-label="Chat on WhatsApp"
        >
          {/* Official WhatsApp SVG Logo */}
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-7 h-7 text-[#25D366] group-hover:scale-110 transition-transform duration-300"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      </motion.div>

      {/* Email / Gmail Action Button */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="relative flex items-center"
        onMouseEnter={() => setHoveredButton('email')}
        onMouseLeave={() => setHoveredButton(null)}
      >
        <AnimatePresence>
          {hoveredButton === 'email' && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-16 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap bg-white/95 backdrop-blur-md text-slate-800 border border-slate-200/80 shadow-md pointer-events-none z-20 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#EA4335]"></span>
              <span>Send an Email</span>
            </motion.div>
          )}
        </AnimatePresence>

        <a
          href={emailUrl}
          className="relative z-10 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full shadow-lg hover:shadow-xl hover:shadow-red-500/15 border border-slate-100 hover:border-red-200/60 p-3 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          aria-label="Send an Email"
        >
          {/* Official Multi-Color Gmail Logo */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
            alt="Gmail" 
            className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" 
          />
        </a>
      </motion.div>
      
    </div>
  );
};

export default FloatingContact;