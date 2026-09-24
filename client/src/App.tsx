import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Global Layout Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingContact } from './components/FloatingContact';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import ScrollToTop from './components/ScrollToTop';

// Main Public Pages
import Landing from './pages/Landing';
import AboutUs from './pages/AboutUs';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Products from './pages/Products';
import CategoryPage from './pages/CategoryPage';
import BrandDetail from './pages/BrandDetail';
import ProductDetail from './pages/ProductDetail';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import GalleryPage from './pages/GalleryPage';
import MediaPage from './pages/MediaPage';
import Careers from './pages/Careers';
import CareerDetail from './pages/CareerDetail';
import Contact from './pages/Contact';
import CertificatesPage from './pages/CertificatesPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fdfcf8] text-slate-900 flex flex-col justify-between selection:bg-[#78C257] selection:text-slate-900 overflow-x-clip">
        {/* Scroll Restorer */}
        <ScrollToTop />

        {/* Global Navigation Header */}
        <Navbar />

        {/* Main Content Router */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            
            {/* Dynamic 4-Tier Product Catalog Routes (Ordered strictly from most-specific to least-specific) */}
            <Route path="/products/:categorySlug/:brandSlug/:productSlug" element={<ProductDetail />} />
            <Route path="/products/:categorySlug/:brandSlug" element={<BrandDetail />} />
            <Route path="/products/:categorySlug" element={<CategoryPage />} />
            <Route path="/products" element={<Products />} />

            {/* Direct Brand Showcase Routes */}
            <Route path="/brands/:brandSlug" element={<BrandDetail />} />
            <Route path="/brands" element={<Products />} />

            {/* Blogs & Article Routes */}
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />

            {/* Gallery & Media Routes */}
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/media" element={<MediaPage />} />

            {/* Careers & Job Detail Routes */}
            <Route path="/careers" element={<Careers />} />
            <Route path="/careers/:slug" element={<CareerDetail />} />

            {/* Contact Page Route */}
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        {/* Global Floating Action Widgets */}
        <FloatingContact />
        <ScrollToTopButton />

        {/* Global Footer */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}