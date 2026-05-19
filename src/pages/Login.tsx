import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Loader2, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Fetch role then redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        if (profile?.role === 'admin') navigate('/dashboard/admin');
        else navigate('/dashboard/member');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;
        
        if (data.user) {
          // Manual profile creation to ensure data is saved immediately
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              { 
                id: data.user.id, 
                full_name: fullName, 
                email: email,
                phone_number: phoneNumber,
                role: 'member'
              }
            ]);
            
          if (profileError) console.error('Profile creation error:', profileError);
          
          alert('Registration successful! You can now login.');
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-[#0A2540]/5 rounded-full blur-[120px] -z-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-[#0A2540]/10 border border-gray-100"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0A2540] rounded-3xl mb-8 shadow-xl shadow-[#0A2540]/20 rotate-3">
            <User className="text-[#D4AF37]" size={40} />
          </div>
          <h2 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-3">
            {isLogin ? 'Divine Entry' : 'New Beginning'}
          </h2>
          <p className="text-gray-400 font-light">
            {isLogin ? 'Welcome back to your spiritual workspace.' : 'Join the FPE fellowship community.'}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm italic">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300"><User size={18} /></div>
                  <input
                    type="text" required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all placeholder-gray-300"
                    placeholder="E.g. Samuel Adegboyega"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300"><Phone size={18} /></div>
                  <input
                    type="tel" required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all placeholder-gray-300"
                    placeholder="+234..."
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Email Domain</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300"><Mail size={18} /></div>
              <input
                type="email" required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all placeholder-gray-300"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Secret Key</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300"><Lock size={18} /></div>
              <input
                type="password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-[#D4AF37] outline-none transition-all placeholder-gray-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-5 rounded-2xl shadow-xl shadow-[#0A2540]/20 text-lg font-bold text-[#0A2540] bg-[#D4AF37] hover:bg-[#c4a132] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                {isLogin ? 'Proceed to Workspace' : 'Initialize Account'} <ArrowRight className="ml-3" size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-[#0A2540] hover:text-[#D4AF37] transition-all italic border-b border-gray-100 pb-1"
          >
            {isLogin ? "Don't have an account? Join us" : 'Already have access? Proceed'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
