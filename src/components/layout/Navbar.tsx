import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import CacyofLogo from './CacyofLogo';

interface NavbarProps {
  session: any;
  role: string | null;
}

export default function Navbar({ session, role }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchLiveStatus();

    const channel = supabase
      .channel('navbar_live_status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_broadcasts' }, (payload: any) => {
        if (payload.new) {
          setIsLive(payload.new.is_live);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveStatus = async () => {
    try {
      const { data } = await supabase
        .from('live_broadcasts')
        .select('is_live')
        .order('created_at', { ascending: false })
        .limit(1);
      if (data && data.length > 0) {
        setIsLive(data[0].is_live);
      }
    } catch (err) {
      console.warn('Could not load navbar live status', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Live', path: '/live', isLiveBadge: true },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#0A2540] text-white sticky top-0 z-50 shadow-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <CacyofLogo size="md" theme="dark" />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-all hover:text-[#D4AF37] flex items-center space-x-1.5 ${
                  isActive(link.path) ? 'text-[#D4AF37] underline underline-offset-8' : 'text-white/80'
                }`}
              >
                <span>{link.name}</span>
                {link.isLiveBadge && isLive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
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
              className={`px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between ${
                isActive(link.path) ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'text-white hover:bg-white/5'
              }`}
            >
              <span>{link.name}</span>
              {link.isLiveBadge && isLive && (
                <span className="flex items-center space-x-1 bg-red-500/10 text-red-400 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  <span>LIVE</span>
                </span>
              )}
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
