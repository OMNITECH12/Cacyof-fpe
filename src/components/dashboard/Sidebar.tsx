import { Link, useLocation } from 'react-router-dom';
import { 
  User, 
  Quote, 
  Bell, 
  LogOut, 
  Users, 
  FileText, 
  Send,
  LayoutDashboard,
  X,
  Video
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SidebarProps {
  role: 'member' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const memberLinks = [
    { name: 'My Profile', path: '/dashboard/member', icon: User },
    { name: 'Submit Quote', path: '/dashboard/member/quotes', icon: Quote },
    { name: 'Board Notices', path: '/dashboard/member/notifications', icon: Bell },
  ];

  const adminLinks = [
    { name: 'Membership', path: '/dashboard/admin', icon: Users },
    { name: 'Blog Studio', path: '/dashboard/admin/blog', icon: FileText },
    { name: 'Broadcast', path: '/dashboard/admin/broadcast', icon: Send },
    { name: 'Quote Desk', path: '/dashboard/admin/quotes', icon: Quote },
    { name: 'Church Leaders', path: '/dashboard/admin/leaders', icon: User },
    { name: 'Live Stream', path: '/dashboard/admin/live', icon: Video },
  ];

  const links = role === 'admin' ? adminLinks : memberLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0A2540]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 w-72 bg-[#0A2540] text-white z-50 flex flex-col p-8 border-r border-white/5 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
         <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center text-[#D4AF37]">
                <LayoutDashboard size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none italic uppercase">Portal</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                  {role}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white p-2">
              <X size={24} />
            </button>
        </div>

        <nav className="flex-grow space-y-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => { if(window.innerWidth < 1024) onClose(); }}
                className={`flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${
                  isActive 
                    ? 'bg-[#D4AF37] text-[#0A2540] font-bold shadow-xl shadow-[#D4AF37]/10' 
                    : 'text-white/40 hover:bg-white/5 hover:text-[#D4AF37]'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#0A2540]' : 'text-[#D4AF37]'} />
                <span className="text-sm tracking-wide">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 mt-8 border-t border-white/5 space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 px-5 py-4 rounded-2xl w-full text-left text-red-400 group hover:bg-red-400/5 transition-all"
          >
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest text center">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
