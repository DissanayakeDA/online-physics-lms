'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getUploadsUrl } from '../../lib/api';
import { firstNameFromFullName } from '../../lib/userDisplay';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import {
  BookOpen, Clock, CheckCircle, XCircle, Play, Video, ChevronRight, Phone, MapPin, Mail,
  LayoutDashboard, Bell, Settings, LogOut, Award,
  Search, Menu, Star, Edit3, Lock, Save, User,
  AlertTriangle, Info,
} from 'lucide-react';


interface Payment {
  _id: string; status: string; isEnrolled: boolean; isVerified: boolean;
  nic?: string;
  createdAt: string; verificationExpiresAt?: string;
  classId: { _id: string; title: string; thumbnail: string; subject: string; instructor: string; price: number; recordings: any[]; liveClasses: any[]; };
}

interface Notice {
  _id: string; title: string; content: string; type: string; isActive: boolean; createdAt: string;
  classId: { _id: string; title: string };
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending Review', cls: 'badge-warning' },
  verified: { label: 'Enrolled', cls: 'badge-success' },
  rejected: { label: 'Rejected', cls: 'badge-danger' },
  expired: { label: 'Expired', cls: 'badge-warning' },
};

const NOTICE_ICONS: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  urgent: XCircle,
};
const NOTICE_COLORS: Record<string, string> = {
  info: '#F57C20',
  warning: '#F59E0B',
  success: '#10B981',
  urgent: '#EF4444',
};

const THUMB_COLORS = ['thumb-orange', 'thumb-purple', 'thumb-blue', 'thumb-teal', 'thumb-pink', 'thumb-green'];

