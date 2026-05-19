import { motion } from 'motion/react';
import { Target, Shield, Heart, Zap, History, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function About() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase.from('leaders').select('*').order('display_order');
      if (data) setLeaders(data);
      setLoading(false);
    };
    fetchLeaders();
  }, []);

  return (
    <div className="bg-white">
      {/* Dynamic Header */}
      <section className="bg-[#0A2540] py-32 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-serif italic">Our Sacred Journey</h1>
            <p className="text-2xl text-white/50 font-light max-w-3xl mx-auto italic leading-relaxed">
              Decades of spiritual nurturing and academic excellence at Federal Polytechnic Ede.
            </p>
          </motion.div>
        </div>
      </section>

      {/* History Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 space-y-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-[#0A2540]/5 rounded-2xl flex items-center justify-center text-[#D4AF37]"><History /></div>
                  <h2 className="text-[#0A2540] font-bold text-xs uppercase tracking-[0.4em]">The CACYOF Story</h2>
                </div>
                <h3 className="text-5xl font-bold text-[#0A2540] font-serif leading-tight">An Anchor in the <span className="italic">Campus Tide.</span></h3>
                <p className="text-gray-500 text-xl leading-relaxed font-light italic">
                  Established with a vision to preserve the youth in Christ amidst the academic trials, CACYOF FPE has grown into a titan of spiritual oversight and student mentorship.
                </p>
                <div className="grid grid-cols-2 gap-12 pt-10 border-t border-gray-100">
                   <div>
                     <div className="text-5xl font-bold text-[#D4AF37] mb-2 font-serif">25+</div>
                     <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Years of Integrity</div>
                   </div>
                   <div>
                     <div className="text-5xl font-bold text-[#D4AF37] mb-2 font-serif">1k+</div>
                     <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Alumni Globally</div>
                   </div>
                </div>
            </div>
            <div className="order-1 lg:order-2 relative px-12">
               <div className="aspect-[4/5] bg-gray-50 rounded-[4rem] overflow-hidden shadow-2xl relative z-10 border-[12px] border-white group">
                  <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&fit=crop" alt="History" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
               </div>
               <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#D4AF37]/10 rounded-[3rem] -z-10 rotate-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Bento */}
      <section className="py-32 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-[#0A2540] font-serif mb-4">Pillars of the Faith</h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Target, title: 'Divine Purpose', desc: 'Understanding why we were sent to Ede.', color: 'bg-blue-50' },
              { icon: Shield, title: 'Holy Integrity', desc: 'Sustaining character in the secret places.', color: 'bg-gold-50' },
              { icon: Heart, title: 'Love Unfeigned', desc: 'Bonding as a family of covenant youth.', color: 'bg-white' },
              { icon: Zap, title: 'Dominance', desc: 'Excelling where others merely exist.', color: 'bg-gray-50' },
            ].map((v, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -10 }}
                className={`${v.color} p-12 rounded-[2.5rem] border border-white shadow-sm flex flex-col justify-between h-80 transition-all hover:shadow-2xl`}
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#D4AF37] shadow-sm"><v.icon size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-[#0A2540] font-serif">{v.title}</h3>
                  <p className="text-gray-400 text-sm italic font-light">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Executive Council */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
             <h2 className="text-5xl font-bold text-[#0A2540] font-serif italic mb-4">The Executive Council</h2>
             <p className="text-gray-400 uppercase tracking-widest font-bold text-xs">Current Administration Session</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {loading ? (
              <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin inline" /></div>
            ) : leaders.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-300 italic">No leaders currently seated.</div>
            ) : leaders.map((l, i) => (
              <motion.div key={i} whileHover={{ y: -8 }} className="group">
                <div className="aspect-square rounded-[3rem] overflow-hidden mb-8 border-[12px] border-white shadow-xl shadow-[#0A2540]/5 group-hover:border-[#D4AF37]/10 transition-all duration-500">
                  <img src={l.image_url || 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=400&h=400&fit=crop'} alt={l.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-[#0A2540] font-serif italic">{l.name}</h3>
                  <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.3em] mt-2">{l.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
