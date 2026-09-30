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
          <p className="font-poppins text-base md:text-lg text-slate-600 leading-relaxed whitespace-pre-line">
            Secure premium {brandName} equipment with Kingsol's dedicated technical support, transparent wholesale pricing, and guaranteed PAN-India logistics. Contact our specialists today to finalize the optimal configuration for your project's specific scale and deployment schedule.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className="px-8 py-3 bg-[#44a0e3] hover:bg-white text-white hover:text-[#44a0e3] border border-[#44a0e3] rounded text-base font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            Buy {brandName} &rarr;
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
