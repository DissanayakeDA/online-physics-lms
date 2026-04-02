'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import api, { getUploadsUrl } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import toast from 'react-hot-toast';
import {
  BookOpen, Video, Play, Clock, Users, ArrowLeft, Upload, CheckCircle,
  AlertCircle, Calendar, Award, ExternalLink, Bell,
  AlertTriangle, XCircle, Info,
} from 'lucide-react';

interface ClassData {
  _id: string; title: string; description: string; subject: string; instructor: string;
  price: number; thumbnail: string; status: string; duration: string; level: string;
  enrolledCount: number; tags: string[];
  recordings: { _id: string; title: string; url: string; date: string; description: string }[];
  liveClasses: { _id: string; title: string; url: string; scheduledAt: string; description: string; isActive: boolean }[];
}

interface Notice {
  _id: string; title: string; content: string; type: string; createdAt: string;
}

const THUMB_COLORS = ['thumb-orange','thumb-purple','thumb-blue','thumb-teal','thumb-pink','thumb-green'];

const NOTICE_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  info:    { icon: Info,          color: '#F57C20', bg: 'rgba(245,124,32,0.10)' },
  warning: { icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.10)' },
  success: { icon: CheckCircle,   color: '#10B981', bg: 'rgba(16,185,129,0.10)' },
  urgent:  { icon: XCircle,       color: '#EF4444', bg: 'rgba(239,68,68,0.10)' },
};