function CircleProgress({ pct, color, size = 56, strokeWidth = 4 }: { pct: number; color: string; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
}

type Section = 'overview' | 'classes' | 'payments' | 'notices' | 'settings';

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'classes', label: 'My Classes', icon: BookOpen },
  { id: 'payments', label: 'Payments', icon: Award },
  { id: 'notices', label: 'Notices', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, initAuth, clearAuth, setAuth } = useAuthStore();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile edit state
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassFields, setShowPassFields] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => { initAuth(); }, [initAuth]);

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') { router.push('/admin'); return; }
    Promise.all([api.get('/payments/my-payments'), api.get('/users/me')])
      .then(([pr, me]) => {
        setPayments(pr.data);
        setProfile(me.data);
        setProfileForm({ fullName: me.data.fullName || '', phone: me.data.phone || '', address: me.data.address || '' });
        // Fetch notices for enrolled classes
        const enrolledClassIds = pr.data
          .filter((p: Payment) => p.isEnrolled && p.classId)
          .map((p: Payment) => p.classId._id);
        if (enrolledClassIds.length > 0) {
          Promise.all(enrolledClassIds.map((id: string) => api.get(`/notices/class/${id}`).catch(() => ({ data: [] }))))
            .then(results => {
              const allNotices = results.flatMap((r: any) => r.data);
              allNotices.sort((a: Notice, b: Notice) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
              setNotices(allNotices);
            });
        }
      })
      .finally(() => setLoading(false));
  }, [user, router]);

  const handleSaveProfile = async () => {
    if (!profileForm.fullName.trim()) { toast.error('Name is required'); return; }
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/users/me', profileForm);
      setProfile(data);
      setAuth({ id: user!.id, email: user!.email, role: user!.role, fullName: data.fullName }, useAuthStore.getState().token!);
      toast.success('Profile updated!');
      setEditProfile(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) { toast.error('Fill all password fields'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmNewPassword) { toast.error('Passwords do not match'); return; }
    setSavingPassword(true);
    try {
      await api.patch('/users/me/password', { currentPassword, newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); setShowPassFields(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPassword(false); }
  };

  if (!user) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-white">
 <div className="card p-10 text-center max-w-sm mx-auto">
 <h2 className="text-xl font-bold text-1 mb-2">Access Required</h2>
 <p className="text-2 text-sm mb-6">Please login to access your dashboard</p>
 <Link href="/auth/login" className="btn-primary w-full justify-center">Sign In</Link>
 </div>
 </div>
 );
 }

 const enrolled = payments.filter(p => p.isEnrolled && p.classId);
 const pending = payments.filter(p => p.status ==='pending');
 const imgUrl = (t: string) => getUploadsUrl(t);

 const Sidebar = () => (
 <aside className="w-64 flex flex-col h-screen sticky top-0 shrink-0 bg-white border-r border-slate-200">
 {/* Logo */}
 <div className="p-5 border-b border-slate-200">
 <Link href="/" className="flex items-center gap-3">
 <div>
 <p className="font-black text-base text-slate-900" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="text-[#F57C20]">PHYSICS</span>
 </p>
 <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Learning Platform</p>
 </div>
 </Link>
 </div>

 {/* Nav */}
 <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
 <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-3 text-slate-400">Main Menu</p>
    {NAV.map(({ id, label, icon: Icon }) => (
      <button key={id} onClick={() => { setActiveSection(id as Section); setSidebarOpen(false); }}
        className={`nav-item w-full ${activeSection === id ? 'active' : ''}`}>
        <Icon className="w-4.5 h-4.5 shrink-0" />
        {label}
        {id === 'payments' && pending.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
            {pending.length}
          </span>
        )}
        {id === 'notices' && notices.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#F57C20]">
            {notices.length}
          </span>
        )}
      </button>
    ))}

 <div className="border-t my-4 border-slate-200" />
 <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-3 text-slate-400">Explore</p>
 <Link href="/classes" className="nav-item">
 <Play className="w-4.5 h-4.5 shrink-0" /> Browse Classes
 </Link>
 </nav>

 {/* Bottom */}
 <div className="p-4 border-t border-slate-200">
 <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
 <div className="w-9 h-9 rounded-xl bg-[#F57C20] flex items-center justify-center font-bold text-white text-sm shrink-0">
 {user.fullName.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
 <p className="text-xs text-slate-400 truncate">Student</p>
 </div>
 <button onClick={() => { clearAuth(); router.push('/'); }}
 className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500">
 <LogOut className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </aside>
 );

 return (
 <div className="flex min-h-screen bg-white">
 {/* Desktop Sidebar */}
 <div className="hidden lg:block shrink-0"><Sidebar /></div>

 {/* Mobile Sidebar */}
 {sidebarOpen && (
 <div className="lg:hidden fixed inset-0 z-50 flex">
 <div className="w-64 shrink-0"><Sidebar /></div>
 <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
 </div>
 )}

 {/* Main Content */}
 <div className="flex-1 flex flex-col min-h-screen">

 {/* Top Header */}
 <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
 <div className="flex items-center gap-3">
 <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl card-sm flex items-center justify-center">
 <Menu className="w-5 h-5 text-1" />
 </button>
 <div>
   <h1 className="font-bold text-1 text-base capitalize" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {activeSection === 'overview' ? 'Dashboard' : activeSection === 'classes' ? 'My Classes' : activeSection === 'notices' ? 'Notices' : activeSection === 'settings' ? 'Settings' : 'Payments'}
            </h1>
 <p className="text-xs text-3">
 {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 {/* Search */}
 <div className="relative hidden sm:block">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
 <input type="text" placeholder="Search..." className="input pl-9 py-2 text-sm h-9 w-44 lg:w-56" />
 </div>
 {/* Bell */}
 <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-2 hover:bg-slate-100 transition-colors">
 <Bell className="w-4.5 h-4.5" />
 {pending.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />}
 </button>
 {/* Avatar */}
 <div className="w-9 h-9 rounded-xl bg-[#F57C20] flex items-center justify-center text-sm font-bold text-white">
 {user.fullName.charAt(0)}
 </div>
 </div>
 </header>

 {/* Page Body */}
 <div className="flex-1 p-5 lg:p-6 bg-slate-50">
 <div className="grid lg:grid-cols-3 gap-5 max-w-7xl mx-auto">

 {/* Left + Center */}
 <div className="lg:col-span-2 space-y-5">

 {/* -- Overview -- */}
 {activeSection ==='overview' && (
 <>
 {/* Welcome Banner */}
 <div className="rounded-2xl p-6 text-white relative overflow-hidden"
 style={{ background:'linear-gradient(135deg, #1E3A5F 0%, #2d4a6f 50%, #F57C20 100%)' }}>
 <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/[0.06]"
 style={{ transform:'translate(30%,-30%)' }} />
 <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/[0.04]"
 style={{ transform:'translate(-50%,40%)' }} />
 <div className="relative z-10">
 <p className="text-white/70 text-sm font-medium mb-1">Welcome back</p>
 <h2 className="text-2xl font-black mb-2" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 {firstNameFromFullName(user.fullName)}!
 </h2>
 <p className="text-white/70 text-sm max-w-xs">
 You have <span className="text-white font-bold">{enrolled.length}</span> active courses.
 {pending.length > 0 && <> <span className="text-yellow-300 font-bold">{pending.length}</span> pending verification.</>}
 </p>
 <button onClick={() => setActiveSection('classes')}
 className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-90 bg-white/20 border border-white/25">
 Continue Learning <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>

 {/* Enrolled Classes Cards */}
 {enrolled.length > 0 && (
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-1 text-base">Continue Learning</h2>
 <button onClick={() => setActiveSection('classes')} className="text-xs text-[#F57C20] font-semibold hover:underline flex items-center gap-1">
 View all <ChevronRight className="w-3 h-3" />
 </button>
 </div>
 <div className="grid sm:grid-cols-2 gap-4">
 {enrolled.slice(0, 4).map((p, i) => {
 const cls = p.classId;
 const url = imgUrl(cls.thumbnail);
 const color = THUMB_COLORS[i % THUMB_COLORS.length];
 const pct = Math.floor(Math.random() * 30 + 40);
 const colors = ['#F57C20','#10B981','#0EA5E9','#F59E0B'];
 const ringColor = colors[i % colors.length];
 return (
 <Link href={`/classes/${cls._id}`} key={p._id}>
 <div className="card card-hover p-4 flex gap-4">
 <div className={`w-16 h-16 rounded-xl shrink-0 overflow-hidden ${!url ? color :''}`}>
 {url
 ? <img src={url} alt={cls.title} className="w-full h-full object-cover" />
 : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-7 h-7 text-white/60" /></div>
 }
 </div>
 <div className="flex-1 min-w-0">
 <p className="font-bold text-1 text-sm line-clamp-1">{cls.title}</p>
 <p className="text-xs text-3 mt-0.5 mb-2">{cls.instructor}</p>
 <div className="flex items-center gap-2">
 <div className="flex-1 h-1.5 bg-surface-2 rounded-full">
 <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: ringColor }} />
 </div>
 <span className="text-[10px] font-bold shrink-0" style={{ color: ringColor }}>{pct}%</span>
 </div>
 </div>
 <div className="shrink-0 self-center">
 <CircleProgress pct={pct} color={ringColor} size={44} strokeWidth={4} />
 </div>
 </div>
 </Link>
 );
 })}
 </div>
 </div>
 )}

 {/* Enrollments Table */}
 <div>
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-bold text-1 text-base">All Enrollments</h2>
 <button onClick={() => setActiveSection('payments')} className="text-xs text-[#F57C20] font-semibold hover:underline flex items-center gap-1">
 View all <ChevronRight className="w-3 h-3" />
 </button>
 </div>
 <div className="card overflow-hidden">
 {loading ? (
 <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-12 rounded-xl" />)}</div>
 ) : payments.length === 0 ? (
 <div className="p-12 text-center">
 <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-4">
 <BookOpen className="w-8 h-8 text-3" />
 </div>
 <h3 className="font-bold text-1 mb-2">No Enrollments Yet</h3>
 <p className="text-3 text-sm mb-5">Browse classes and submit your payment to get started.</p>
 <Link href="/classes" className="btn-primary text-sm inline-flex">Browse Classes</Link>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="bg-surface-2">
 <th className="text-left px-5 py-3.5 text-xs font-bold text-3 uppercase tracking-wider">Class</th>
 <th className="text-left px-5 py-3.5 text-xs font-bold text-3 uppercase tracking-wider hidden sm:table-cell">Subject</th>
 <th className="text-left px-5 py-3.5 text-xs font-bold text-3 uppercase tracking-wider hidden md:table-cell">Date</th>
 <th className="text-left px-5 py-3.5 text-xs font-bold text-3 uppercase tracking-wider">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-theme">
 {payments.filter(p => p.classId).map((p, i) => {
 const cls = p.classId;
 const url = imgUrl(cls.thumbnail);
 const st = STATUS[p.status] || STATUS.pending;
 const color = THUMB_COLORS[i % THUMB_COLORS.length];
 return (
 <tr key={p._id} className="hover:bg-surface-2 transition-colors">
 <td className="px-5 py-3.5">
 <div className="flex items-center gap-3">
 <div className={`w-9 h-9 rounded-xl shrink-0 overflow-hidden ${!url ? color :''}`}>
 {url
 ? <img src={url} alt="" className="w-full h-full object-cover" />
 : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-white/70" /></div>
 }
 </div>
 <div className="min-w-0">
 <p className="font-semibold text-1 line-clamp-1 text-sm">{cls.title}</p>
 <p className="text-xs text-3">{cls.instructor}</p>
 </div>
 </div>
 </td>
 <td className="px-5 py-3.5 hidden sm:table-cell">
 <span className="badge badge-primary">{cls.subject}</span>
 </td>
 <td className="px-5 py-3.5 text-3 text-xs hidden md:table-cell">
 {new Date(p.createdAt).toLocaleDateString()}
 </td>
 <td className="px-5 py-3.5">
 <span className={`badge ${st.cls}`}>{st.label}</span>
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
 </>
 )}

 {/* -- Classes Section -- */}
 {activeSection ==='classes' && (
 <div className="space-y-4">
 {loading ? (
 <div className="grid sm:grid-cols-2 gap-4">
 {[1,2,3,4].map(i => <div key={i} className="card overflow-hidden"><div className="shimmer h-28 w-full" /><div className="p-4 space-y-2"><div className="shimmer h-4 w-3/4 rounded" /><div className="shimmer h-3 w-1/2 rounded" /></div></div>)}
 </div>
 ) : enrolled.length === 0 ? (
 <div className="card p-14 text-center">
 <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-5">
 <BookOpen className="w-10 h-10 text-3" />
 </div>
 <h3 className="font-bold text-1 text-xl mb-2">No Enrolled Classes</h3>
 <p className="text-3 text-sm mb-6">Browse classes and submit your payment slip to get started.</p>
 <Link href="/classes" className="btn-primary inline-flex items-center gap-2">
 Browse Classes <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 ) : (
 <div className="grid sm:grid-cols-2 gap-4">
 {enrolled.map((p, i) => {
 const cls = p.classId;
 const url = imgUrl(cls.thumbnail);
 const color = THUMB_COLORS[i % THUMB_COLORS.length];
 const colors = ['#F57C20','#10B981','#0EA5E9','#F59E0B'];
 const ringColor = colors[i % colors.length];
 const pct = Math.floor(Math.random() * 35 + 40);
 return (
 <div key={p._id} className="card card-hover overflow-hidden">
 <div className={`h-36 overflow-hidden ${!url ? color :''}`}>
 {url
 ? <img src={url} alt={cls.title} className="w-full h-full object-cover" />
 : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-12 h-12 text-white/50" /></div>
 }
 </div>
 <div className="p-4">
 <div className="flex items-start justify-between gap-2 mb-2">
 <div>
 <p className="font-bold text-1 text-sm">{cls.title}</p>
 <p className="text-xs text-3 mt-0.5">{cls.instructor}</p>
 </div>
 <CircleProgress pct={pct} color={ringColor} size={44} strokeWidth={4} />
 </div>
 <div className="flex gap-3 text-xs text-3 mb-3">
 <span className="flex items-center gap-1"><Video className="w-3 h-3" /> {cls.recordings?.length || 0} recordings</span>
 <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {cls.liveClasses?.length || 0} live</span>
 </div>
 {p.verificationExpiresAt && (
 <p className="text-xs mb-3 flex items-center gap-1 text-amber-500">
 <Clock className="w-3 h-3" /> Expires {new Date(p.verificationExpiresAt).toLocaleDateString()}
 </p>
 )}
 <Link href={`/classes/${cls._id}`} className="btn-primary w-full justify-center text-sm py-2.5">
 Go to Class
 </Link>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {/* -- Payments Section -- */}
 {activeSection ==='payments' && (
 <div className="card overflow-hidden">
 <div className="px-5 py-4 border-b border-theme flex items-center justify-between">
 <h3 className="font-bold text-1">Payment History</h3>
 <span className="badge badge-primary">{payments.length} records</span>
 </div>
 {loading ? (
 <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="shimmer h-16 rounded-xl" />)}</div>
 ) : payments.length === 0 ? (
 <div className="p-10 text-center"><p className="text-3 text-sm">No payment records found.</p></div>
 ) : (
 <div className="divide-y divide-theme">
 {payments.filter(p => p.classId).map((p) => {
 const st = STATUS[p.status] || STATUS.pending;
 return (
 <div key={p._id} className="px-5 py-4 flex items-center justify-between hover:bg-surface-2 transition-colors">
 <div className="flex-1 min-w-0 mr-4">
 <p className="font-semibold text-1 text-sm line-clamp-1">{p.classId?.title}</p>
 <p className="text-xs text-3 mt-0.5">
 Submitted {new Date(p.createdAt).toLocaleDateString()}
 {p.nic && <> &middot; NIC {p.nic}</>}
 {p.verificationExpiresAt && p.isEnrolled && <> &middot; Expires {new Date(p.verificationExpiresAt).toLocaleDateString()}</>}
 </p>
 </div>
 <span className={`badge ${st.cls} shrink-0`}>{st.label}</span>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

              {/* -- Notices Section -- */}
              {activeSection === 'notices' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-1 text-base">Class Notices</h2>
                      <p className="text-sm text-3">{notices.length} notices from your enrolled classes</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card p-5"><div className="shimmer h-16 rounded-xl" /></div>)}</div>
                  ) : notices.length === 0 ? (
                    <div className="card p-14 text-center">
                      <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-5">
                        <Bell className="w-10 h-10 text-3" />
                      </div>
                      <h3 className="font-bold text-1 text-xl mb-2">No Notices Yet</h3>
                      <p className="text-3 text-sm">Notices from your enrolled classes will appear here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notices.map(notice => {
                        const NIcon = NOTICE_ICONS[notice.type] || Info;
                        const nColor = NOTICE_COLORS[notice.type] || '#F57C20';
                        return (
                          <div key={notice._id} className="card p-5 hover:border-primary/30 transition-all">
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${nColor}15` }}>
                                <NIcon className="w-5 h-5" style={{ color: nColor }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h4 className="font-bold text-1 text-sm">{notice.title}</h4>
                                  <span className="text-[10px] text-3 shrink-0">{new Date(notice.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-2 mb-2 whitespace-pre-wrap">{notice.content}</p>
                                <div className="flex items-center gap-2">
                                  <span className="badge badge-primary text-[10px]">{notice.classId?.title}</span>
                                  <span className="text-[10px] font-semibold capitalize px-2 py-0.5 rounded-full"
                                    style={{ background: `${nColor}15`, color: nColor }}>{notice.type}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* -- Settings Section -- */}
              {activeSection === 'settings' && (
                <div className="space-y-5">
                  {/* Edit Profile */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-bold text-1 text-base">Edit Profile</h3>
                      {!editProfile && (
                        <button onClick={() => setEditProfile(true)} className="btn-secondary text-sm gap-1.5 py-2 px-4">
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                      )}
                    </div>
                    {editProfile ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">Full Name</label>
                          <div className="relative">
                            <div className="input-icon"><User className="w-4 h-4 text-[#F57C20]" /></div>
                            <input type="text" value={profileForm.fullName}
                              onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                              className="input pl-14" placeholder="Your full name" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">Email</label>
                          <div className="relative">
                            <div className="input-icon"><Mail className="w-4 h-4 text-slate-400" /></div>
                            <input type="email" value={user.email} disabled
                              className="input pl-14 bg-surface-2 text-3 cursor-not-allowed" />
                          </div>
                          <p className="text-xs text-3 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">Phone</label>
                          <div className="relative">
                            <div className="input-icon"><Phone className="w-4 h-4 text-[#F57C20]" /></div>
                            <input type="tel" value={profileForm.phone}
                              onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                              className="input pl-14" placeholder="Your phone number" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">Address</label>
                          <div className="relative">
                            <div className="input-icon"><MapPin className="w-4 h-4 text-[#F57C20]" /></div>
                            <input type="text" value={profileForm.address}
                              onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                              className="input pl-14" placeholder="Your address" />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => {
                            setEditProfile(false);
                            setProfileForm({ fullName: profile?.fullName || '', phone: profile?.phone || '', address: profile?.address || '' });
                          }} className="btn-secondary flex-1 py-2.5">Cancel</button>
                          <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary flex-1 py-2.5 gap-2">
                            {savingProfile
                              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <><Save className="w-4 h-4" />Save Changes</>
                            }
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[
                          { icon: User, label: 'Full Name', value: profile?.fullName || user.fullName },
                          { icon: Mail, label: 'Email', value: user.email },
                          { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set' },
                          { icon: MapPin, label: 'Address', value: profile?.address || 'Not set' },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 border border-theme">
                              <Icon className="w-4 h-4 text-[#F57C20]" />
                            </div>
                            <div>
                              <p className="text-xs text-3 font-medium">{label}</p>
                              <p className="text-sm font-semibold text-1">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Change Password */}
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="font-bold text-1 text-base">Change Password</h3>
                        <p className="text-xs text-3 mt-1">Update your password to keep your account secure</p>
                      </div>
                      {!showPassFields && (
                        <button onClick={() => setShowPassFields(true)} className="btn-secondary text-sm gap-1.5 py-2 px-4">
                          <Lock className="w-3.5 h-3.5" /> Change
                        </button>
                      )}
                    </div>
                    {showPassFields && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">Current Password</label>
                          <div className="relative">
                            <div className="input-icon"><Lock className="w-4 h-4 text-[#F57C20]" /></div>
                            <input type="password" value={currentPassword}
                              onChange={e => setCurrentPassword(e.target.value)}
                              className="input pl-14" placeholder="Enter current password" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">New Password</label>
                          <div className="relative">
                            <div className="input-icon"><Lock className="w-4 h-4 text-[#F57C20]" /></div>
                            <input type="password" value={newPassword}
                              onChange={e => setNewPassword(e.target.value)}
                              className="input pl-14" placeholder="Minimum 6 characters" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-2 mb-1.5">Confirm New Password</label>
                          <div className="relative">
                            <div className="input-icon"><Lock className="w-4 h-4 text-[#F57C20]" /></div>
                            <input type="password" value={confirmNewPassword}
                              onChange={e => setConfirmNewPassword(e.target.value)}
                              className="input pl-14" placeholder="Re-enter new password" />
                          </div>
                        </div>
                        {newPassword && confirmNewPassword && newPassword !== confirmNewPassword && (
                          <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                        )}
                        <div className="flex gap-3 pt-2">
                          <button onClick={() => {
                            setShowPassFields(false);
                            setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
                          }} className="btn-secondary flex-1 py-2.5">Cancel</button>
                          <button onClick={handleChangePassword}
                            disabled={savingPassword || !currentPassword || !newPassword || newPassword.length < 6 || newPassword !== confirmNewPassword}
                            className="btn-primary flex-1 py-2.5 gap-2 disabled:opacity-60">
                            {savingPassword
                              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              : <><Lock className="w-4 h-4" />Update Password</>
                            }
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

 </div>

 {/* Right Panel */}
 <div className="space-y-5">

 {/* Profile Card */}
 <div className="card p-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-1 text-sm">My Profile</h3>
 <button onClick={() => setActiveSection('settings')} className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-3 hover:text-1 transition-colors">
 <Settings className="w-3.5 h-3.5" />
 </button>
 </div>
 <div className="flex flex-col items-center text-center mb-5">
 <div className="w-16 h-16 rounded-2xl bg-[#F57C20] flex items-center justify-center text-2xl font-black text-white mb-3 shadow-lg"
 style={{ boxShadow:'0 4px 20px rgba(245,124,32,0.40)' }}>
 {user.fullName.charAt(0)}
 </div>
 <h4 className="font-bold text-1 text-base">{user.fullName}</h4>
 <span className="badge badge-primary mt-2">Student</span>
 </div>
 {/* Stars */}
 <div className="flex justify-center gap-0.5 mb-4">
 {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
 </div>
 {profile && (
 <div className="space-y-2.5 border-t border-theme pt-4">
 {[
 [Mail, user.email],
 [Phone, profile.phone ||'Not set'],
 [MapPin, profile.address ||'Not set'],
 ].map(([Icon, val], i) => (
 <div key={i} className="flex items-center gap-2.5 text-xs">
 <div className="w-7 h-7 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
 <Icon className="w-3.5 h-3.5 text-[#F57C20]" />
 </div>
 <span className="text-2 truncate">{val as string}</span>
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Progress Card */}
 <div className="card p-5">
 <h3 className="font-bold text-1 text-sm mb-4">My Progress</h3>
 <div className="space-y-3.5">
 {[
 { label:'Classes Enrolled', value: enrolled.length, max: Math.max(enrolled.length, 1), color:'#F57C20' },
 { label:'Pending Payments', value: pending.length, max: Math.max(pending.length || 1, 1), color:'#F59E0B' },
 { label:'Total Classes', value: payments.length, max: Math.max(payments.length || 1, 1), color:'#10B981' },
 ].map(({ label, value, max, color }) => (
 <div key={label}>
 <div className="flex items-center justify-between text-xs mb-2">
 <span className="font-medium text-2">{label}</span>
 <span className="font-bold text-1">{value}</span>
 </div>
 <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
 <div className="h-2 rounded-full transition-all duration-700"
 style={{ width: `${(value / max) * 100}%`, background: color }} />
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Quick Actions */}
 <div className="card p-5">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-1 text-sm">Quick Actions</h3>
 </div>
 <div className="space-y-2">
 {[
 { label:'Browse new classes', sub:'Explore available courses', icon: BookOpen, color:'#F57C20', href:'/classes' },
 { label:'Check payments', sub: `${pending.length} pending review`,icon: Clock, color:'#F59E0B', href:'#' },
 { label:'Enrolled classes', sub: `${enrolled.length} active`, icon: CheckCircle, color:'#10B981', href:'#' },
 ].map(({ label, sub, icon: Icon, color, href }) => (
 <a key={label} href={href}
 onClick={href ==='#' ? (e) => { e.preventDefault(); if (label.includes('payment')) setActiveSection('payments'); else setActiveSection('classes'); } : undefined}
 className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group">
 <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
 style={{ background: `${color}18` }}>
 <Icon className="w-4.5 h-4.5" style={{ color }} />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-1 line-clamp-1">{label}</p>
 <p className="text-xs text-3">{sub}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-3 group-hover:text-[#F57C20] transition-colors" />
 </a>
 ))}
 </div>
 </div>

 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
