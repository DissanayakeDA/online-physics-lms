import Link from'next/link';
import { Mail, Phone, MapPin, Github, Twitter, Instagram } from'lucide-react';

export default function Footer() {
 return (
 <footer className="bg-white border-t border-gray-100">
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
 <div className="md:col-span-1">
 <Link href="/" className="inline-flex items-center mb-4">
 <span className="font-bold text-xl text-gray-900" style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
 Online<span className="text-[#F57C20]">PHYSICS</span>
 </span>
 </Link>
 <p className="text-gray-500 text-sm leading-relaxed mb-5">
 A modern LMS empowering students to achieve their academic goals with live classes and expert instructors.
 </p>
 <div className="flex gap-2">
 {[Github, Twitter, Instagram].map((Icon, i) => (
 <button key={i} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#F57C20] hover:border-orange-300 transition-all">
 <Icon className="w-4 h-4" />
 </button>
 ))}
 </div>
 </div>

 <div>
 <h4 className="font-semibold text-gray-900 text-sm mb-4">Platform</h4>
 <ul className="space-y-2.5">
 {[['Home','/'],['Classes','/classes']].map(([l, h]) => (
 <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-[#F57C20] transition-colors">{l}</Link></li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-gray-900 text-sm mb-4">Students</h4>
 <ul className="space-y-2.5">
 {[['Register','/auth/register'],['Login','/auth/login'],['My Dashboard','/dashboard'],['Browse Classes','/classes']].map(([l, h]) => (
 <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-[#F57C20] transition-colors">{l}</Link></li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="font-semibold text-gray-900 text-sm mb-4">Contact</h4>
 <ul className="space-y-3">
 {([
 [Mail,'support@onlinephysics.lms'],
 [Phone,'+94 77 123 4567'],
 [MapPin,'Colombo, Sri Lanka'],
 ] as const).map(([Icon, val], i) => (
 <li key={i} className="flex items-center gap-2.5 text-sm text-gray-500">
 <Icon className="w-4 h-4 text-[#F57C20] shrink-0" />
 {val}
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="border-t border-gray-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
 <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} OnlinePHYSICS LMS. All rights reserved.</p>
 <div className="flex gap-6">
 <Link href="#" className="text-xs text-gray-500 hover:text-[#F57C20] transition-colors">Privacy Policy</Link>
 <Link href="#" className="text-xs text-gray-500 hover:text-[#F57C20] transition-colors">Terms of Service</Link>
 </div>
 </div>
 </div>
 </footer>
 );
}