function isValidLankaNic(raw: string): boolean {
  const t = raw.trim().replace(/\s+/g, '');
  if (/^\d{9}[vx]$/i.test(t)) return true;
  return /^\d{12}$/.test(t);
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [cls, setCls] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [enrollmentNic, setEnrollmentNic] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'recordings' | 'live' | 'notices'>('overview');
  const [notices, setNotices] = useState<Notice[]>([]);

  const classId = params?.id as string;

  useEffect(() => {
    if (!classId) return;
    api.get(`/classes/${classId}`)
      .then(({ data }) => setCls(data))
      .catch(() => toast.error('Class not found'))
      .finally(() => setLoading(false));

    // Fetch notices for this class
    api.get(`/notices/class/${classId}`)
      .then(({ data }) => setNotices(data))
      .catch(() => {});
  }, [classId]);

  useEffect(() => {
    if (!user || !classId) return;
    api.get('/payments/my-payments')
      .then(({ data }) => {
        const payment = data.find((p: any) => p.classId?._id === classId);
        if (payment) {
          setPaymentStatus(payment.status);
          setEnrolled(payment.isEnrolled);
          if (payment.nic) setEnrollmentNic(payment.nic);
        }
      })
      .catch(() => {});
  }, [user, classId]);

  const imgUrl = (t: string) => getUploadsUrl(t);

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) { toast.error('Please login first'); router.push('/auth/login'); return; }
    if (!isValidLankaNic(enrollmentNic)) {
      toast.error('Enter a valid NIC (9 digits + V or X, or 12 digits).');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append('slip', file);
    fd.append('nic', enrollmentNic.trim().replace(/\s+/g, ''));
    try {
      await api.post(`/payments/submit/${classId}`, fd);
      setPaymentStatus('pending');
      toast.success('Payment slip submitted! Awaiting admin verification.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit payment');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="shimmer h-72 rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="shimmer h-8 w-3/4 rounded-lg" />
              <div className="shimmer h-4 w-full rounded-lg" />
              <div className="shimmer h-4 w-2/3 rounded-lg" />
            </div>
            <div className="shimmer h-64 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[60vh]">
          <div className="card p-12 text-center max-w-md">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Class Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">The class you're looking for doesn't exist or has been removed.</p>
            <Link href="/classes" className="btn-primary inline-flex">Browse Classes</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const url = imgUrl(cls.thumbnail);
  const colorIdx = cls.title.length % THUMB_COLORS.length;
  const thColor = THUMB_COLORS[colorIdx];

  const enrollmentNicField = (
    <div className="space-y-2">
      <label htmlFor="enroll-nic" className="block text-xs font-semibold text-gray-700">NIC number</label>
      <input
        id="enroll-nic"
        type="text"
        autoComplete="off"
        value={enrollmentNic}
        onChange={(e) => setEnrollmentNic(e.target.value)}
        placeholder="e.g. 123456789V or 12-digit NIC"
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#F57C20] focus:ring-2 focus:ring-[#F57C20]/20 outline-none transition-all"
      />
      <p className="text-[11px] text-gray-500 leading-snug">
        Required when you submit your payment slip. Old NIC: 9 digits + V or X. New NIC: 12 digits.
      </p>
    </div>
  );

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'recordings', label: `Recordings (${cls.recordings.length})`, icon: Video },
    { id: 'live', label: `Live Classes (${cls.liveClasses.length})`, icon: Play },
    { id: 'notices', label: `Notices (${notices.length})`, icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-16">
        <div className={`relative h-64 sm:h-80 overflow-hidden ${!url ? thColor : 'bg-gray-900'}`}>
          {url ? (
            <img src={url} alt={cls.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
              <button onClick={() => router.back()} className="flex items-center gap-1.5 text-white/70 text-sm mb-4 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge text-white bg-[#F57C20]/90">{cls.subject}</span>
                {cls.level && <span className="badge text-white bg-white/20 backdrop-blur-sm">{cls.level}</span>}
                <span className={`badge text-white ${cls.status === 'active' ? 'bg-green-500/80' : cls.status === 'upcoming' ? 'bg-yellow-500/80' : 'bg-gray-500/80'}`}>
                  {cls.status}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {cls.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#F57C20] flex items-center justify-center text-[10px] font-bold text-white">
                    {cls.instructor.charAt(0)}
                  </div>
                  {cls.instructor}
                </span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {cls.enrolledCount} students</span>
                {cls.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {cls.duration}</span>}
                <span className="flex items-center gap-1"><Video className="w-3.5 h-3.5" /> {cls.recordings.length} recordings</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === id ? 'bg-white text-[#F57C20] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-3">About This Class</h2>
                  <p className="text-gray-600 leading-relaxed">{cls.description}</p>
                  {cls.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {cls.tags.map(t => (
                        <span key={t} className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-50 text-[#F57C20] border border-orange-100">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* What you get */}
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">What You'll Get</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { icon: Video, label: `${cls.recordings.length} Video Recordings`, desc: 'Watch anytime, anywhere' },
                      { icon: Play, label: `${cls.liveClasses.length} Live Sessions`, desc: 'Interactive live classes' },
                      { icon: Award, label: 'Expert Instruction', desc: `Learn from ${cls.instructor}` },
                      { icon: Bell, label: 'Class Notices', desc: 'Stay updated with announcements' },
                    ].map(({ icon: Icon, label, desc }) => (
                      <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-[#F57C20]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{label}</p>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recordings Tab */}
            {activeTab === 'recordings' && (
              <div className="space-y-3">
                {!enrolled && cls.recordings.length > 0 && (
                  <div className="card p-4 flex items-center gap-3 bg-amber-50 border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700">Enroll in this class to access all recordings.</p>
                  </div>
                )}
                {cls.recordings.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900 mb-1">No Recordings Yet</p>
                    <p className="text-sm text-gray-500">Recordings will appear here once the instructor uploads them.</p>
                  </div>
                ) : (
                  cls.recordings.map((rec, i) => (
                    <div key={rec._id} className="card p-4 flex items-center gap-4 hover:border-orange-200 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#F57C20] flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{rec.title}</p>
                        {rec.description && <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{rec.description}</p>}
                        {rec.date && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(rec.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {enrolled ? (
                        <a href={rec.url} target="_blank" rel="noopener noreferrer"
                          className="btn-primary text-xs py-2 px-4 gap-1.5">
                          <Play className="w-3.5 h-3.5" /> Watch
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Enroll to watch</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Live Classes Tab */}
            {activeTab === 'live' && (
              <div className="space-y-3">
                {!enrolled && cls.liveClasses.length > 0 && (
                  <div className="card p-4 flex items-center gap-3 bg-amber-50 border-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-700">Enroll in this class to join live sessions.</p>
                  </div>
                )}
                {cls.liveClasses.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Play className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900 mb-1">No Live Classes Scheduled</p>
                    <p className="text-sm text-gray-500">Live sessions will appear here once scheduled.</p>
                  </div>
                ) : (
                  cls.liveClasses.map(live => {
                    const date = live.scheduledAt ? new Date(live.scheduledAt) : null;
                    const isUpcoming = date && date > new Date();
                    return (
                      <div key={live._id} className="card p-4 flex items-center gap-4 hover:border-orange-200 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{live.title}</p>
                          {live.description && <p className="text-xs text-gray-500 mt-0.5">{live.description}</p>}
                          {date && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {date.toLocaleString()}
                              {isUpcoming && <span className="ml-2 badge badge-success text-[10px]">Upcoming</span>}
                            </p>
                          )}
                        </div>
                        {enrolled ? (
                          <a href={live.url} target="_blank" rel="noopener noreferrer"
                            className="btn-primary text-xs py-2 px-4 gap-1.5">
                            <ExternalLink className="w-3.5 h-3.5" /> Join
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Enroll to join</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
              <div className="space-y-3">
                {notices.length === 0 ? (
                  <div className="card p-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900 mb-1">No Notices</p>
                    <p className="text-sm text-gray-500">There are no announcements for this class yet.</p>
                  </div>
                ) : (
                  notices.map(notice => {
                    const cfg = NOTICE_CONFIG[notice.type] || NOTICE_CONFIG.info;
                    const Icon = cfg.icon;
                    return (
                      <div key={notice._id} className="card overflow-hidden">
                        <div className="h-1 w-full" style={{ background: cfg.color }} />
                        <div className="p-5">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: cfg.bg }}>
                              <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-sm mb-1">{notice.title}</h3>
                              <p className="text-sm text-gray-600">{notice.content}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(notice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Pricing Card */}
            <div className="card p-6 sticky top-20">
              <div className="text-center mb-5">
                <p className="text-3xl font-black text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {cls.price === 0 ? 'Free' : `LKR ${cls.price.toLocaleString()}`}
                </p>
                {cls.price > 0 && <p className="text-xs text-gray-500 mt-1">One-time payment</p>}
              </div>

              {!user ? (
                <div className="space-y-3">
                  <Link href="/auth/login" className="btn-primary w-full justify-center py-3">
                    Login to Enroll
                  </Link>
                  <p className="text-xs text-gray-500 text-center">
                    Don't have an account? <Link href="/auth/register" className="text-[#F57C20] font-semibold hover:underline">Register free</Link>
                  </p>
                </div>
              ) : enrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-700">You're Enrolled!</p>
                      <p className="text-xs text-green-600">Access all class content above.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('recordings')} className="btn-primary w-full justify-center py-3 gap-2">
                    <Play className="w-4 h-4" /> Start Learning
                  </button>
                </div>
              ) : paymentStatus === 'pending' ? (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Payment Under Review</p>
                    <p className="text-xs text-amber-600">Admin will verify your payment slip shortly.</p>
                  </div>
                </div>
              ) : paymentStatus === 'rejected' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700">Payment Rejected</p>
                      <p className="text-xs text-red-600">Please re-submit a valid payment slip.</p>
                    </div>
                  </div>
                  {enrollmentNicField}
                  <label className="btn-primary w-full justify-center py-3 gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" /> Re-upload Slip
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleSlipUpload} />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {enrollmentNicField}
                  <label className={`btn-primary w-full justify-center py-3 gap-2 cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {uploading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-4 h-4" /> Submit Payment Slip
                      </>
                    )}
                    <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleSlipUpload} disabled={uploading} />
                  </label>
                  <p className="text-xs text-gray-500 text-center">Upload your bank payment slip to enroll</p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 my-5" />

              {/* Class Info */}
              <div className="space-y-3">
                {[
                  { label: 'Instructor', value: cls.instructor },
                  { label: 'Subject', value: cls.subject },
                  { label: 'Level', value: cls.level || 'All Levels' },
                  { label: 'Duration', value: cls.duration || 'Self-paced' },
                  { label: 'Students', value: `${cls.enrolledCount} enrolled` },
                  { label: 'Recordings', value: `${cls.recordings.length} videos` },
                  { label: 'Live Classes', value: `${cls.liveClasses.length} sessions` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
