'use client';

import { useState, useEffect } from'react';
import Link from'next/link';
import Navbar from'../../components/Navbar';
import Footer from'../../components/Footer';
import api, { getUploadsUrl } from'../../lib/api';
import { BookOpen, Search, Users, Clock, SlidersHorizontal, X, Star, ChevronRight } from'lucide-react';

interface Class {
 _id: string; title: string; subject: string; instructor: string; price: number;
 thumbnail: string; duration: string; level: string; enrolledCount: number;
 description: string; status: string; tags: string[];
}

const LEVELS = ['All','Beginner','Intermediate','Advanced'];
const THUMB_COLORS = ['thumb-orange','thumb-purple','thumb-blue','thumb-teal','thumb-pink','thumb-green'];

export default function ClassesPage() {
 const [classes, setClasses] = useState<Class[]>([]);
 const [filtered, setFiltered] = useState<Class[]>([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState('');
 const [level, setLevel] = useState('All');
 const [price, setPrice] = useState('all');
 const [showFilters, setShowFilters] = useState(false);

 useEffect(() => {
 api.get('/classes').then(r => { setClasses(r.data); setFiltered(r.data); setLoading(false); }).catch(() => setLoading(false));
 }, []);

 useEffect(() => {
 let r = [...classes];
 if (search) r = r.filter(c => [c.title, c.subject, c.instructor].some(s => s.toLowerCase().includes(search.toLowerCase())));
 if (level !=='All') r = r.filter(c => c.level === level);
 if (price ==='free') r = r.filter(c => c.price === 0);
 if (price ==='paid') r = r.filter(c => c.price > 0);
 setFiltered(r);
 }, [search, level, price, classes]);

 const imgUrl = (t: string) => getUploadsUrl(t);
 const filterCount = (level !=='All' ? 1 : 0) + (price !=='all' ? 1 : 0);

 const LEVEL_COLORS: Record<string, string> = {
 Beginner:'#05CD99', Intermediate:'#FFCB45', Advanced:'#FF5B5B',
 };

 return (
 <div className="min-h-screen bg-white">
 <Navbar />

 {/* Hero Header */}
 <section className="pt-28 pb-12 relative overflow-hidden"
 style={{ background:'linear-gradient(135deg, #1E3A5F 0%, #2d4a6f 50%, #F57C20 100%)' }}>
 <div className="absolute top-0 right-0 w-96 h-96 rounded-full"
 style={{ background:'rgba(245,124,32,0.2)', transform:'translate(30%,-30%)' }} />
 <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full"
 style={{ background:'rgba(245,124,32,0.1)', transform:'translate(-20%,40%)' }} />

 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
 <div className="text-center mb-10">
 <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 bg-orange-400/20 text-orange-200 border border-orange-400/30">
 All Courses
 </span>
 <h1 className="text-4xl lg:text-5xl font-black text-white mb-4" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Explore Our <span className="text-orange-200">Classes</span>
 </h1>
 <p className="text-white/60 max-w-xl mx-auto text-base">
 Browse our curated collection. No account needed to explore - enroll when ready.
 </p>
 </div>

 {/* Search row */}
 <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 text-orange-200/60" />
 <input
 type="text" value={search}
 onChange={e => setSearch(e.target.value)}
 placeholder="Search classes, subjects, instructors..."
 className="w-full h-12 pl-12 pr-10 rounded-xl text-sm outline-none transition-all bg-white/10 border border-white/15 text-white backdrop-blur-md placeholder:text-white/40"
 />
 {search && (
 <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-200/60">
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 <button onClick={() => setShowFilters(!showFilters)}
 className={`h-12 px-5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border border-white/15 text-white backdrop-blur-md ${showFilters ?'bg-[#F57C20]' :'bg-white/10'}`}>
 <SlidersHorizontal className="w-4 h-4" />
 Filters
 {filterCount > 0 && (
 <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center bg-yellow-400 text-slate-900">
 {filterCount}
 </span>
 )}
 </button>
 </div>

 {/* Filter panel */}
 {showFilters && (
 <div className="max-w-2xl mx-auto mt-4 p-5 rounded-2xl animate-in bg-white/[0.08] border border-white/[0.12] backdrop-blur-xl">
 <div className="grid sm:grid-cols-2 gap-5">
 <div>
 <label className="text-xs font-bold uppercase tracking-wider block mb-3 text-orange-200/60">Level</label>
 <div className="flex flex-wrap gap-2">
 {LEVELS.map(l => (
 <button key={l} onClick={() => setLevel(l)}
 className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all border ${level === l ?'bg-[#F57C20] text-white border-[#F57C20]' :'bg-white/[0.08] text-orange-200/70 border-white/[0.12]'}`}>
 {l}
 </button>
 ))}
 </div>
 </div>
 <div>
 <label className="text-xs font-bold uppercase tracking-wider block mb-3 text-orange-200/60">Price</label>
 <div className="flex flex-wrap gap-2">
 {[['all','All'],['free','Free'],['paid','Paid']].map(([v, l]) => (
 <button key={v} onClick={() => setPrice(v)}
 className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all border ${price === v ?'bg-[#F57C20] text-white border-[#F57C20]' :'bg-white/[0.08] text-orange-200/70 border-white/[0.12]'}`}>
 {l}
 </button>
 ))}
 </div>
 </div>
 </div>
 {filterCount > 0 && (
 <button onClick={() => { setSearch(''); setLevel('All'); setPrice('all'); }}
 className="text-sm mt-4 hover:underline text-red-400">
 Clear all filters
 </button>
 )}
 </div>
 )}
 </div>
 </section>

 {/* Classes Grid */}
 <section className="py-12">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex items-center justify-between mb-6">
 <p className="text-sm text-3 font-medium">
 {loading ?'Loading...' : <><span className="font-bold text-1">{filtered.length}</span> class{filtered.length !== 1 ?'es' :''} found</>}
 </p>
 </div>

 {loading ? (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {[1,2,3,4,5,6].map(i => (
 <div key={i} className="card overflow-hidden">
 <div className="shimmer h-48 w-full" />
 <div className="p-5 space-y-3">
 <div className="shimmer h-5 w-3/4 rounded-lg" />
 <div className="shimmer h-4 w-full rounded-lg" />
 <div className="shimmer h-4 w-1/2 rounded-lg" />
 </div>
 </div>
 ))}
 </div>
 ) : filtered.length === 0 ? (
 <div className="card p-16 text-center">
 <div className="w-20 h-20 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto mb-5">
 <BookOpen className="w-10 h-10 text-3" />
 </div>
 <h3 className="font-bold text-1 text-xl mb-2">No Classes Found</h3>
 <p className="text-3 mb-6">Try adjusting your search or filters.</p>
 <button onClick={() => { setSearch(''); setLevel('All'); setPrice('all'); }} className="btn-primary inline-flex">
 Reset Filters
 </button>
 </div>
 ) : (
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {filtered.map((cls, i) => {
 const url = imgUrl(cls.thumbnail);
 const color = THUMB_COLORS[i % THUMB_COLORS.length];
 return (
 <Link key={cls._id} href={`/classes/${cls._id}`}>
 <div className="card card-hover overflow-hidden cursor-pointer group h-full flex flex-col">
 {/* Thumbnail */}
 <div className={`relative h-48 overflow-hidden ${!url ? color :''}`}>
 {url
 ? <img src={url} alt={cls.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
 : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-16 h-16 text-white/40" /></div>
 }
 <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

 {/* Badges */}
 <div className="absolute top-3 left-3 flex gap-2">
 <span className="badge text-white text-[10px] bg-black/55 backdrop-blur-sm">
 {cls.subject}
 </span>
 {cls.level && (
 <span className="badge text-[10px]"
 style={{ background: `${LEVEL_COLORS[cls.level] ||'#F57C20'}25`, color: LEVEL_COLORS[cls.level] ||'#F57C20', border: `1px solid ${LEVEL_COLORS[cls.level] ||'#F57C20'}40` }}>
 {cls.level}
 </span>
 )}
 </div>

 {cls.status ==='upcoming' && (
 <div className="absolute top-3 right-3">
 <span className="badge text-[10px] bg-yellow-400 text-slate-900 font-bold">UPCOMING</span>
 </div>
 )}

 <div className="absolute bottom-3 right-3">
 <span className="text-lg font-black text-white drop-shadow-lg">
 {cls.price === 0 ?'Free' : `LKR ${cls.price.toLocaleString()}`}
 </span>
 </div>
 </div>

 {/* Content */}
 <div className="p-5 flex-1 flex flex-col">
 <h3 className="font-bold text-1 mb-1 line-clamp-1 group-hover:text-[#F57C20] transition-colors">{cls.title}</h3>
 <p className="text-3 text-xs mb-3 line-clamp-2 flex-1 leading-relaxed">{cls.description}</p>

 {/* Stars */}
 <div className="flex items-center gap-1.5 mb-3">
 <div className="flex gap-0.5">
 {[1,2,3,4,5].map(j => <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}
 </div>
 <span className="text-xs text-3">(4.8)</span>
 </div>

 <div className="flex items-center justify-between pt-3 border-t border-theme">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-full bg-[#F57C20] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
 {cls.instructor.charAt(0)}
 </div>
 <span className="text-xs font-semibold text-2 truncate max-w-[100px]">{cls.instructor}</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-3">
 <Users className="w-3 h-3" /> {cls.enrolledCount}
 {cls.duration && <><Clock className="w-3 h-3 ml-1" /> {cls.duration}</>}
 </div>
 </div>

 <div className="mt-3">
 <div className="w-full py-2.5 rounded-xl text-xs font-semibold text-center text-[#F57C20] border border-[#F57C20]/30 group-hover:bg-[#F57C20]/5 transition-colors">
 View Class <ChevronRight className="inline w-3 h-3 ml-0.5" />
 </div>
 </div>
 </div>
 </div>
 </Link>
 );
 })}
 </div>
 )}
 </div>
 </section>

 <Footer />
 </div>
 );
}
