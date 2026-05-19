import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, Calendar, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from('posts').select('*').eq('status', 'published').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  };

  const categories = ['All', 'Spiritual', 'Academic', 'News'];
  const filtered = posts.filter(p => {
    const s = searchTerm.toLowerCase();
    const matchSearch = p.title.toLowerCase().includes(s) || p.content.toLowerCase().includes(s);
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <section className="bg-[#0A2540] py-40 text-white relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 blur-[100px] pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-8 font-serif italic">Divine Feed</h1>
          <p className="text-2xl text-white/50 font-light max-w-2xl mx-auto italic leading-relaxed">
            Nourishing your spirit and keeping you informed with the word and current fellowship updates.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-10 bg-white border-b border-gray-100 sticky top-20 z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
             {categories.map(c => (
               <button 
                 key={c} onClick={() => setActiveCategory(c)}
                 className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                   activeCategory === c ? 'bg-[#0A2540] text-[#D4AF37] shadow-xl shadow-[#0A2540]/20' : 'text-gray-400 hover:bg-gray-50'
                 }`}
               >
                 {c}
               </button>
             ))}
           </div>
           <div className="relative group w-full md:w-96">
             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D4AF37] transition-all" size={20} />
             <input 
               type="text" placeholder="Explore articles..."
               value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all italic text-lg"
             />
           </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[1,2,3].map(i => <div key={i} className="animate-pulse bg-white p-12 h-[500px] rounded-[3rem]"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {filtered.map((post) => (
                <motion.article 
                  key={post.id} 
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 flex flex-col group h-full"
                >
                  <div className="aspect-[1.5/1] bg-gray-50 overflow-hidden relative border-b border-gray-50">
                    <div className="w-full h-full flex items-center justify-center font-serif text-8xl text-[#0A2540]/5 group-hover:scale-110 transition-transform duration-700">
                      CACYOF
                    </div>
                    <div className="absolute top-8 left-8">
                       <span className="bg-white/80 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#0A2540] shadow-sm">
                         {post.category}
                       </span>
                    </div>
                  </div>
                  <div className="p-12 flex flex-col flex-grow">
                    <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">
                      <span className="flex items-center"><Calendar size={12} className="mr-2 text-[#D4AF37]" /> {new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="flex items-center"><User size={12} className="mr-2 text-[#D4AF37]" /> Admin</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#0A2540] mb-6 font-serif italic leading-tight group-hover:text-[#D4AF37] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-400 font-light italic line-clamp-3 mb-10 leading-relaxed text-sm">
                      {post.content}
                    </p>
                    <Link to={`/blog/${post.id}`} className="mt-auto flex items-center text-[#0A2540] font-bold text-xs uppercase tracking-widest group-hover:text-[#D4AF37] transition-colors border-b-2 border-gray-50 inline-block pb-1 w-fit group-hover:border-[#D4AF37]">
                      Explore Article <ArrowRight size={14} className="ml-3 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
