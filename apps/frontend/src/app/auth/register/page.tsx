'use client';

import { useState } from'react';
import { useRouter } from'next/navigation';
import Link from'next/link';
import { useAuthStore } from'../../../store/authStore';
import api from'../../../lib/api';
import toast from'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, ArrowRight, CheckCircle } from'lucide-react';

export default function RegisterPage() {
 const [form, setForm] = useState({ fullName:'', email:'', password:'', confirmPassword:'', phone:'', address:'' });
 const [show, setShow] = useState(false);
 const [loading, setLoading] = useState(false);
 const { setAuth } = useAuthStore();
 const router = useRouter();

 const set = (e: React.ChangeEvent<HTMLInputElement>) =>
 setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!form.fullName || !form.email || !form.password) { toast.error('Fill required fields'); return; }
 if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
 if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
 setLoading(true);
 try {
 const { data } = await api.post('/auth/register', {
 fullName: form.fullName, email: form.email, password: form.password,
 phone: form.phone, address: form.address,
 });
 setAuth(data.user, data.access_token);
 toast.success('Account created! Welcome!');
 router.push('/dashboard');
 } catch (err: any) {
 toast.error(err.response?.data?.message ||'Registration failed');
 } finally { setLoading(false); }
 };

 const fields = [
 { name:'fullName', label:'Full Name', type:'text', icon: User, placeholder:'Sadew Kodikara', required: true },
 { name:'email', label:'Email Address', type:'email', icon: Mail, placeholder:'you@example.com', required: true },
 { name:'phone', label:'Phone Number', type:'tel', icon: Phone, placeholder:'+94 77 123 4567', required: false },
 { name:'address', label:'Address', type:'text', icon: MapPin, placeholder:'Your address', required: false },
 ];

 return (
 <div className="min-h-screen flex bg-white">
 {/* Left panel */}
 <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden items-center justify-center p-12"
 style={{ background:'linear-gradient(150deg, #1E3A5F 0%, #2d4a6f 50%, #F57C20 100%)' }}>
 <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
 style={{ background:'rgba(245,124,32,0.20)', transform:'translate(40%,-40%)' }} />
 <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full"
 style={{ background:'rgba(245,124,32,0.10)', transform:'translate(-40%,40%)' }} />

 <div className="relative z-10 text-white">
 <Link href="/" className="inline-flex items-center mb-10">
 <span className="text-2xl font-black" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="text-orange-200">PHYSICS</span>
 </span>
 </Link>

 <h2 className="text-4xl font-black mb-4 leading-tight" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Start your<br /><span className="text-orange-200">learning journey</span>
 </h2>
 <p className="text-white/65 text-sm leading-relaxed mb-8">
 Create your free account and get instant access to expert-led classes.
 </p>

 <div className="space-y-3 mb-10">
 {['One email = one secure account','Browse all classes for free','Easy payment slip submission','Admin-verified enrollment'].map((t) => (
 <div key={t} className="flex items-center gap-3">
 <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-orange-400/30">
 <CheckCircle className="w-3 h-3 text-orange-200" />
 </div>
 <span className="text-white/75 text-sm">{t}</span>
 </div>
 ))}
 </div>

 </div>
 </div>

 {/* Right - form */}
 <div className="flex-1 flex items-center justify-center px-4 py-8 bg-white">
 <div className="w-full max-w-md">
 <Link href="/" className="inline-flex items-center mb-6 lg:hidden">
 <span className="font-black text-xl text-1" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="gradient-text">PHYSICS</span>
 </span>
 </Link>

 <div className="card p-7">
 <div className="mb-6">
 <h1 className="text-2xl font-black text-1" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Create your account
 </h1>
 <p className="text-sm text-3 mt-2">
 Already have an account?{''}
 <Link href="/auth/login" className="text-[#F57C20] font-semibold hover:underline">Sign in</Link>
 </p>
 </div>

 <form onSubmit={handleSubmit} className="space-y-3.5">
 {fields.map(({ name, label, type, icon: Icon, placeholder, required }) => (
 <div key={name}>
 <label className="block text-sm font-semibold text-2 mb-1.5">
 {label} {required && <span style={{ color:'var(--danger)' }}>*</span>}
 </label>
 <div className="relative">
 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
 <Icon className="w-4 h-4 text-[#F57C20]" />
 </div>
 <input
 name={name} type={type}
 value={form[name as keyof typeof form]}
 onChange={set}
 className="input pl-14"
 placeholder={placeholder}
 />
 </div>
 </div>
 ))}

 <div>
 <label className="block text-sm font-semibold text-2 mb-1.5">
 Password <span style={{ color:'var(--danger)' }}>*</span>
 </label>
 <div className="relative">
 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
 <Lock className="w-4 h-4 text-[#F57C20]" />
 </div>
 <input
 name="password" type={show ?'text' :'password'}
 value={form.password} onChange={set}
 className="input pl-14 pr-12" placeholder="Min. 6 characters"
 />
 <button type="button" onClick={() => setShow(!show)}
 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-3 hover:text-2 transition-colors">
 {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <div>
 <label className="block text-sm font-semibold text-2 mb-1.5">
 Confirm Password <span style={{ color:'var(--danger)' }}>*</span>
 </label>
 <div className="relative">
 <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center">
 <Lock className="w-4 h-4 text-[#F57C20]" />
 </div>
 <input
 name="confirmPassword" type={show ?'text' :'password'}
 value={form.confirmPassword} onChange={set}
 className="input pl-14" placeholder="Repeat password"
 />
 </div>
 </div>

 <button type="submit" disabled={loading}
 className="btn-primary w-full py-3.5 mt-1 disabled:opacity-60 disabled:cursor-not-allowed text-base">
 {loading
 ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>
 }
 </button>
 </form>

 <p className="text-xs text-3 text-center mt-5">
 By signing up, you agree to our{''}
 <span className="text-[#F57C20] cursor-pointer hover:underline">Terms</span> and{''}
 <span className="text-[#F57C20] cursor-pointer hover:underline">Privacy Policy</span>.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
