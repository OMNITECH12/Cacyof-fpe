import { Link } from 'react-router-dom';
import { Facebook, Youtube, Music, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A2540] text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex flex-col items-start mb-8 group">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-[#D4AF37]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="#D4AF37" />
                    <circle cx="50" cy="50" r="38" stroke="#0A2540" strokeWidth="2" strokeDasharray="3 3" />
                    {/* Holy Cross */}
                    <path d="M50 22 V78 M33 45 H67" stroke="#0A2540" strokeWidth="6" strokeLinecap="round" />
                    {/* Rays of Spiritual Light */}
                    <path d="M36 30 L42 36 M58 64 L64 70 M64 30 L58 36 M42 64 L36 70" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="text-center mt-1">
                    <span className="text-[10px] font-extrabold tracking-[0.2em] text-[#D4AF37] block leading-none">CACYOF</span>
                    <span className="text-[8px] font-bold tracking-[0.25em] text-white block leading-none mt-0.5">FPE</span>
                  </div>
                </div>
                <div className="flex flex-col pl-1 border-l border-white/10">
                  <span className="font-bold text-lg tracking-tight leading-none group-hover:text-[#D4AF37] transition-colors">CACYOF FPE</span>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-medium mt-1">Youth Fellowship</span>
                </div>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 font-light italic">
              "Raising a God-fearing generation of youth equipped for spiritual excellence and academic dominance."
            </p>
            <div className="flex flex-col space-y-3 mt-4">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-[0.15em] block mb-1">Our Media Handles</span>
              <a href="https://facebook.com/cacyoffedpolyede" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-white/60 hover:text-[#D4AF37] transition-all text-sm font-light">
                <Facebook size={16} />
                <span>cacyof fed poly ede</span>
              </a>
              <a href="https://tiktok.com/@cacyof_fpe" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-white/60 hover:text-[#D4AF37] transition-all text-sm font-light">
                <Music size={16} />
                <span>cacyof fpe</span>
              </a>
              <a href="https://youtube.com/c/cacyoffpe" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-white/60 hover:text-[#D4AF37] transition-all text-sm font-light">
                <Youtube size={16} />
                <span>cacyof fpe</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em] mb-8">Fellowship</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white/50 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/about" className="text-white/50 hover:text-white transition-colors text-sm">About History</Link></li>
              <li><Link to="/blog" className="text-white/50 hover:text-white transition-colors text-sm">Spiritual Feed</Link></li>
              <li><Link to="/contact" className="text-white/50 hover:text-white transition-colors text-sm">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em] mb-8">Meeting Times</h3>
            <div className="space-y-4">
              <div className="flex flex-col">
                <span className="text-white text-sm font-bold mb-0.5">Sunday Service</span>
                <span className="text-[#D4AF37]/80 text-xs font-mono uppercase tracking-wider">8:00 AM — 11:00 AM</span>
              </div>
              <div className="flex flex-col border-l border-[#D4AF37]/30 pl-3">
                <span className="text-white text-sm font-bold mb-0.5">Expository Bible Study</span>
                <span className="text-[#D4AF37]/80 text-xs font-mono uppercase tracking-wider">Mondays, 6:00 PM — 8:00 PM</span>
              </div>
              <div className="flex flex-col border-l border-[#D4AF37]/30 pl-3">
                <span className="text-white text-sm font-bold mb-0.5">Breakthrough Hour Service</span>
                <span className="text-[#D4AF37]/80 text-xs font-mono uppercase tracking-wider">Wednesdays, 6:00 PM — 8:00 PM</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em] mb-8">Reach Out</h3>
            <ul className="space-y-6">
              <li className="flex items-start space-x-4 group">
                <MapPin size={18} className="text-[#D4AF37] shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-white/50 leading-relaxed font-light italic">Federal Polytechnic Ede, North Campus, Osun State.</span>
              </li>
              <li className="flex items-center space-x-4">
                <Phone size={18} className="text-[#D4AF37] shrink-0" />
                <span className="text-sm text-white/50">+2348132202310</span>
              </li>
              <li className="flex items-center space-x-4">
                <Mail size={18} className="text-[#D4AF37] shrink-0" />
                <span className="text-sm text-white/50">fellowship@cacyof-fpe.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <div className="text-center md:text-left space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">
              &copy; {new Date().getFullYear()} CACYOF FPE. All rights reserved.
            </p>
            <p className="text-[9px] uppercase tracking-[0.15em] text-[#D4AF37] opacity-60">
              Created by CACYOF FPE PUB - OMNITECH MULTICONCEPT INC
            </p>
          </div>
          <div className="flex space-x-8 text-[10px] uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
