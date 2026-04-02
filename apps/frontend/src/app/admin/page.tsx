'use client';

import { useState, useEffect } from'react';
import { useRouter } from'next/navigation';
import Link from'next/link';
import { useAuthStore } from'../../store/authStore';
import api from'../../lib/api';
import { firstNameFromFullName } from'../../lib/userDisplay';
import {
 LayoutDashboard, BookOpen, Users, CreditCard, Bell, LogOut,
 Menu, TrendingUp, CheckCircle, Clock, AlertTriangle,
 Search, ChevronRight, ArrowUp,
} from'lucide-react';
import AdminClasses from'../../components/admin/AdminClasses';
import AdminStudents from'../../components/admin/AdminStudents';
import AdminPayments from'../../components/admin/AdminPayments';
import AdminNotices from'../../components/admin/AdminNotices';

type Tab ='overview' |'classes' |'students' |'payments' |'notices';

interface Stats { totalStudents: number; totalClasses: number; pendingPayments: number; verifiedPayments: number; }

export default function AdminPage() {
 const router = useRouter();
 const { user, initAuth, clearAuth } = useAuthStore();
 const [tab, setTab] = useState<Tab>('overview');
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalClasses: 0, pendingPayments: 0, verifiedPayments: 0 });
 const [loading, setLoading] = useState(true);

 useEffect(() => { initAuth(); }, [initAuth]);

 useEffect(() => {
 if (!user) return;
 if (user.role !=='admin') { router.push('/dashboard'); return; }
 Promise.all([api.get('/users'), api.get('/classes'), api.get('/payments/all')])
 .then(([u, c, p]) => setStats({
 totalStudents: u.data.length,
 totalClasses: c.data.length,
 pendingPayments: p.data.filter((x: any) => x.status ==='pending').length,
 verifiedPayments: p.data.filter((x: any) => x.status ==='verified').length,
 }))
 .finally(() => setLoading(false));
 }, [user, router]);

 if (!user || user.role !=='admin') return (
 <div className="min-h-screen flex items-center justify-center bg-white">
 <div className="w-10 h-10 border-4 rounded-full animate-spin border-slate-200 border-t-[#F57C20]" />
 </div>
 );

 const NAV: { id: Tab; label: string; icon: any }[] = [
 { id:'overview', label:'Overview', icon: LayoutDashboard },
 { id:'classes', label:'Classes', icon: BookOpen },
 { id:'students', label:'Students', icon: Users },
 { id:'payments', label:'Payments', icon: CreditCard },
 { id:'notices', label:'Notices', icon: Bell },
 ];

 const STAT_CARDS = [
 { label:'Total Students', value: stats.totalStudents, icon: Users, color:'#F57C20', bg:'rgba(245,124,32,0.10)', trend:'+12%' },
 { label:'Total Classes', value: stats.totalClasses, icon: BookOpen, color:'#0EA5E9', bg:'rgba(14,165,233,0.10)', trend:'+5%' },
 { label:'Pending Payments', value: stats.pendingPayments, icon: Clock, color:'#F59E0B', bg:'rgba(245,158,11,0.10)', trend:'' },
 { label:'Verified Enrollments', value: stats.verifiedPayments, icon: CheckCircle, color:'#10B981', bg:'rgba(16,185,129,0.10)', trend:'+8%' },
 ];

 const Sidebar = () => (
 <aside className="w-64 flex flex-col h-screen sticky top-0 shrink-0 bg-white border-r border-slate-200">
 {/* Logo */}
 <div className="p-5 border-b border-slate-200">
 <Link href="/" className="flex items-center gap-3">
 <div>
 <p className="font-black text-base text-slate-900" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="text-[#F57C20]">PHYSICS</span>
 </p>
 <p className="text-[10px] font-bold uppercase tracking-wider text-[#F57C20]">Admin Panel</p>
 </div>
 </Link>
 </div>

 {/* Nav */}
 <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
 <p className="text-[10px] font-bold uppercase tracking-widest px-4 mb-3 text-slate-400">Management</p>
 {NAV.map(({ id, label, icon: Icon }) => (
 <button key={id} onClick={() => { setTab(id); setSidebarOpen(false); }}
 className={`nav-item w-full ${tab === id ?'active' :''}`}>
 <Icon className="w-4.5 h-4.5 shrink-0" />
 {label}
 {id ==='payments' && stats.pendingPayments > 0 && (
 <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
 {stats.pendingPayments}
 </span>
 )}
 </button>
 ))}
 </nav>

 {/* Bottom */}
 <div className="p-4 border-t border-slate-200">
 <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
 <div className="w-9 h-9 rounded-xl bg-[#F57C20] flex items-center justify-center font-bold text-white text-sm shrink-0">
 {user.fullName.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-slate-900 truncate">{user.fullName}</p>
 <p className="text-[10px] font-bold uppercase tracking-wider text-[#F57C20]">Administrator</p>
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
 {/* Desktop sidebar */}
 <div className="hidden lg:block shrink-0"><Sidebar /></div>

 {/* Mobile sidebar */}
 {sidebarOpen && (
 <div className="lg:hidden fixed inset-0 z-50 flex">
 <div className="w-64 shrink-0"><Sidebar /></div>
 <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
 </div>
 )}

 {/* Main */}
 <div className="flex-1 flex flex-col min-h-screen">
 {/* Header */}
 <header className="bg-white border-b border-slate-200 px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
 <div className="flex items-center gap-3">
 <button onClick={() => setSidebarOpen(true)} className="lg:hidden w-9 h-9 rounded-xl card-sm flex items-center justify-center">
 <Menu className="w-5 h-5 text-1" />
 </button>
 <div>
 <h1 className="font-bold text-1 capitalize" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 {tab ==='overview' ?'Dashboard Overview' : tab.charAt(0).toUpperCase() + tab.slice(1)}
 </h1>
 <p className="text-xs text-3">
 {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <div className="relative hidden sm:block">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-3" />
 <input type="text" placeholder="Search..." className="input pl-9 py-2 h-9 text-sm w-44 lg:w-56" />
 </div>
 {stats.pendingPayments > 0 && (
 <button onClick={() => setTab('payments')}
 className="hidden sm:flex items-center gap-2 badge badge-warning px-3 py-2 rounded-xl hover:opacity-90 transition-opacity text-xs font-bold">
 <AlertTriangle className="w-3.5 h-3.5" />
 {stats.pendingPayments} pending
 </button>
 )}
 <div className="w-9 h-9 rounded-xl bg-[#F57C20] flex items-center justify-center text-sm font-bold text-white">
 {user.fullName.charAt(0)}
 </div>
 </div>
 </header>

 <main className="flex-1 p-5 lg:p-6 bg-slate-50">
 {tab ==='overview' && (
 <div className="max-w-7xl mx-auto space-y-6">
 {/* Welcome banner */}
 <div className="rounded-2xl p-6 text-white relative overflow-hidden"
 style={{ background:'linear-gradient(135deg, #1E3A5F 0%, #2d4a6f 50%, #F57C20 100%)' }}>
 <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/[0.06]"
 style={{ transform:'translate(30%,-30%)' }} />
 <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-white/[0.04]"
 style={{ transform:'translate(-50%,40%)' }} />
 <div className="relative z-10">
 <p className="text-white/60 text-sm mb-1">Good day,</p>
 <h2 className="text-2xl font-black mb-2" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 {firstNameFromFullName(user.fullName)}!
 </h2>
 <p className="text-white/60 text-sm">
 You have <span className="text-white font-bold">{stats.pendingPayments}</span> pending payments to review.
 <span className="text-white font-bold"> {stats.totalStudents}</span> total students enrolled.
 </p>
 </div>
 </div>

 {/* Stat Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, trend }) => (
 <div key={label} className="card p-5 group hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => {
 if (label.includes('Student')) setTab('students');
 else if (label.includes('Class')) setTab('classes');
 else if (label.includes('Payment') || label.includes('Enrollments')) setTab('payments');
 }}>
 <div className="flex items-start justify-between mb-4">
 <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
 <Icon className="w-5 h-5" style={{ color }} />
 </div>
 {trend && (
 <span className="text-[10px] font-bold flex items-center gap-0.5 text-emerald-500">
 <ArrowUp className="w-2.5 h-2.5" /> {trend}
 </span>
 )}
 </div>
 <p className="text-3xl font-black text-1 mb-0.5">{loading ?'-' : value}</p>
 <p className="text-xs text-3 font-medium">{label}</p>
 <div className="flex items-center gap-1 mt-2 text-xs text-[#F57C20] font-semibold group-hover:underline">
 Manage <ChevronRight className="w-3 h-3" />
 </div>
 </div>
 ))}
 </div>

 {/* Quick Access */}
 <div>
 <h2 className="font-bold text-1 text-base mb-4">Quick Access</h2>
 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {NAV.slice(1).map(({ id, label, icon: Icon }) => (
 <button key={id} onClick={() => setTab(id)} className="card card-hover p-5 text-left group">
 <div className="w-11 h-11 rounded-xl bg-[#F57C20] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
 <Icon className="w-5 h-5 text-white" />
 </div>
 <p className="font-bold text-1 text-sm">{label}</p>
 <p className="text-xs text-3 mt-0.5">Manage {label.toLowerCase()}</p>
 </button>
 ))}
 </div>
 </div>

 {/* Tips card */}
 <div className="card p-6">
 <h3 className="font-bold text-1 mb-4 flex items-center gap-2 text-base">
 <div className="w-8 h-8 rounded-lg bg-[#F57C20] flex items-center justify-center">
 <TrendingUp className="w-4 h-4 text-white" />
 </div>
 Admin Quick Tips
 </h3>
 <div className="grid sm:grid-cols-2 gap-3">
 {[
 { tip:'Go to Payments tab to verify student payment slips', icon: CreditCard },
 { tip:'Payment verification automatically expires after 5 weeks', icon: Clock },
 { tip:'Add Zoom links under each class for live sessions', icon: BookOpen },
 { tip:'Use Notices tab to send announcements to specific classes', icon: Bell },
 ].map(({ tip, icon: Icon }) => (
 <div key={tip} className="flex items-start gap-3 p-3 rounded-xl bg-surface-2">
 <div className="w-8 h-8 rounded-lg bg-[#F57C20]/10 flex items-center justify-center shrink-0 mt-0.5">
 <Icon className="w-4 h-4 text-[#F57C20]" />
 </div>
 <p className="text-sm text-2 leading-relaxed">{tip}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {tab ==='classes' && <AdminClasses />}
 {tab ==='students' && <AdminStudents />}
 {tab ==='payments' && <AdminPayments />}
 {tab ==='notices' && <AdminNotices />}
 </main>
 </div>
 </div>
 );
}
