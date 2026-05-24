import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface NavbarProps {
  session: any;
  role: string | null;
}

export default function Navbar({ session, role }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#0A2540] text-white sticky top-0 z-50 shadow-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <svg className="w-10 h-10 text-[#D4AF37]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#D4AF37" />
                  <circle cx="50" cy="50" r="38" stroke="#0A2540" strokeWidth="2" strokeDasharray="3 3" />
                  {/* Holy Cross */}
                  <path d="M50 22 V78 M33 45 H67" stroke="#0A2540" strokeWidth="6" strokeLinecap="round" />
                  {/* Rays of Spiritual Light */}
                  <path d="M36 30 L42 36 M58 64 L64 70 M64 30 L58 36 M42 64 L36 70" stroke="#0A2540" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <div className="text-center mt-0.5">
                  <span className="text-[7.5px] font-extrabold tracking-[0.15em] text-[#D4AF37] block leading-none">CACYOF</span>
                  <span className="text-[6.5px] font-bold tracking-[0.2em] text-white block leading-none mt-0.5">FPE</span>
                </div>
              </div>
              <div className="flex flex-col pl-1.5 border-l border-white/10">
                <span className="font-bold text-lg tracking-tight leading-none text-white">CACYOF FPE</span>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-medium mt-1">Youth Fellowship</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all hover:text-[#D4AF37] ${
                  isActive(link.path) ? 'text-[#D4AF37] underline underline-offset-8' : 'text-white/80'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {session ? (
              <div className="flex items-center space-x-4 border-l border-white/10 pl-8">
                <Link
                  to={role === 'admin' ? '/dashboard/admin' : '/dashboard/member'}
                  className="flex items-center space-x-2 bg-[#D4AF37] text-[#0A2540] px-5 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#D4AF37]/20"
                >
                  <LayoutDashboard size={18} />
                  <span>Portal</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-red-400 p-2 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 border-2 border-[#D4AF37] text-[#D4AF37] px-5 py-1.5 rounded-lg text-sm font-bold hover:bg-[#D4AF37] hover:text-[#0A2540] transition-all"
              >
                <User size={18} />
                <span>Login</span>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-[#D4AF37] transition-all"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0A2540]/95 backdrop-blur-md border-t border-white/10 px-4 pt-4 pb-8 space-y-2 absolute w-full shadow-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 rounded-xl text-base font-medium ${
                isActive(link.path) ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white hover:bg-white/5'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10">
            {session ? (
              <Link
                to={role === 'admin' ? '/dashboard/admin' : '/dashboard/member'}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 bg-[#D4AF37] text-[#0A2540] rounded-xl font-bold mb-2"
              >
                <LayoutDashboard size={20} />
                <span>Go to Portal</span>
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 border-2 border-[#D4AF37] text-[#D4AF37] rounded-xl font-bold"
              >
                <User size={20} />
                <span>Login / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
