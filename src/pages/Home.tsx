import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, Heart, Users, BookOpen, Quote as QuoteIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-[95vh] min-h-[700px] flex items-center bg-[#0A2540]">
        {/* Animated Background Decor */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-[radial-gradient(circle_at_center,#D4AF37_0%,transparent_70%)] blur-[120px]" 
          />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
                <h2 className="text-[#D4AF37] font-bold text-xs uppercase tracking-[0.5em]">Christ Apostolic Church Youth Fellowship</h2>
              </div>
              
              <h1 className="text-white text-6xl md:text-8xl font-bold leading-[1] mb-10 font-serif">
                A Divine <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#f9e29a]">Anchor</span> for Today's Youth.
              </h1>
              
              <p className="text-white/60 text-xl md:text-2xl mb-14 font-light leading-relaxed max-w-2xl italic">
                Welcome to CACYOF Federal Polytechnic Ede. A spiritual sanctuary where we discover purpose, build character, and excel in our academics.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-8">
                <Link
                  to="/login"
                  className="bg-[#D4AF37] text-[#0A2540] px-10 py-5 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-[#c4a132] transition-all hover:translate-y-[-4px] shadow-2xl shadow-[#D4AF37]/20"
                >
                  Join the Fellowship <ChevronRight className="ml-2" />
                </Link>
                <Link
                  to="/about"
                  className="border border-white/20 text-white px-10 py-5 rounded-xl font-bold text-lg flex items-center justify-center hover:bg-white/5 transition-all backdrop-blur-sm"
                >
                  Learn Our History
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Stat Bar Overlay */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-20">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37]"><Heart size={24} /></div>
              <div>
                <div className="text-white font-bold text-lg leading-tight italic">Spiritual Life</div>
                <div className="text-white/40 text-xs uppercase tracking-widest">Growth First</div>
              </div>
            </div>
            <div className="flex items-center space-x-6 border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0 md:px-8">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37]"><Users size={24} /></div>
              <div>
                <div className="text-white font-bold text-lg leading-tight italic">Youth Community</div>
                <div className="text-white/40 text-xs uppercase tracking-widest">United as One</div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37]"><BookOpen size={24} /></div>
              <div>
                <div className="text-white font-bold text-lg leading-tight italic">Peak Performance</div>
                <div className="text-white/40 text-xs uppercase tracking-widest">Academic Glory</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="aspect-[4/5] bg-gray-100 rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-8 border-white">
                <img src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=800&fit=crop" alt="Spiritual Growth" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D4AF37] rounded-3xl -z-10 rotate-12 opacity-20"></div>
              <div className="absolute -bottom-12 -right-12 w-96 h-96 bg-[#0A2540] rounded-full -z-10 opacity-5 blur-3xl"></div>
            </div>
            
            <div className="space-y-10">
              <div className="inline-block px-4 py-2 bg-[#D4AF37]/10 text-[#0A2540] rounded-full text-xs font-bold uppercase tracking-widest">Our Mandate</div>
              <h2 className="text-5xl md:text-6xl font-bold text-[#0A2540] leading-tight font-serif">Bridging Spirituality and <span className="italic">Excellence.</span></h2>
              <p className="text-gray-500 text-xl leading-relaxed font-light italic">
                At CACYOF FPE, we believe being a youth in Christ is the greatest asset. We provide the spiritual oversight, mentorship, and platform for every member to shine.
              </p>
              
              <div className="space-y-8 pt-6">
                <div className="flex items-start space-x-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#0A2540] group-hover:text-white transition-all text-[#D4AF37] shadow-sm"><Heart size={28} /></div>
                   <div>
                     <h3 className="text-xl font-bold mb-2">Unwavering Faith</h3>
                     <p className="text-gray-400 text-base leading-relaxed">Deep scriptural immersion and prophetic oversight.</p>
                   </div>
                </div>
                <div className="flex items-start space-x-6 group">
                   <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-[#0A2540] group-hover:text-white transition-all text-[#D4AF37] shadow-sm"><Users size={28} /></div>
                   <div>
                     <h3 className="text-xl font-bold mb-2">Campus Leadership</h3>
                     <p className="text-gray-400 text-base leading-relaxed">Raising leaders who influence their environment for God.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scripture Quote */}
      <section className="py-40 bg-[#0A2540] relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 blur-3xl">
          <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[#D4AF37] rounded-full"></div>
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <QuoteIcon className="mx-auto text-[#D4AF37] mb-12 opacity-30" size={60} />
          <h2 className="text-3xl md:text-5xl font-serif italic text-white/90 leading-tight mb-12">
            "Don’t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity."
          </h2>
          <div className="inline-block px-6 py-1 bg-[#D4AF37] text-[#0A2540] font-bold text-sm tracking-[0.2em] uppercase">1 Timothy 4:12</div>
        </div>
      </section>

      {/* Portal CTA */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-[4rem] p-12 md:p-24 shadow-2xl relative overflow-hidden text-center border border-gray-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 animate-pulse rounded-full blur-3xl"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-bold text-[#0A2540] mb-8 font-serif">Step Into the Portal.</h2>
              <p className="text-gray-500 text-xl mb-12 font-light leading-relaxed italic">
                Manage your membership profile, submit quotes, and stay informed with exclusive updates.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center bg-[#0A2540] text-[#D4AF37] px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0A2540]/20"
              >
                Access Portal Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
