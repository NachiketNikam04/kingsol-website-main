import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  MessageSquareQuote,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
  Building2,
  MapPin,
  Package,
  Clock,
  Send,
} from 'lucide-react';

interface Quote {
  id: number;
  name: string;
  phone: string;
  email: string;
  company_name?: string;
  state?: string;
  product_interest?: string;
  message?: string;
  status: string;
  created_at: string;
}

export const QuotesManager: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [messageAlert, setMessageAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/quotes');
      if (res.data.success) {
        setQuotes(res.data.data || []);
      }
    } catch (err: any) {
      console.warn('⚠️ [QuotesManager] Fetch error:', err);
      setMessageAlert({ type: 'error', text: 'Failed to fetch quote requests.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Quick update status
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Optimistic update
      setQuotes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedQuote && selectedQuote.id === id) {
        setSelectedQuote((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      await api.patch(`/quotes/${id}/status`, { status: newStatus });
      setMessageAlert({ type: 'success', text: `Status updated to '${newStatus}'.` });
    } catch {
      setMessageAlert({ type: 'error', text: 'Failed to update quote status.' });
      fetchQuotes();
    }
  };

  // Open modal and automatically set status to Contacted if still 'New'
  const handleOpenQuote = (quote: Quote) => {
    setSelectedQuote(quote);
  };

  // Delete Quote
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the quote request from '${name}'?`)) return;
    try {
      await api.delete(`/quotes/${id}`);
      setQuotes((prev) => prev.filter((item) => item.id !== id));
      if (selectedQuote?.id === id) setSelectedQuote(null);
      setMessageAlert({ type: 'success', text: `Quote from ${name} deleted successfully.` });
    } catch {
      setMessageAlert({ type: 'error', text: 'Failed to delete quote request.' });
    }
  };

  const filteredQuotes = quotes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.company_name && item.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.state && item.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.product_interest && item.product_interest.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.message && item.message.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const newQuotesCount = quotes.filter((q) => q.status === 'New' || !q.status).length;
  const contactedCount = quotes.filter((q) => q.status === 'Contacted').length;
  const closedCount = quotes.filter((q) => q.status === 'Quoted' || q.status === 'Closed').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900 font-poppins">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                  <MessageSquareQuote className="w-7 h-7 text-brand-green" />
                  <span>Quote Requests Tracker</span>
                </h1>
                <p className="text-slate-500 text-xs mt-1">
                  Manage incoming B2B product quotes, solar component leads, and procurement requirements.
                </p>
              </div>

              {/* Status Counters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{newQuotesCount} New Requests</span>
                </div>
                <div className="bg-sky-50 border border-sky-200 text-sky-800 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                  <span>{contactedCount} Contacted</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                  <span>{closedCount} Quoted/Closed</span>
                </div>
                <div className="bg-slate-100 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-xs font-bold">
                  <span>{quotes.length} Total</span>
                </div>
              </div>
            </div>

            {/* Alert Message */}
            {messageAlert && (
              <div
                className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
                  messageAlert.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {messageAlert.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{messageAlert.text}</span>
                </div>
                <button
                  onClick={() => setMessageAlert(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Search and Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, phone, company, state, or product..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Closed">Closed</option>
                </select>

                <button
                  onClick={fetchQuotes}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-xs text-slate-400">Loading quote requests...</div>
              ) : filteredQuotes.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquareQuote className="w-12 h-12 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
                  <h3 className="text-base font-bold text-slate-800">No Quote Requests Found</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When visitors submit the "Get Quote" form from your website, their requests will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-600 tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Date & Status</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Company & State</th>
                        <th className="py-3.5 px-4">Product Interest</th>
                        <th className="py-3.5 px-4">Requirements</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuotes.map((q) => {
                        const isNew = q.status === 'New' || !q.status;

                        return (
                          <tr
                            key={q.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isNew ? 'bg-emerald-50/25 font-medium' : ''
                            }`}
                          >
                            {/* Date & Status Dropdown */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {q.created_at ? new Date(q.created_at).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  }) : 'Recent'}
                                </span>
                                <select
                                  value={q.status || 'New'}
                                  onChange={(e) => handleStatusChange(q.id, e.target.value)}
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer w-fit ${
                                    q.status === 'Contacted'
                                      ? 'bg-sky-50 border-sky-200 text-sky-800'
                                      : q.status === 'Quoted'
                                      ? 'bg-purple-50 border-purple-200 text-purple-800'
                                      : q.status === 'Closed'
                                      ? 'bg-slate-100 border-slate-300 text-slate-700'
                                      : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                  }`}
                                >
                                  <option value="New">● New</option>
                                  <option value="Contacted">● Contacted</option>
                                  <option value="Quoted">● Quoted</option>
                                  <option value="Closed">● Closed</option>
                                </select>
                              </div>
                            </td>

                            {/* Customer Info */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-xs">{q.name}</span>
                                <a
                                  href={`mailto:${q.email}`}
                                  className="text-slate-500 hover:text-brand-green flex items-center gap-1 text-[11px] mt-0.5"
                                >
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{q.email}</span>
                                </a>
                                <a
                                  href={`tel:${q.phone}`}
                                  className="text-slate-500 hover:text-brand-green flex items-center gap-1 text-[11px]"
                                >
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{q.phone}</span>
                                </a>
                              </div>
                            </td>

                            {/* Company & State */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col gap-0.5">
                                {q.company_name ? (
                                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[150px]">{q.company_name}</span>
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">Individual / EPC</span>
                                )}
                                {q.state ? (
                                  <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{q.state}</span>
                                  </span>
                                ) : null}
                              </div>
                            </td>

                            {/* Product Interest */}
                            <td className="py-3.5 px-4">
                              {q.product_interest ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 font-semibold text-[11px] max-w-[200px] truncate">
                                  <Package className="w-3 h-3 text-brand-green shrink-0" />
                                  <span className="truncate">{q.product_interest}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">General Catalog Quote</span>
                              )}
                            </td>

                            {/* Requirements Snippet */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <p className="text-slate-600 truncate text-[11px]">
                                {q.message || <span className="text-slate-400 italic">No notes provided</span>}
                              </p>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenQuote(q)}
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(q.id, q.name)}
                                  className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Quote"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Quote Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green">
                  Quote Lead Details
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedQuote.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    Received on{' '}
                    {selectedQuote.created_at
                      ? new Date(selectedQuote.created_at).toLocaleString('en-IN')
                      : 'Recently'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedQuote(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Phone Number:</span>
                  <a
                    href={`tel:${selectedQuote.phone}`}
                    className="font-bold text-slate-900 hover:text-brand-green flex items-center gap-1 text-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-green" />
                    <span>{selectedQuote.phone}</span>
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Email Address:</span>
                  <a
                    href={`mailto:${selectedQuote.email}`}
                    className="font-bold text-slate-900 hover:text-brand-green flex items-center gap-1 text-sm truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span className="truncate">{selectedQuote.email}</span>
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Company:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedQuote.company_name || 'Individual / Non-corporate'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold mb-0.5">Location / State:</span>
                  <span className="font-semibold text-slate-800">{selectedQuote.state || 'Not specified'}</span>
                </div>
              </div>

              {/* Product Requirement */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
                <span className="text-emerald-800 font-bold block mb-1">Target Product / System Requirement:</span>
                <span className="text-slate-900 font-semibold text-sm">
                  {selectedQuote.product_interest || 'General Catalog / System Inquiry'}
                </span>
              </div>

              {/* Message */}
              <div>
                <span className="text-slate-500 font-bold block mb-1 uppercase tracking-wider text-[11px]">
                  Project Specifications & Message:
                </span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed text-xs">
                  {selectedQuote.message || 'No additional message was provided.'}
                </div>
              </div>

              {/* Status Selector in Modal */}
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-700">Lead Status:</span>
                <select
                  value={selectedQuote.status || 'New'}
                  onChange={(e) => handleStatusChange(selectedQuote.id, e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <a
                href={`mailto:${selectedQuote.email}?subject=Kingsol%20Solar%20Quotation%20Proposal&body=Dear%20${encodeURIComponent(
                  selectedQuote.name
                )},%0D%0A%0D%0AThank%20you%20for%20reaching%20out%20to%20Kingsol%20Solar%20regarding%20${encodeURIComponent(
                  selectedQuote.product_interest || 'our solar solutions'
                )}.`}
                className="px-5 py-2.5 rounded-xl bg-brand-green hover:bg-[#68ac49] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email Reply</span>
              </a>
              <button
                onClick={() => setSelectedQuote(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesManager;
