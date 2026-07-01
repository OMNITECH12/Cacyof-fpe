import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import BlogDetail from './pages/BlogDetail';
import MemberDashboard from './pages/dashboard/MemberDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import Live from './pages/Live';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    }).catch(err => {
      console.error('Initial session fetch failed:', err);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data) setRole(data.role);
      else if (error) console.error('Error fetching role:', error);
    } catch (err) {
      console.error('Role fetch exception:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A2540]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  // Handle missing configuration
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="min-h-screen bg-[#0A2540] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A2540] mb-4 font-serif">Setup Required</h2>
          <p className="text-gray-500 mb-8 font-light italic">
            Database connection keys are missing. Please add <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-gray-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your environment variables in the Settings menu.
          </p>
          <div className="space-y-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Need help?</p>
            <p className="text-sm text-gray-500">Check the <code className="text-[#D4AF37]">.env.example</code> file or contact the developer for the fellowship credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white text-[#0A2540]">
        <Navbar session={session} role={role} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/live" element={<Live />} />
            <Route path="/login" element={session ? (
              role === 'admin' ? <Navigate to="/dashboard/admin" /> : <Navigate to="/dashboard/member" />
            ) : <Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard/member/*" 
              element={session && (role === 'member' || role === 'admin') ? <MemberDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/dashboard/admin/*" 
              element={session && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
