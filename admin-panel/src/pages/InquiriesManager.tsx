import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  MessageSquare,
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  inquiry_type?: string;
  is_read: boolean;
  created_at: string;
}

export const InquiriesManager: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [messageAlert, setMessageAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact/all');
      if (res.data.success) {
        setInquiries(res.data.data);
      }
    } catch {
      setMessageAlert({ type: 'error', text: 'Failed to fetch contact inquiries.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Mark as read and open modal
  const handleOpenInquiry = async (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);

    if (!inquiry.is_read) {
      // Optimistic update
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, is_read: true } : item))
      );
      try {
        await api.patch(`/contact/${inquiry.id}/read`);
      } catch {
        // Silent catch
      }
    }
  };

  // Delete Inquiry
  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete inquiry from '${name}'?`)) return;
    try {
      await api.delete(`/contact/${id}`);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      setMessageAlert({ type: 'success', text: `Inquiry from ${name} deleted.` });
    } catch {
      setMessageAlert({ type: 'error', text: 'Failed to delete inquiry.' });
    }
  };

  const filteredInquiries = inquiries.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = inquiries.filter((i) => !i.is_read).length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
      <Sidebar />

      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto p-8 md:p-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-orange tracking-widest uppercase block mb-1">
              CLIENT MESSAGES & QUOTES
            </span>
            <h1 className="text-3xl font-bold text-slate-900">Contact Inquiries Tracker</h1>
            <p className="text-slate-600 text-sm mt-1">
              Review and manage all website contact form submissions and quote requests.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2.5 rounded-2xl w-fit shadow-xs">
            <span className="text-xs font-bold text-slate-700">Unread Messages:</span>
            <span className="bg-brand-orange text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          </div>
        </div>

        {/* Message Alert */}
        {messageAlert && (
          <div
            className={`mb-6 p-4 rounded-2xl border flex items-center justify-between text-sm ${
              messageAlert.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {messageAlert.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{messageAlert.text}</span>
            </div>
            <button onClick={() => setMessageAlert(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 flex justify-between items-center gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-11 pr-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-brand-green outline-none shadow-xs"
            />
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 font-medium">Loading inquiries from database...</div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No contact inquiries yet.</p>
            <p className="text-xs text-slate-400 mt-1">Form submissions from the main website will appear here instantly.</p>
          </div>
        ) : (
          <div className="flex h-screen w-full overflow-hidden bg-brand-bg text-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[11px] font-bold text-slate-700 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Sender</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Message Preview</th>
                    <th className="px-6 py-4">Date Received</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className={`transition-colors cursor-pointer ${
                        !inquiry.is_read
                          ? 'bg-white font-semibold text-slate-900 border-l-4 border-l-brand-green'
                          : 'bg-slate-50/60 opacity-70 text-slate-600 hover:opacity-100'
                      }`}
                      onClick={() => handleOpenInquiry(inquiry)}
                    >
                      <td className="px-6 py-4">
                        {!inquiry.is_read ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-green/20 text-slate-900 text-xs font-bold rounded-full">
                            <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse"></span> New
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-200/80 text-slate-600 text-xs font-medium rounded-full">
                            Read
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold block text-slate-900">{inquiry.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-0.5">
                          <div className="flex items-center gap-1 text-slate-700">
                            <Mail className="w-3 h-3 text-slate-400" /> {inquiry.email}
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" /> {inquiry.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-600">{inquiry.message || 'No message'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(inquiry.created_at).toLocaleDateString()}{' '}
                        {new Date(inquiry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenInquiry(inquiry)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-blue text-brand-blue transition-colors cursor-pointer"
                            title="View Full Message"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(inquiry.id, inquiry.name)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Inquiry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DETAIL MODAL POPUP */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 max-w-lg w-full shadow-2xl relative text-slate-900">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-6">
                <span className="w-3 h-3 rounded-full bg-brand-green"></span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  CONTACT INQUIRY DETAILS
                </span>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">{selectedInquiry.name}</h2>

              <div className="space-y-4 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 text-sm mb-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                  <a href={`mailto:${selectedInquiry.email}`} className="text-brand-blue font-semibold hover:underline">
                    {selectedInquiry.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-brand-green shrink-0" />
                  <a href={`tel:${selectedInquiry.phone}`} className="text-slate-900 font-semibold hover:underline">
                    {selectedInquiry.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{new Date(selectedInquiry.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Message Body</h4>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message || 'No additional message text provided.'}
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=RE: Solar Energy Inquiry - Kingsol`}
                  className="w-1/2 bg-brand-green text-slate-900 rounded-full font-semibold hover:bg-slate-900 hover:text-white transition-colors py-3 text-center text-sm"
                >
                  Reply via Email
                </a>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="w-1/2 bg-white text-slate-900 border border-slate-200 rounded-full font-semibold hover:border-brand-blue hover:text-brand-blue transition-all py-3 text-sm cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default InquiriesManager;
