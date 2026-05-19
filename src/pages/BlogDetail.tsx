import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, User, ArrowLeft, Loader2, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import Markdown from 'react-markdown';

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();
    setPost(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white space-y-6">
      <h2 className="text-4xl font-serif italic text-[#0A2540]">Word Not Found</h2>
      <Link to="/blog" className="text-[#D4AF37] font-bold hover:underline flex items-center">
        <ArrowLeft size={18} className="mr-2" /> Back to Feed
      </Link>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Header */}
      <section className="bg-[#0A2540] py-40 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,#D4AF37_0%,transparent_70%)] blur-3xl"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <Link to="/blog" className="inline-flex items-center text-[#D4AF37] mb-12 hover:translate-x-[-4px] transition-transform font-bold text-sm uppercase tracking-widest">
            <ArrowLeft size={16} className="mr-2" /> Return to Archives
          </Link>
          <div className="flex items-center space-x-4 mb-8">
            <span className="bg-[#D4AF37] text-[#0A2540] px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
              {post.category}
            </span>
            <div className="h-[1px] w-12 bg-white/20"></div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-serif italic leading-tight mb-8">
            {post.title}
          </h1>
          <div className="flex items-center space-x-8 text-white/50 text-xs font-bold uppercase tracking-widest">
            <span className="flex items-center"><Calendar size={14} className="mr-3 text-[#D4AF37]" /> {new Date(post.created_at).toLocaleDateString()}</span>
            <span className="flex items-center"><User size={14} className="mr-3 text-[#D4AF37]" /> Admin Publisher</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 -mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 md:p-24 rounded-[3.5rem] shadow-2xl shadow-[#0A2540]/5 border border-gray-50 relative"
        >
          <div className="absolute top-12 right-12">
            <button className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-[#0A2540] hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm">
              <Share2 size={20} />
            </button>
          </div>

          <div className="markdown-body prose prose-lg max-w-none text-gray-500 font-light leading-relaxed italic">
            <Markdown>{post.content}</Markdown>
          </div>

          <div className="mt-20 pt-12 border-t border-gray-50 flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="w-14 h-14 rounded-full bg-[#0A2540] flex items-center justify-center text-[#D4AF37] font-bold text-xl">C</div>
               <div>
                 <p className="text-[#0A2540] font-bold">CACYOF Editorial</p>
                 <p className="text-xs text-gray-400">Spiritually Authored Content</p>
               </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
