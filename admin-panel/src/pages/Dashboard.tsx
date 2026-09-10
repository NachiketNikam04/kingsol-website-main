import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  MessageSquare,
  Briefcase,
  Package,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface DashboardStats {
  totalInquiries: number;
  unreadInquiries: number;
  totalApplications: number;
  unreadApplications: number;
  totalBrands: number;
  totalProducts: number;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalInquiries: 0,
    unreadInquiries: 0,
    totalApplications: 0,
    unreadApplications: 0,
    totalBrands: 0,
    totalProducts: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-blue tracking-widest uppercase block mb-1">
              SYSTEM OVERVIEW
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Welcome, Kingsol Administrator 👋</h1>
            <p className="text-slate-600 text-sm mt-1">
              Monitor real-time incoming inquiries, job applications, and catalog metrics.
            </p>
          </div>
        </div>

        {/* PROMINENT SUMMARY CARDS (CONTACT INQUIRIES & CAREER APPLICATIONS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Card 1: Contact & Quote Queries */}
          <div
            onClick={() => navigate('/dashboard/inquiries')}
            className="bg-white border border-slate-200 rounded-[2rem] p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-orange group relative overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-brand-orange flex items-center justify-center font-bold">
                <MessageSquare className="w-7 h-7" />
              </div>

              {stats.unreadInquiries > 0 ? (
                <span className="bg-brand-orange text-slate-900 text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  {stats.unreadInquiries} Unread
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                  All Read
                </span>
              )}
            </div>

            <div className="mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                INQUIRIES & QUOTES
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-slate-900">
                  {loading ? '...' : stats.totalInquiries}
                </span>
                <span className="text-sm font-semibold text-slate-500">Total Queries</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-700">
              <span>View All Submissions</span>
              <span className="text-brand-orange group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                Open Inquiries <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Card 2: Career Applications */}
          <div
            onClick={() => navigate('/dashboard/careers')}
            className="bg-white border border-slate-200 rounded-[2rem] p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-blue group relative overflow-hidden shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-brand-blue flex items-center justify-center font-bold">
                <Briefcase className="w-7 h-7" />
              </div>

              {stats.unreadApplications > 0 ? (
                <span className="bg-brand-blue text-white text-xs font-black px-3.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  {stats.unreadApplications} Unread
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                  All Viewed
                </span>
              )}
            </div>

            <div className="mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">
                RECRUITMENT & CANDIDATES
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-slate-900">
                  {loading ? '...' : stats.totalApplications}
                </span>
                <span className="text-sm font-semibold text-slate-500">Job Applications</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-700">
              <span>Review Talent Pool & Resumes</span>
              <span className="text-brand-blue group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                Open Candidates <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 text-brand-green flex items-center justify-center">
                <Building2 className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Partner Brands</span>
                <p className="text-2xl font-black text-slate-900">{stats.totalBrands} Authorized</p>
              </div>
            </div>
            <Link to="/dashboard/products" className="text-xs font-bold text-brand-blue hover:underline">
              Manage Brands →
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-brand-blue flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase">Product Catalog</span>
                <p className="text-2xl font-black text-slate-900">{stats.totalProducts} Components</p>
              </div>
            </div>
            <Link to="/dashboard/products" className="text-xs font-bold text-brand-blue hover:underline">
              Manage Products →
            </Link>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
};

export default Dashboard;
