'use client';

import { useEffect, useState } from'react';
import Link from'next/link';
import Navbar from'../components/Navbar';
import Footer from'../components/Footer';
import AboutTeacher from'../components/AboutTeacher';
import api, { getUploadsUrl } from'../lib/api';
import {
 ArrowRight, Users, BookOpen, ChevronRight,
 Headphones, MonitorPlay, FolderOpen, MessageCircle,
} from'lucide-react';

interface Class {
 _id: string; title: string; subject: string; instructor: string;
 price: number; thumbnail: string; duration: string; level: string;
 enrolledCount: number; description: string;
}



const FEATURES = [
 { icon: MonitorPlay, title:'100% Live Classes (සජීවී පන්ති)', desc:'සිද්ධාන්ත සජීවීව, සරලව සහ පැහැදිලිව ඉගෙන ගන්න. ඕනෑම අවස්ථාවක ඔබේ ගැටලු එසැණින් නිරාකරණය කරගැනීමේ අවස්ථාව.' },
 { icon: FolderOpen, title:'100% Organized Course (විධිමත් පාඨමාලාව)', desc:'ඒකකයෙන් ඒකකයට ක්‍රමවත්ව සැකසූ නිබන්ධන සහ දේශන මාලාව. විෂය නිර්දේශයේ සෑම කොටසක්ම ආවරණය වන පරිදි සැකසූ අංගසම්පූර්ණ පාඨමාලාව.' },
 { icon: Headphones, title:'24/7 Support (විසිහතර පැයේ සහය)', desc:'ඔබේ ඉගෙනීමේ කටයුතුවලදී පැන නගින තාක්ෂණික හෝ විෂයානුබද්ධ ගැටලු සඳහා ඕනෑම වේලාවක අපගේ සහය ලබාගත හැකිය.' },
 { icon: MessageCircle, title:'Direct Communication (සෘජු සම්බන්ධතාවය)', desc:'විෂය සම්බන්ධ ගැටලු හෝ අපැහැදිලි තැන් පිළිබඳව ඕනෑම අවස්ථාවක මා සමඟ සෘජුවම සාකච්ඡා කර නිවැරදි මග පෙන්වීම ලබාගැනීමේ හැකියාව.' },
];

const THUMB_COLORS = ['thumb-orange','thumb-purple','thumb-blue','thumb-teal','thumb-pink','thumb-green'];

