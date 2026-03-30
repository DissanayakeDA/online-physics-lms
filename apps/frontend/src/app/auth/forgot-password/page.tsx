'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

type Step = 'email' | 'otp' | 'reset';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { toast.error('Please enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('OTP verified!');
      setStep('reset');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword: password });
      toast.success('Password reset successfully! Please login.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  const steps = [
    { id: 'email', label: 'Email', num: 1 },
    { id: 'otp', label: 'Verify', num: 2 },
    { id: 'reset', label: 'Reset', num: 3 },
  ];
  const currentIdx = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-14"
        style={{ background: 'linear-gradient(150deg, #1E3A5F 0%, #2d4a6f 50%, #F57C20 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full"
          style={{ background: 'rgba(245,124,32,0.20)', transform: 'translate(40%,-40%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
          style={{ background: 'rgba(245,124,32,0.10)', transform: 'translate(-40%,40%)' }} />

        <div className="relative z-10 text-white max-w-sm">
          <Link href="/" className="inline-flex items-center mb-12">
            <span className="text-2xl font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Online<span className="text-orange-200">PHYSICS</span>
            </span>
          </Link>

          <h2 className="text-4xl font-black mb-4 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Reset Your Password
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-8">
            Don&apos;t worry! It happens to the best of us. Enter your email and we&apos;ll send you an OTP to reset your password.
          </p>

          {/* Visual steps */}
          <div className="space-y-4">
            {[
              { icon: Mail, text: 'Enter your registered email' },
              { icon: KeyRound, text: 'Verify with 6-digit OTP' },
              { icon: ShieldCheck, text: 'Set your new password' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 transition-opacity ${i <= currentIdx ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${i <= currentIdx ? 'bg-white/20' : 'bg-white/5'} border border-white/20`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80 text-sm font-medium">{item.text}</span>
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
            <span className="font-black text-xl text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Online<span className="gradient-text">PHYSICS</span>
            </span>
          </Link>

          <div className="card p-8">
            {/* Progress steps */}
            <div className="flex items-center justify-center gap-2 mb-7">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < currentIdx ? 'bg-green-500 text-white' :
                    i === currentIdx ? 'gradient-primary text-white shadow-md' :
                    'bg-surface-2 text-3'
                  }`}>
                    {i < currentIdx ? '✓' : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${i === currentIdx ? 'text-1' : 'text-3'}`}>{s.label}</span>
                  {i < steps.length - 1 && <div className={`w-8 h-0.5 rounded ${i < currentIdx ? 'bg-green-500' : 'bg-surface-2'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Email */}
            {step === 'email' && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Forgot Password?
                  </h1>
                  <p className="text-sm text-3 mt-2">
                    Enter the email address associated with your account
                  </p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-2 mb-1.5">Email address</label>
                    <div className="relative">
                      <div className="input-icon">
                        <Mail className="w-4 h-4 text-[#F57C20]" />
                      </div>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        className="input pl-14" placeholder="you@example.com" autoComplete="email" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-base">
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Send OTP</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Enter OTP
                  </h1>
                  <p className="text-sm text-3 mt-2">
                    We sent a 6-digit code to <span className="font-semibold text-[#F57C20]">{email}</span>
                  </p>
                </div>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-2 mb-1.5">6-Digit OTP</label>
                    <div className="relative">
                      <div className="input-icon">
                        <KeyRound className="w-4 h-4 text-[#F57C20]" />
                      </div>
                      <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input pl-14 text-center text-xl tracking-[0.5em] font-bold" placeholder="000000" maxLength={6} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading || otp.length !== 6}
                    className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-base">
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Verify OTP</span><ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                  <button type="button" onClick={() => { setOtp(''); handleSendOtp({ preventDefault: () => {} } as any); }}
                    className="w-full text-sm text-[#F57C20] font-semibold hover:underline text-center py-2">
                    Resend OTP
                  </button>
                </form>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 'reset' && (
              <>
                <div className="mb-7">
                  <h1 className="text-2xl font-black text-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Set New Password
                  </h1>
                  <p className="text-sm text-3 mt-2">
                    Create a strong password for your account
                  </p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-2 mb-1.5">New Password</label>
                    <div className="relative">
                      <div className="input-icon">
                        <Lock className="w-4 h-4 text-[#F57C20]" />
                      </div>
                      <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                        className="input pl-14 pr-12" placeholder="Minimum 6 characters" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-surface-2 flex items-center justify-center text-3 hover:text-2 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-2 mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <div className="input-icon">
                        <ShieldCheck className="w-4 h-4 text-[#F57C20]" />
                      </div>
                      <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                        className="input pl-14" placeholder="Re-enter your password" />
                    </div>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 font-medium">Passwords do not match</p>
                  )}
                  <button type="submit" disabled={loading || !password || password.length < 6 || password !== confirmPassword}
                    className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed text-base">
                    {loading
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Reset Password</span><ShieldCheck className="w-4 h-4" /></>
                    }
                  </button>
                </form>
              </>
            )}

            {/* Back to login */}
            <div className="mt-5 text-center">
              <Link href="/auth/login" className="text-sm text-[#F57C20] font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
