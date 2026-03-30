'use client';

import { useState, useEffect } from 'react';
import api, { getUploadsUrl } from '../../lib/api';
import toast from 'react-hot-toast';
import { CreditCard, CheckCircle, XCircle, Clock, Eye, ToggleLeft, ToggleRight, Search, Calendar, ExternalLink } from 'lucide-react';
import { useConfirmDialog } from '../ConfirmDialog';

interface Payment {
  _id: string; status: string; isVerified: boolean; isEnrolled: boolean;
  slipImage: string; createdAt: string; verifiedAt?: string;
  verificationExpiresAt?: string; adminNote?: string;
  studentId: { _id: string; fullName: string; email: string; phone: string };
  classId: { _id: string; title: string; subject: string; price: number };
}

const STATUS: Record<string, string> = {
  pending:  'badge-warning',
  verified: 'badge-success',
  rejected: 'badge-danger',
  expired:  'badge-warning',
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const { confirm: confirmAction, DialogComponent } = useConfirmDialog();

  useEffect(() => {
    api.get('/payments/all')
      .then(({ data }) => setPayments(data))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !search || p.studentId?.fullName?.toLowerCase().includes(q) || p.studentId?.email?.toLowerCase().includes(q) || p.classId?.title?.toLowerCase().includes(q);
    return matchQ && (filter === 'all' || p.status === filter);
  });

  const counts = {
    all: payments.length,
    pending:  payments.filter(p => p.status === 'pending').length,
    verified: payments.filter(p => p.status === 'verified').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    try {
      const { data } = await api.patch(`/payments/${id}/toggle-verify`);
      setPayments(prev => prev.map(p => p._id === id ? { ...p, ...data } : p));
      toast.success(data.isVerified ? 'Payment verified ✅ Student enrolled' : 'Verification removed');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setToggling(null); }
  };

  const handleReject = async (id: string) => {
    const ok = await confirmAction({ title: 'Reject Payment', message: 'Are you sure you want to reject this payment? The student will not be enrolled.', confirmText: 'Reject', danger: true });
    if (!ok) return;
    try {
      const { data } = await api.patch(`/payments/${id}/reject`);
      setPayments(prev => prev.map(p => p._id === id ? { ...p, ...data } : p));
      toast.success('Payment rejected');
    } catch { toast.error('Failed to reject'); }
  };

  const slipUrl = (f: string) => getUploadsUrl(f) ?? '';

  return (
    <>
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Payment Management</h2>
          <p className="text-sm text-3">
            {counts.pending > 0 && <span className="text-warning font-medium">{counts.pending} pending · </span>}
            {payments.length} total payments
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input pl-10 w-64" placeholder="Search student, class…" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(counts).map(([s, c]) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === s ? 'gradient-primary text-white border-transparent shadow-sm' : 'btn-secondary py-2 px-4'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-lg ${filter === s ? 'bg-white/20' : 'bg-surface-2'}`}>{c}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card p-5"><div className="shimmer h-16 rounded-xl w-full" /></div>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <CreditCard className="w-16 h-16 text-3 mx-auto mb-4" />
          <p className="font-bold text-1">No payments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(payment => (
            <div key={payment._id} className="card overflow-hidden hover:border-primary/30 transition-all">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Student */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {payment.studentId?.fullName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-1">{payment.studentId?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-3">{payment.studentId?.email}</p>
                    </div>
                  </div>

                  {/* Class */}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-1">{payment.classId?.title || 'Unknown Class'}</p>
                    <p className="text-xs text-3">{payment.classId?.subject} · LKR {payment.classId?.price?.toLocaleString()}</p>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2">
                    <span className={`badge ${STATUS[payment.status] || 'badge-warning'}`}>
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </span>

                    {payment.slipImage && (
                      <button onClick={() => setPreviewUrl(slipUrl(payment.slipImage))}
                        className="card-sm p-2 hover:border-primary/40 transition-all" title="View slip">
                        <Eye className="w-4 h-4 text-2" />
                      </button>
                    )}

                    {payment.status !== 'expired' && (
                      <button onClick={() => handleToggle(payment._id)} disabled={!!toggling}
                        title={payment.isVerified ? 'Unverify' : 'Verify'}
                        className={`card-sm p-2 transition-all disabled:opacity-50 ${payment.isVerified ? 'border-success/40 text-success' : 'border-primary/40 text-primary-c'} hover:opacity-80`}>
                        {toggling === payment._id
                          ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin block" />
                          : payment.isVerified ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />
                        }
                      </button>
                    )}

                    {payment.status === 'pending' && (
                      <button onClick={() => handleReject(payment._id)}
                        className="card-sm p-2 border-danger/30 text-danger hover:bg-danger/5 transition-all" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-theme text-xs text-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Submitted {new Date(payment.createdAt).toLocaleDateString()}</span>
                  {payment.verifiedAt && <span className="flex items-center gap-1 text-success"><CheckCircle className="w-3 h-3" />Verified {new Date(payment.verifiedAt).toLocaleDateString()}</span>}
                  {payment.verificationExpiresAt && payment.isVerified && (
                    <span className="flex items-center gap-1 text-warning"><Clock className="w-3 h-3" />Expires {new Date(payment.verificationExpiresAt).toLocaleDateString()}</span>
                  )}
                  {payment.isEnrolled && <span className="flex items-center gap-1 text-success font-medium"><CheckCircle className="w-3 h-3" />Enrolled</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slip Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewUrl(null)}>
          <div className="card w-full max-w-2xl animate-in overflow-hidden shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-theme">
              <p className="font-semibold text-1">Payment Slip</p>
              <button onClick={() => setPreviewUrl(null)} className="text-3 hover:text-1 transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <img src={previewUrl} alt="Payment slip" className="w-full rounded-xl max-h-[65vh] object-contain bg-surface-2" />
            </div>
            <div className="px-5 pb-4 flex justify-end">
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm gap-1.5">
                <ExternalLink className="w-4 h-4" /> Open Full Size
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
    {DialogComponent}
    </>
  );
}