function ClassCard({ cls, idx }: { cls: Class; idx: number }) {
 const imgUrl = getUploadsUrl(cls.thumbnail);
 const color = THUMB_COLORS[idx % THUMB_COLORS.length];

 return (
 <Link href={`/classes/${cls._id}`}>
 <div className="card card-hover overflow-hidden cursor-pointer group h-full flex flex-col">
 <div className={`relative h-44 overflow-hidden ${!imgUrl ? color :''}`}>
 {imgUrl
 ? <img src={imgUrl} alt={cls.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-14 h-14 text-white/40" /></div>
 }
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
 <div className="absolute top-3 left-3">
 <span className="badge text-white" style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)' }}>{cls.subject}</span>
 </div>
 <div className="absolute bottom-3 right-3">
 <span className="text-lg font-black text-white drop-shadow-lg">
 {cls.price === 0 ?'Free' : `LKR ${cls.price.toLocaleString()}`}
 </span>
 </div>
 </div>

 <div className="p-5 flex-1 flex flex-col">
 <h3 className="font-bold text-1 text-sm mb-1 line-clamp-1 group-hover:text-primary-c transition-colors">{cls.title}</h3>
 <p className="text-3 text-xs mb-3 line-clamp-2 flex-1 leading-relaxed">{cls.description}</p>
 <div className="flex items-center justify-between pt-3 border-t border-theme mt-auto">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-[#F57C20] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
 {cls.instructor.charAt(0)}
 </div>
 <span className="text-xs font-medium text-2 truncate max-w-[100px]">{cls.instructor}</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-3">
 <Users className="w-3 h-3" /> {cls.enrolledCount}
 </div>
 </div>
 </div>
 </div>
 </Link>
 );
}

export default function HomePage() {
 const [classes, setClasses] = useState<Class[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 api.get('/classes')
 .then((r) => { setClasses(r.data.slice(0, 6)); setLoading(false); })
 .catch(() => setLoading(false));
 }, []);

 return (
 <div className="min-h-screen bg-white">
 <Navbar />

   {/* Hero */}
   <section className="relative min-h-[92vh] flex flex-col pt-16 overflow-hidden"
   style={{ background: 'linear-gradient(135deg, #faf8f5 0%, #fff5eb 30%, #f0f4f8 60%, #faf8f5 100%)' }}>

   {/* ── Animated background layer ── */}
   <div className="absolute inset-0 pointer-events-none overflow-hidden">
   {/* Gradient blobs */}
   <div className="absolute top-10 left-[5%] w-[500px] h-[500px] rounded-full opacity-30"
   style={{ background: 'radial-gradient(circle, #F57C20 0%, transparent 70%)', animation: 'heroBlob1 18s ease-in-out infinite' }} />
   <div className="absolute bottom-10 right-[5%] w-[600px] h-[600px] rounded-full opacity-20"
   style={{ background: 'radial-gradient(circle, #2d4a6f 0%, transparent 70%)', animation: 'heroBlob2 22s ease-in-out infinite' }} />
   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-15"
   style={{ background: 'radial-gradient(circle, #F57C20 0%, transparent 70%)', animation: 'heroBlob3 15s ease-in-out infinite' }} />

   {/* Grid pattern */}
   <div className="absolute inset-0 opacity-[0.035]"
   style={{ backgroundImage: 'linear-gradient(#2d4a6f 1px, transparent 1px), linear-gradient(90deg, #2d4a6f 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

   {/* ── Physics SVG: Atom with orbiting electrons ── */}
   <svg className="absolute top-[12%] right-[8%] w-48 h-48 lg:w-64 lg:h-64 opacity-[0.30]" viewBox="0 0 200 200" fill="none">
   <circle cx="100" cy="100" r="8" fill="#F57C20" opacity="0.8" />
   <circle cx="100" cy="100" r="12" fill="none" stroke="#F57C20" strokeWidth="1" opacity="0.3" />
   <ellipse cx="100" cy="100" rx="70" ry="28" fill="none" stroke="#2d4a6f" strokeWidth="1" strokeDasharray="4 6" />
   <circle cx="0" cy="0" r="5" fill="#F57C20">
   <animateMotion dur="4s" repeatCount="indefinite" path="M170,100 A70,28 0 1,1 30,100 A70,28 0 1,1 170,100" />
   </circle>
   <ellipse cx="100" cy="100" rx="70" ry="28" fill="none" stroke="#2d4a6f" strokeWidth="1" strokeDasharray="4 6" transform="rotate(60 100 100)" />
   <circle cx="0" cy="0" r="5" fill="#2d4a6f">
   <animateMotion dur="5s" repeatCount="indefinite" path="M155,55 A70,28 60 1,1 45,145 A70,28 60 1,1 155,55" />
   </circle>
   <ellipse cx="100" cy="100" rx="70" ry="28" fill="none" stroke="#F57C20" strokeWidth="1" strokeDasharray="4 6" transform="rotate(-60 100 100)" />
   <circle cx="0" cy="0" r="4" fill="#F57C20" opacity="0.7">
   <animateMotion dur="6s" repeatCount="indefinite" path="M155,145 A70,28 -60 1,1 45,55 A70,28 -60 1,1 155,145" />
   </circle>
   </svg>

   {/* ── Physics SVG: Sine wave ── */}
   <svg className="absolute bottom-[22%] left-[3%] w-72 h-24 lg:w-96 lg:h-32 opacity-[0.25]" viewBox="0 0 400 100" fill="none">
   <path d="M0,50 Q25,10 50,50 Q75,90 100,50 Q125,10 150,50 Q175,90 200,50 Q225,10 250,50 Q275,90 300,50 Q325,10 350,50 Q375,90 400,50"
   stroke="#F57C20" strokeWidth="2.5" fill="none" strokeLinecap="round">
   <animate attributeName="d"
   values="M0,50 Q25,10 50,50 Q75,90 100,50 Q125,10 150,50 Q175,90 200,50 Q225,10 250,50 Q275,90 300,50 Q325,10 350,50 Q375,90 400,50;M0,50 Q25,30 50,50 Q75,70 100,50 Q125,30 150,50 Q175,70 200,50 Q225,30 250,50 Q275,70 300,50 Q325,30 350,50 Q375,70 400,50;M0,50 Q25,10 50,50 Q75,90 100,50 Q125,10 150,50 Q175,90 200,50 Q225,10 250,50 Q275,90 300,50 Q325,10 350,50 Q375,90 400,50"
   dur="3s" repeatCount="indefinite" />
   </path>
   <path d="M0,50 Q25,25 50,50 Q75,75 100,50 Q125,25 150,50 Q175,75 200,50 Q225,25 250,50 Q275,75 300,50 Q325,25 350,50 Q375,75 400,50"
   stroke="#2d4a6f" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" strokeDasharray="6 4">
   <animate attributeName="d"
   values="M0,50 Q25,25 50,50 Q75,75 100,50 Q125,25 150,50 Q175,75 200,50 Q225,25 250,50 Q275,75 300,50 Q325,25 350,50 Q375,75 400,50;M0,50 Q25,40 50,50 Q75,60 100,50 Q125,40 150,50 Q175,60 200,50 Q225,40 250,50 Q275,60 300,50 Q325,40 350,50 Q375,60 400,50;M0,50 Q25,25 50,50 Q75,75 100,50 Q125,25 150,50 Q175,75 200,50 Q225,25 250,50 Q275,75 300,50 Q325,25 350,50 Q375,75 400,50"
   dur="4s" repeatCount="indefinite" />
   </path>
   </svg>

   {/* ── Physics SVG: Pendulum ── */}
   <svg className="absolute top-[8%] left-[6%] w-28 h-40 lg:w-36 lg:h-48 opacity-[0.25]" viewBox="0 0 100 140" fill="none">
   <circle cx="50" cy="10" r="4" fill="#2d4a6f" />
   <line x1="30" y1="10" x2="70" y2="10" stroke="#2d4a6f" strokeWidth="2" />
   <g style={{ transformOrigin: '50px 10px' }}>
   <animateTransform attributeName="transform" type="rotate" values="-25;25;-25" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
   <line x1="50" y1="10" x2="50" y2="110" stroke="#2d4a6f" strokeWidth="1.5" />
   <circle cx="50" cy="115" r="10" fill="#F57C20" opacity="0.8" />
   <circle cx="50" cy="115" r="14" fill="none" stroke="#F57C20" strokeWidth="1" opacity="0.3" />
   </g>
   </svg>

   {/* ── Floating physics equations ── */}
   <div className="absolute top-[18%] left-[22%] text-2xl font-bold italic select-none"
   style={{ fontFamily: 'Georgia, serif', color: 'rgba(45,74,111,0.22)', animation: 'floatEquation 8s ease-in-out infinite' }}>
   E = mc²
   </div>
   <div className="absolute top-[65%] right-[12%] text-xl font-bold italic select-none"
   style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,124,32,0.25)', animation: 'floatEquation 10s ease-in-out infinite 1s' }}>
   F = ma
   </div>
   <div className="absolute bottom-[35%] left-[12%] text-lg font-bold italic select-none"
   style={{ fontFamily: 'Georgia, serif', color: 'rgba(45,74,111,0.20)', animation: 'floatEquation 9s ease-in-out infinite 2s' }}>
   {'ΔE · Δt ≥ ℏ/2'}
   </div>
   <div className="absolute top-[40%] right-[22%] text-lg font-bold italic select-none"
   style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,124,32,0.22)', animation: 'floatEquation 11s ease-in-out infinite 3s' }}>
   {'λ = h/p'}
   </div>
   <div className="absolute top-[30%] left-[65%] text-base font-bold italic select-none"
   style={{ fontFamily: 'Georgia, serif', color: 'rgba(45,74,111,0.18)', animation: 'floatEquation 12s ease-in-out infinite 4s' }}>
   {'∇ × B = μ₀J'}
   </div>

   {/* ── Physics SVG: Magnetic field lines ── */}
   <svg className="absolute top-[55%] right-[3%] w-40 h-40 lg:w-52 lg:h-52 opacity-[0.18]" viewBox="0 0 200 200" fill="none">
   <path d="M40,100 C40,40 100,20 100,100 C100,180 160,160 160,100" stroke="#2d4a6f" strokeWidth="1.5" fill="none">
   <animate attributeName="opacity" values="0.5;1;0.5" dur="4s" repeatCount="indefinite" />
   </path>
   <path d="M55,100 C55,50 100,35 100,100 C100,165 145,150 145,100" stroke="#F57C20" strokeWidth="1.5" fill="none">
   <animate attributeName="opacity" values="1;0.5;1" dur="4s" repeatCount="indefinite" />
   </path>
   <path d="M70,100 C70,60 100,50 100,100 C100,150 130,140 130,100" stroke="#2d4a6f" strokeWidth="1" fill="none" opacity="0.7">
   <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite" />
   </path>
   <polygon points="100,20 96,30 104,30" fill="#2d4a6f" opacity="0.5" />
   <polygon points="100,180 96,170 104,170" fill="#F57C20" opacity="0.5" />
   </svg>

   {/* ── Floating particles ── */}
   {[
   { top: '15%', left: '45%', size: 4, dur: '7s', delay: '0s', color: '#F57C20' },
   { top: '70%', left: '25%', size: 3, dur: '9s', delay: '1s', color: '#2d4a6f' },
   { top: '25%', left: '80%', size: 5, dur: '8s', delay: '2s', color: '#F57C20' },
   { top: '80%', left: '70%', size: 3, dur: '10s', delay: '3s', color: '#2d4a6f' },
   { top: '50%', left: '90%', size: 4, dur: '6s', delay: '1.5s', color: '#F57C20' },
   { top: '35%', left: '5%', size: 3, dur: '11s', delay: '4s', color: '#2d4a6f' },
   ].map((p, i) => (
   <div key={i} className="absolute rounded-full"
   style={{ top: p.top, left: p.left, width: p.size, height: p.size, backgroundColor: p.color, opacity: 0.30, animation: `floatParticle ${p.dur} ease-in-out infinite ${p.delay}` }} />
   ))}
   </div>

   {/* ── Hero content (flex-1 keeps CTAs above the feature bar; no overlap with absolute bottom strip) ── */}
   <div className="flex-1 flex items-center min-h-0 relative z-10 w-full">
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
   {/* Left column – text */}
   <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
   {/* Tagline */}
   <p className="text-[#2d4a6f] text-lg sm:text-xl font-medium italic mb-6 tracking-wide">
   Art of <span className="font-black not-italic uppercase">PHYSICS</span> by
   </p>

   {/* Name */}
   <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black leading-[1.05] mb-8" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
   <span className="text-[#2d3748] block">Pasindu</span>
   <span className="text-[#F57C20] block" style={{ textShadow: '0 4px 30px rgba(245,124,32,0.15)' }}>Serasinghe</span>
   </h1>

   {/* Credentials */}
   <div className="mb-10">
   <p className="text-[#2d3748] text-lg sm:text-xl font-bold mb-1">BSc. Physics</p>
   <p className="text-[#5a6a7e] text-base sm:text-lg italic">University of Kelaniya</p>
   </div>

   {/* CTA Buttons */}
   <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
   <Link href="/classes" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#F57C20] hover:bg-[#e06c10] text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-orange-400/30 active:scale-95">
   Ongoing classes <ArrowRight className="w-4 h-4" />
   </Link>
   <Link href="/auth/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all border-2 border-[#2d4a6f] text-[#2d4a6f] hover:bg-[#2d4a6f] hover:text-white">
   Register Now
   </Link>
   </div>
   </div>

   {/* Right column – hero image */}
   <div className="hidden lg:flex items-center justify-center relative">
   {/* Decorative glow behind image */}
   <div className="absolute w-[420px] h-[420px] rounded-full opacity-25"
   style={{ background: 'radial-gradient(circle, #F57C20 0%, transparent 70%)', filter: 'blur(40px)' }} />
   <img
   src="/hero-image.png"
   alt="Pasindu Serasinghe"
   className="relative z-10 w-full max-w-[480px] drop-shadow-2xl"
   style={{ animation: 'heroImageFloat 6s ease-in-out infinite' }}
   />
   </div>
   </div>
   </div>
   </div>

   {/* Feature cards bar — in flow below hero content so it never covers CTAs on small screens */}
   <div className="relative z-20 shrink-0 w-full">
   <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-t-2xl overflow-hidden shadow-xl">
   {FEATURES.map(({ icon: Icon, title }, i) => {
   const bgs = ['#F57C20','#E06C10','#2d4a6f','#1E3A5F'];
   return (
   <div key={title} className="flex items-center gap-3 px-5 py-4 text-white"
   style={{ background: bgs[i] }}>
   <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
   <Icon className="w-5 h-5 text-white" />
   </div>
   <span className="text-xs font-semibold leading-tight">{title}</span>
   </div>
   );
   })}
   </div>
   </div>
   </div>
   </section>



 {/* Why Choose Us */}
 <section className="py-24 bg-white">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="text-center mb-16">
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-50 text-[#F57C20] mb-4">
 Why Choose Us
 </span>
 <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Everything You Need to <span className="text-[#F57C20]">Succeed</span>
 </h2>
 <p className="text-gray-500 text-lg max-w-2xl mx-auto">
 Our platform provides all the tools you need to excel in your studies.
 </p>
 </div>

 <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
 {FEATURES.map(({ icon: Icon, title, desc }) => (
 <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
 <div className="w-14 h-14 rounded-2xl bg-[#F57C20] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-md shadow-orange-500/20">
 <Icon className="w-7 h-7 text-white" />
 </div>
 <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
 <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
 </div>
 ))}
 </div>
 </div>
  </section>

  {/* About Teacher */}
  <AboutTeacher />

  {/* Featured Classes */}
 <section className="py-24 bg-gray-50">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-end justify-between mb-12">
 <div>
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-50 text-[#F57C20] mb-3">
 Featured
 </span>
 <h2 className="text-4xl lg:text-5xl font-black text-gray-900" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Popular <span className="text-[#F57C20]">Classes</span>
 </h2>
 </div>
 <Link href="/classes" className="hidden sm:flex items-center gap-1.5 text-[#F57C20] hover:underline font-semibold text-sm">
 View All <ChevronRight className="w-4 h-4" />
 </Link>
 </div>

 {loading ? (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {[1,2,3].map(i => (
 <div key={i} className="card overflow-hidden">
 <div className="shimmer h-44 w-full" />
 <div className="p-5 space-y-3">
 <div className="shimmer h-5 w-3/4 rounded-lg" />
 <div className="shimmer h-4 w-full rounded-lg" />
 <div className="shimmer h-4 w-1/2 rounded-lg" />
 </div>
 </div>
 ))}
 </div>
 ) : classes.length === 0 ? (
 <div className="text-center py-16">
 <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
 <p className="text-gray-500">No classes yet. Check back soon!</p>
 </div>
 ) : (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {classes.map((cls, i) => <ClassCard key={cls._id} cls={cls} idx={i} />)}
 </div>
 )}

 <div className="text-center mt-10 sm:hidden">
 <Link href="/classes" className="btn-secondary inline-flex items-center gap-2">
 View All Classes <ChevronRight className="w-4 h-4" />
 </Link>
 </div>
 </div>
 </section>

 <Footer />
 </div>
 );
}
