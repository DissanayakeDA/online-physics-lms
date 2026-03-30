'use client';

import { useState, useEffect } from'react';
import Link from'next/link';
import { useRouter } from'next/navigation';
import { useAuthStore } from'../../../store/authStore';
import api from'../../../lib/api';
import toast from'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from'lucide-react';

export default function LoginPage() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [show, setShow] = useState(false);
 const [loading, setLoading] = useState(false);
 const { setAuth, user } = useAuthStore();
 const router = useRouter();

 useEffect(() => {
 if (user) router.push(user.role ==='admin' ?'/admin' :'/dashboard');
 }, [user, router]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!email || !password) { toast.error('Please fill all fields'); return; }
 setLoading(true);
 try {
 const { data } = await api.post('/auth/login', { email, password });
 setAuth(data.user, data.access_token);
 toast.success(`Welcome back, ${data.user.fullName.split('')[0]}!`);
 router.push(data.user.role ==='admin' ?'/admin' :'/dashboard');
 } catch (err: any) {
 toast.error(err.response?.data?.message ||'Invalid credentials');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen flex bg-white">
 {/* Left panel */}
 <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-14"
 style={{ background:'linear-gradient(150deg, #1E3A5F 0%, #2d4a6f 50%, #F57C20 100%)' }}>
 {/* Decorative blobs */}
 <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
 style={{ background:'rgba(245,124,32,0.20)', transform:'translate(40%,-40%)' }} />
 <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
 style={{ background:'rgba(245,124,32,0.10)', transform:'translate(-40%,40%)' }} />

 {/* Floating card */}
 <div className="absolute bottom-24 right-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4" style={{ animation:'float 7s ease-in-out infinite', animationDelay:'1s' }}>
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(5,205,153,0.25)' }}>
 <CheckCircle className="w-5 h-5" style={{ color:'#05CD99' }} />
 </div>
 <div>
 <p className="text-white text-xs font-bold">Enrolled!</p>
 <p className="text-white/60 text-[10px]">Physics - Grade 12</p>
 </div>
 </div>
 </div>

 <div className="relative z-10 text-white max-w-sm">
 <Link href="/" className="inline-flex items-center mb-12">
 <span className="text-2xl font-black" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="text-orange-200">PHYSICS</span>
 </span>
 </Link>

 <h2 className="text-4xl font-black mb-4 leading-tight" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Welcome Back!
 </h2>
 <p className="text-white/70 text-base leading-relaxed mb-8">
 Continue your learning journey. Access live classes, recordings and expert instructors.
 </p>

 <div className="space-y-3 mb-10">
 {['Access all enrolled classes instantly','Watch live & recorded sessions','Track your learning progress',
 ].map((t) => (
 <div key={t} className="flex items-center gap-3">
 <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-orange-400/30">
 <CheckCircle className="w-3 h-3 text-orange-200" />
 </div>
 <span className="text-white/80 text-sm">{t}</span>
 </div>
 ))}
 </div>

 </div>
 </div>

 {/* Right - form */}
 <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white">
 <div className="w-full max-w-md">
 {/* Mobile logo */}
 <Link href="/" className="inline-flex items-center mb-8 lg:hidden">
 <span className="font-black text-xl text-1" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="gradient-text">PHYSICS</span>
 </span>
 </Link>

 <div className="card p-8">
 <div className="mb-7">
 <h1 className="text-2xl font-black text-1" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Sign in to your account
 </h1>
 <p className="text-sm text-3 mt-2">
 Don&apos;t have an account?{''}
 <Link href="/auth/register" className="text-[#F57C20] font-semibold hover:underline">Create one free</Link>
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-semibold text-2 mb-1.5">Email address</label>
 <div className="relative">
 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
 <Mail className="w-4 h-4 text-[#F57C20]" />
 </div>
 <input
 type="email" value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="input pl-14"
 placeholder="you@example.com"
 autoComplete="email"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold text-2 mb-1.5">Password</label>
 <div className="relative">
 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
 <Lock className="w-4 h-4 text-[#F57C20]" />
 </div>
 <input
 type={show ?'text' :'password'} value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="input pl-14 pr-12"
 placeholder="Enter your password"
 autoComplete="current-password"
 />
 <button type="button" onClick={() => setShow(!show)}
 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-3 hover:text-2 transition-colors">
 {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <button type="submit" disabled={loading}
 className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-base">
 {loading
 ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
 }
 </button>
 </form>

 <div className="mt-4 text-center">
 <Link href="/auth/forgot-password" className="text-sm text-[#F57C20] font-semibold hover:underline">
 Forgot your password?
 </Link>
 </div>

 <div className="mt-4 p-4 rounded-xl border border-theme bg-surface-2">
 <p className="text-xs text-center text-2">
 <span className="font-bold text-[#F57C20]">Admin?</span> Use your admin credentials to access the admin panel.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
