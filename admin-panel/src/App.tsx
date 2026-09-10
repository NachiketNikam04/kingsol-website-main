import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsManager from './pages/ProductsManager';
import InquiriesManager from './pages/InquiriesManager';
import ApplicationsManager from './pages/ApplicationsManager';
import BlogsManager from './pages/BlogsManager';
import BrandingManager from './pages/BrandingManager';
import ServicesManager from './pages/services/ServicesManager';
import FooterManager from './pages/FooterManager';
import GalleryManager from './pages/GalleryManager';
import MediaManager from './pages/MediaManager';
import FeatureFlagsManager from './pages/FeatureFlagsManager';

// Home Page Managers
import HeroManager from './pages/home-sections/HeroManager';
import AboutManager from './pages/home-sections/AboutManager';
import PartnersManager from './pages/home-sections/PartnersManager';
import SolutionsManager from './pages/home-sections/SolutionsManager';
import ProductsShowcaseManager from './pages/home-sections/ProductsShowcaseManager';
import WhyChooseUsManager from './pages/home-sections/WhyChooseUsManager';
import MaintenanceManager from './pages/home-sections/MaintenanceManager';
import TestimonialsManager from './pages/home-sections/TestimonialsManager';
import BlogsSectionManager from './pages/home-sections/BlogsSectionManager';
import QuoteManager from './pages/home-sections/QuoteManager';

// About Page Managers
import AboutHeroManager from './pages/about-sections/AboutHeroManager';
import WhoWeAreManager from './pages/about-sections/WhoWeAreManager';
import FoundationManager from './pages/about-sections/FoundationManager';
import WarehouseManager from './pages/about-sections/WarehouseManager';
import CareersCTAManager from './pages/about-sections/CareersCTAManager';

// Careers Page Managers
import CareersSettingsManager from './pages/careers/CareersSettingsManager';
import JobManager from './pages/careers/JobManager';

// Contact Page Manager
import ContactManager from './pages/contact/ContactManager';

import ProtectedRoute from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <Router basename="/admin-secure">
      <Routes>
        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/services" element={<ServicesManager />} />
          <Route path="/dashboard/products" element={<ProductsManager />} />
          <Route path="/dashboard/inquiries" element={<InquiriesManager />} />
          <Route path="/dashboard/careers" element={<ApplicationsManager />} />
          <Route path="/dashboard/blogs" element={<BlogsManager />} />
          <Route path="/dashboard/gallery" element={<GalleryManager />} />
          <Route path="/dashboard/media" element={<MediaManager />} />
          <Route path="/dashboard/contact" element={<ContactManager />} />
          <Route path="/dashboard/footer" element={<FooterManager />} />
          <Route path="/dashboard/branding" element={<BrandingManager />} />
          <Route path="/dashboard/feature-flags" element={<FeatureFlagsManager />} />

          {/* Home Page Sub-Section Managers */}
          <Route path="/dashboard/home/hero" element={<HeroManager />} />
          <Route path="/dashboard/home/about" element={<AboutManager />} />
          <Route path="/dashboard/home/partners" element={<PartnersManager />} />
          <Route path="/dashboard/home/solutions" element={<SolutionsManager />} />
          <Route path="/dashboard/home/products" element={<ProductsShowcaseManager />} />
          <Route path="/dashboard/home/why-choose-us" element={<WhyChooseUsManager />} />
          <Route path="/dashboard/home/maintenance" element={<MaintenanceManager />} />
          <Route path="/dashboard/home/testimonials" element={<TestimonialsManager />} />
          <Route path="/dashboard/home/blogs" element={<BlogsSectionManager />} />
          <Route path="/dashboard/home/quote" element={<QuoteManager />} />

          {/* About Page Sub-Section Managers */}
          <Route path="/dashboard/about/hero" element={<AboutHeroManager />} />
          <Route path="/dashboard/about/who-we-are" element={<WhoWeAreManager />} />
          <Route path="/dashboard/about/foundation" element={<FoundationManager />} />
          <Route path="/dashboard/about/warehouse" element={<WarehouseManager />} />
          <Route path="/dashboard/about/careers-cta" element={<CareersCTAManager />} />

          {/* Careers Page Sub-Section Managers */}
          <Route path="/dashboard/careers/settings" element={<CareersSettingsManager />} />
          <Route path="/dashboard/careers/jobs" element={<JobManager />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
