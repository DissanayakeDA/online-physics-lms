import Link from'next/link';
import { Mail, Phone, MapPin, Facebook, Youtube } from'lucide-react';

const SOCIAL_LINKS = [
  {
    href: 'https://www.facebook.com/share/1CeNdWJCSn/?mibextid=wwXIfr',
    label: 'Facebook',
    Icon: Facebook,
  },
  {
    href: 'https://youtube.com/@pasinduserasinghe-01?si=6JjKThY7TovFj_ht',
    label: 'YouTube',
    Icon: Youtube,
  },
] as const;

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

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
 A modern LMS empowering students to achieve their academic goals with live classes and expert instructor.
 </p>
 <div className="flex gap-2">
 {SOCIAL_LINKS.map(({ href, label, Icon: SIcon }) => (
 <a
 key={label}
 href={href}
 target="_blank"
 rel="noopener noreferrer"
 aria-label={label}
 className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#F57C20] hover:border-orange-300 transition-all"
 >
 <SIcon className="w-4 h-4" />
 </a>
 ))}
 <a
 href="https://www.tiktok.com/@pasindu.serasinghe?_r=1&_t=ZS-95AwUd4TqU6"
 target="_blank"
 rel="noopener noreferrer"
 aria-label="TikTok"
 className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#F57C20] hover:border-orange-300 transition-all"
 >
 <TikTokIcon className="w-4 h-4" />
 </a>
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
 <li className="flex items-center gap-2.5 text-sm text-gray-500">
 <Mail className="w-4 h-4 text-[#F57C20] shrink-0" />
 <a href="mailto:pasindu.ser@icloud.com" className="hover:text-[#F57C20] transition-colors">
 pasindu.ser@icloud.com
 </a>
 </li>
 <li className="flex items-center gap-2.5 text-sm text-gray-500">
 <Phone className="w-4 h-4 text-[#F57C20] shrink-0" />
 <a href="tel:+94769942470" className="hover:text-[#F57C20] transition-colors">
 076 994 2470
 </a>
 </li>
 <li className="flex items-center gap-2.5 text-sm text-gray-500">
 <MapPin className="w-4 h-4 text-[#F57C20] shrink-0" />
 Colombo, Sri Lanka
 </li>
 </ul>
 </div>
 </div>

 <div className="border-t border-gray-100 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
 <div className="text-center sm:text-left">
 <p className="text-sm text-gray-500">
 &copy; {new Date().getFullYear()} KyndexLabs . All rights reserved.
 </p>
 </div>
 <div className="flex gap-6">
 <Link href="#" className="text-xs text-gray-500 hover:text-[#F57C20] transition-colors">Privacy Policy</Link>
 <Link href="#" className="text-xs text-gray-500 hover:text-[#F57C20] transition-colors">Terms of Service</Link>
 </div>
 </div>
 </div>
 </footer>
 );
}
