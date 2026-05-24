import { useState } from 'react';
import { Phone, MapPin, Send, Cross } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="bg-white">
      {/* Sacred Header */}
      <section className="bg-[#0A2540] py-32 text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#D4AF37_0%,transparent_70%)] blur-3xl shadow-inner"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-serif italic">Divine Channels</h1>
            <p className="text-2xl text-white/50 font-light italic leading-relaxed max-w-2xl mx-auto">
              Our doors and lines are open for your prayer requests, inquiries, and counseling needs.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          {/* Channel Cards */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex flex-col space-y-6">
              <h2 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-4">The Gateway</h2>
              
              <div className="bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-gray-50 group hover:bg-[#0A2540] transition-all duration-500 hover:translate-x-2">
                <MapPin className="text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">Fellowship Ground</h3>
                <p className="text-gray-400 group-hover:text-white/60 transition-colors leading-relaxed font-light italic">Federal Polytechnic Ede, North Campus, Osun State.</p>
              </div>

              <div className="bg-[#F8FAFC] p-10 rounded-[2.5rem] border border-gray-50 group hover:bg-[#0A2540] transition-all duration-500 hover:translate-x-2">
                <Phone className="text-[#D4AF37] mb-6 group-hover:scale-110 transition-transform" size={32} />
                <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">Executive Hotline</h3>
                <p className="text-gray-400 group-hover:text-white/60 transition-colors leading-relaxed font-light italic">+2348132202310</p>
              </div>

              <div className="bg-[#D4AF37]/10 p-10 rounded-[2.5rem] border border-[#D4AF37]/20 group">
                <Cross className="text-[#D4AF37] mb-6" size={32} />
                <h3 className="text-xl font-bold mb-2 text-[#0A2540]">Prayer Altar?</h3>
                <p className="text-gray-500 text-sm italic mb-6 leading-relaxed">Submit your burdens to our prayer team. We stand in faith with you.</p>
                <button className="bg-[#0A2540] text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">Submit Request</button>
              </div>
            </div>
          </div>

          {/* Contact Dispatch */}
          <div className="lg:col-span-8">
            <div className="bg-white p-12 md:p-20 rounded-[3rem] shadow-2xl shadow-[#0A2540]/5 border border-gray-100 italic">
              <h2 className="text-4xl font-bold text-[#0A2540] mb-12 font-serif text-center">Dispatch a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 text-center">Full Identity</label>
                    <input required className="w-full bg-[#F8FAFC] p-5 rounded-2xl border-0 outline-none focus:ring-2 focus:ring-[#D4AF37] text-center transition-all font-bold" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 text-center">Contact Hub (Email)</label>
                    <input required type="email" className="w-full bg-[#F8FAFC] p-5 rounded-2xl border-0 outline-none focus:ring-2 focus:ring-[#D4AF37] text-center transition-all font-bold" placeholder="you@hub.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 text-center">Subject Script</label>
                  <input required className="w-full bg-[#F8FAFC] p-5 rounded-2xl border-0 outline-none focus:ring-2 focus:ring-[#D4AF37] text-center transition-all font-bold" placeholder="E.g. Academic Support" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-4 text-center">The Word (Message)</label>
                  <textarea required rows={5} className="w-full bg-[#F8FAFC] p-8 rounded-[2rem] border-0 outline-none focus:ring-2 focus:ring-[#D4AF37] text-center transition-all font-light leading-relaxed text-lg" placeholder="Start typing the message..."></textarea>
                </div>

                {submitted && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-green-50 text-green-700 rounded-3xl text-center font-bold shadow-sm">
                    Message Dispatched Successfully! We shall reach out shortly.
                  </motion.div>
                )}

                <button className="w-full py-6 bg-[#0A2540] text-white rounded-3xl font-bold text-xl hover:scale-[1.01] active:translate-y-1 transition-all shadow-2xl shadow-[#0A2540]/20 flex items-center justify-center space-x-4">
                  <span>Send Dispatch</span>
                  <Send size={24} className="text-[#D4AF37]" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Map Placeholder */}
      <section className="h-[500px] bg-gray-50 relative overflow-hidden group">
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-700">
           <MapPin size={60} className="text-[#D4AF37] mb-6 animate-bounce" />
           <p className="text-gray-400 font-serif italic text-2xl">North Campus Integration</p>
           <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-gray-300 mt-4">Federal Polytechnic Ede Ground</p>
        </div>
        <div className="absolute inset-0 bg-white opacity-40 mix-blend-overlay"></div>
      </section>
    </div>
  );
}
