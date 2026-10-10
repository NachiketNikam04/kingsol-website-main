import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import QuoteModal from './QuoteModal';

export interface WhyChooseBrandProps {
  brandName: string;
  categoryName: string;
  categoryUrl: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

export const WhyChooseBrand: React.FC<WhyChooseBrandProps> = ({
  brandName,
  categoryName,
  categoryUrl,
}) => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <>
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={containerVariants}
        className="w-full py-16 bg-gray-50 flex flex-col items-center px-4"
      >
        <motion.h1
          variants={itemVariants}
          className="font-poppins text-3xl font-bold tracking-tight text-gray-900 leading-tight sm:text-4xl md:text-5xl text-center"
        >
          Why choose <span className="text-[#44a0e3]">{brandName}</span> from{' '}
          <span className="text-[#44a0e3]">Kingsol Energy India Pvt Ltd</span>?
        </motion.h1>

        <motion.div variants={itemVariants} className="mt-6 text-center max-w-4xl mx-auto space-y-4">
          <p className="font-poppins text-base md:text-md text-slate-600 leading-relaxed whitespace-pre-line text-justify">
            Secure premium {brandName} equipment with Kingsol's dedicated technical support, transparent wholesale pricing, and guaranteed PAN-India logistics. Contact our specialists today to finalize the optimal configuration for your project's specific scale and deployment schedule.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className="group relative px-8 py-3 rounded-full bg-[#44a0e3] hover:bg-white text-white hover:text-[#44a0e3] border border-[#44a0e3] text-base font-semibold transition-all duration-500 flex items-center gap-2 cursor-pointer overflow-hidden shadow-[inset_0px_2px_4px_rgba(255,255,255,0.4),0px_4px_12px_rgba(68,160,227,0.3)] hover:shadow-[0px_4px_20px_rgba(68,160,227,0.5)]"
          >
            {/* Fluid / Mirror Sheen Sweep Effect */}
            <div className="absolute top-0 left-[-100%] w-[120%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-700 ease-out" />
    
          <span className="relative z-10 flex items-center gap-2">
            Buy {brandName} &rarr;
          </span>
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-500 font-medium text-sm">
          <Link to="/products" className="hover:text-blue-600 transition-colors">
            All products
          </Link>
          <Link to={categoryUrl} className="hover:text-blue-600 transition-colors">
            Back to {categoryName}
          </Link>
        </motion.div>
      </motion.section>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        initialProduct={brandName}
      />
    </>
  );
};

export default WhyChooseBrand;
