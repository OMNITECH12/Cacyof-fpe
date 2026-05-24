import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A2540] text-white pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-[#D4AF37] rounded-full flex items-center justify-center text-[#0A2540] font-bold text-xl">C</div>
              <span className="font-bold text-xl tracking-tight">CACYOF FPE</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-8 font-light italic">
              "Raising a God-fearing generation of youth equipped for spiritual excellence and academic dominance."
            </p>
            <div className="flex space-x-4">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#0A2540] transition-all">
                  <Icon size={18} />
                </a>
              ))}
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
                <span className="text-[#D4AF37]/80 text-xs font-mono uppercase tracking-wider">8:00 AM — 11:30 AM</span>
              </div>
              <div className="flex flex-col border-l border-[#D4AF37]/30 pl-3">
                <span className="text-white text-sm font-bold mb-0.5">Expository Bible Study</span>
                <span className="text-[#D4AF37]/80 text-xs font-mono uppercase tracking-wider">Wednesdays, 6:00 PM — 8:00 PM</span>
              </div>
              <div className="flex flex-col border-l border-[#D4AF37]/30 pl-3">
                <span className="text-white text-sm font-bold mb-0.5">Breakthrough Hour Service</span>
                <span className="text-[#D4AF37]/80 text-xs font-mono uppercase tracking-wider">Thursdays, 6:00 PM — 8:00 PM</span>
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
                <span className="text-sm text-white/50">+234 800 000 0000</span>
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
