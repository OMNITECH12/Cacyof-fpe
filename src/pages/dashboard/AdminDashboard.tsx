import { Routes, Route } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { 
  Search, 
  Download, 
  Trash2, 
  Loader2, 
  Plus, 
  Send,
  Check,
  Archive,
  FileText,
  LayoutDashboard,
  User
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-80px)] relative">
      <Sidebar 
        role="admin" 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="flex-grow p-4 md:p-10 overflow-y-auto w-full">
        <div className="lg:hidden mb-6">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-[#0A2540]"
          >
            <LayoutDashboard size={24} />
          </button>
        </div>
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<MemberDirectory />} />
            <Route path="/blog" element={<BlogManager />} />
            <Route path="/broadcast" element={<NotificationBroadcaster />} />
            <Route path="/quotes" element={<QuoteReviewer />} />
            <Route path="/leaders" element={<LeaderManager />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function LeaderManager() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchLeaders(); }, []);
  const fetchLeaders = async () => {
    const { data } = await supabase.from('leaders').select('*').order('display_order');
    setLeaders(data || []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('leaders').insert([{ name, role, display_order: leaders.length }]);
    setName(''); setRole(''); setIsAdding(false);
    fetchLeaders();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this leader from the council?")) {
      await supabase.from('leaders').delete().eq('id', id);
      fetchLeaders();
    }
  };

  const onFileUpload = async (e: any, leaderId: string) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${leaderId}-${Math.random()}.${fileExt}`;
      const filePath = `leaders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await supabase.from('leaders').update({ image_url: publicUrl }).eq('id', leaderId);
      fetchLeaders();
    } catch (error) {
      alert('Error uploading leader photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Council Management</h1>
          <p className="text-gray-400 font-light italic">Establish the 3 main leaders of the fellowship.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-3 bg-[#D4AF37] text-[#0A2540] px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/20"
        >
          {isAdding ? 'Cancel' : <><Plus size={20} /><span>Seat New Leader</span></>}
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleAdd} className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Office / Role</label>
                <input required value={role} onChange={e => setRole(e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none font-bold" placeholder="E.g. President" />
              </div>
            </div>
            <button className="w-full py-5 bg-[#0A2540] text-[#D4AF37] rounded-2xl font-bold text-xl transition-all">Add to Council</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin inline" /></div>
        ) : (
          leaders.map((leader) => (
            <div key={leader.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm group hover:shadow-xl transition-all text-center">
               <div className="relative mx-auto w-32 h-32 mb-6 group">
                  <div className="w-full h-full rounded-full bg-gray-50 overflow-hidden border-4 border-[#D4AF37]/10 group-hover:border-[#D4AF37] transition-colors">
                    {leader.image_url ? (
                      <img src={leader.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#D4AF37]/30"><User size={60} /></div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#0A2540] text-[#D4AF37] rounded-xl flex items-center justify-center cursor-pointer shadow-lg border-2 border-white hover:scale-110 transition-transform">
                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={20} />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => onFileUpload(e, leader.id)} />
                  </label>
               </div>
               <h3 className="text-xl font-bold text-[#0A2540] font-serif italic">{leader.name}</h3>
               <p className="text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest mt-1 mb-8">{leader.role}</p>
               <button onClick={() => handleDelete(leader.id)} className="text-red-300 hover:text-red-500 transition-colors">
                 <Trash2 size={20} />
               </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function MemberDirectory() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setMembers(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Revoke access and destroy records for ${name}?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchMembers();
    }
  };

  const generateWordDoc = async (m: any) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
             text: "CACYOF FPE — OFFICIAL MEMBER RECORD",
             heading: HeadingLevel.HEADING_1,
             alignment: AlignmentType.CENTER,
             spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "INDIVIDUAL IDENTITY", bold: true, size: 28 }),
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "Full Name: ", bold: true }), new TextRun(m.full_name || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Email: ", bold: true }), new TextRun(m.email || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Phone: ", bold: true }), new TextRun(m.phone_number || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Department: ", bold: true }), new TextRun(m.department || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Level: ", bold: true }), new TextRun(m.academic_level || "N/A")] }),
          
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "VISION & INTERESTS", bold: true, size: 28 })],
            spacing: { after: 200 }
          }),
          new Paragraph({ children: [new TextRun({ text: "Career Path: ", bold: true }), new TextRun(m.career_path || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Entrepreneurship: ", bold: true }), new TextRun(m.entrepreneurship_path || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Assigned Mentor: ", bold: true }), new TextRun(m.mentor_name || "N/A")] }),
          
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [new TextRun({ text: "PERSONAL INSIGHT", bold: true, size: 28 })],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Favorite Food: ", bold: true }), new TextRun(m.favorite_food || "N/A"),
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Favorite Quote: ", bold: true }), 
              new TextRun({ text: `"${m.favorite_quote || 'N/A'}"`, italics: true }),
            ]
          }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Member_${m.full_name.replace(/\s/g, '_')}.docx`);
  };

  const filtered = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Member Directory</h1>
          <p className="text-gray-400 font-light">Centralized management of the fellowship archives.</p>
        </div>
        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
          <input 
            type="text" placeholder="Search archives..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-[#D4AF37] transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#0A2540]/5 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Divine Identity</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Academic Unit</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={3} className="px-10 py-20 text-center"><Loader2 className="animate-spin inline text-[#D4AF37]" size={32} /></td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-[#0A2540]/5 flex items-center justify-center text-[#0A2540] font-bold text-lg italic">
                        {m.full_name?.[0] || 'M'}
                      </div>
                      <div>
                        <div className="font-bold text-[#0A2540] text-lg">{m.full_name}</div>
                        <div className="text-xs text-gray-400 font-light italic">{m.email} — {m.phone_number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-sm font-bold text-[#0A2540]">{m.department || 'N/A'}</div>
                    <div className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">{m.academic_level || 'N/A'}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={() => generateWordDoc(m)}
                        className="w-10 h-10 flex items-center justify-center text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        title="Download Profile (Word)"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(m.id, m.full_name)}
                        className="w-10 h-10 flex items-center justify-center text-red-400 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Delete Member"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function BlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cat, setCat] = useState('');

  useEffect(() => { fetchPosts(); }, []);
  const fetchPosts = async () => {
    const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('posts').insert([{ title, content, category: cat, author_id: user?.id, status: 'published' }]);
    setTitle(''); setContent(''); setCat(''); setIsWriting(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Evict this article from the library?")) {
      await supabase.from('posts').delete().eq('id', id);
      fetchPosts();
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Blog Studio</h1>
          <p className="text-gray-400 font-light">Curate spiritual content for the public domain.</p>
        </div>
        <button 
          onClick={() => setIsWriting(!isWriting)}
          className="flex items-center space-x-3 bg-[#D4AF37] text-[#0A2540] px-8 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/20"
        >
          {isWriting ? 'Cancel Studio' : <><Plus size={20} /><span>Write Script</span></>}
        </button>
      </div>

      {isWriting && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handlePublish} className="bg-white p-12 rounded-[3rem] shadow-2xl shadow-[#0A2540]/5 border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Script Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none text-xl font-bold" placeholder="E.g. The Power of Fasting" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Domain Category</label>
                <select value={cat} onChange={e => setCat(e.target.value)} className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none">
                  <option value="">Select Domain</option>
                  <option value="Spiritual">Spiritual</option>
                  <option value="Academic">Academic</option>
                  <option value="News">News</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">The Word (Content)</label>
              <textarea required rows={10} value={content} onChange={e => setContent(e.target.value)} className="w-full p-6 bg-gray-50 border-0 rounded-[2rem] outline-none font-light leading-relaxed" placeholder="Start typing the message..." />
            </div>
            <button className="w-full py-5 bg-[#0A2540] text-[#D4AF37] rounded-2xl font-bold text-xl shadow-xl transition-all">Publish Globally</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-8 rounded-[2rem] border border-gray-50 flex items-center justify-between group shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-[#D4AF37]/5 rounded-2xl flex items-center justify-center text-[#D4AF37]"><FileText size={28} /></div>
              <div>
                <h3 className="font-bold text-xl text-[#0A2540] font-serif italic">{post.title}</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest px-2 py-0.5 bg-[#D4AF37]/10 rounded">{post.category}</span>
                  <span className="text-[10px] text-gray-300 uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(post.id)} className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
              <Trash2 size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationBroadcaster() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('notifications').insert([{ title, body }]);
    if (!error) {
      setSent(true); setTitle(''); setBody('');
      setTimeout(() => setSent(false), 5000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-12">
        <div className="w-24 h-24 bg-[#D4AF37]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner shadow-[#D4AF37]/20">
          <Send className="text-[#D4AF37]" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-3">Announcement Desk</h1>
        <p className="text-gray-400 font-light">Broadcast words instantly to every member's dashboard.</p>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-[#0A2540]/10 border border-gray-100 italic">
        <form onSubmit={handleSend} className="space-y-10">
          <div>
            <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-[0.3em] mb-4 text-center">Subject Header</label>
            <input 
              required value={title} onChange={e => setTitle(e.target.value)} 
              className="w-full p-6 bg-gray-50 border-0 rounded-2xl outline-none font-bold text-center text-xl text-[#0A2540] focus:ring-2 focus:ring-[#D4AF37]"
              placeholder="Immediate Notice..."
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-[0.3em] mb-4 text-center">Divine Message (Body)</label>
            <textarea 
              required rows={6} value={body} onChange={e => setBody(e.target.value)} 
              className="w-full p-8 bg-gray-50 border-0 rounded-[2.5rem] outline-none text-center font-light leading-relaxed text-lg"
              placeholder="Start drafting..."
            />
          </div>

          {sent && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-green-50 text-green-700 rounded-2xl text-center font-bold flex items-center justify-center">
              <Check className="mr-2" /> Broadcast Successfully Dispatched!
            </motion.div>
          )}

          <button 
            disabled={loading}
            className="w-full py-6 bg-[#0A2540] text-[#D4AF37] rounded-3xl font-bold text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#0A2540]/30"
          >
            {loading ? <Loader2 className="animate-spin inline" /> : 'Execute Broadcast Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

function QuoteReviewer() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchQuotes(); }, []);
  const fetchQuotes = async () => {
    const { data } = await supabase.from('quotes').select('*').order('created_at', { ascending: false });
    setQuotes(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('quotes').update({ status }).eq('id', id);
    fetchQuotes();
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Quote Moderator</h1>
        <p className="text-gray-400 font-light italic">Review the insights shared by our youth before public exposure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-full py-40 text-center"><Loader2 className="animate-spin inline" /></div>
        ) : quotes.map((q) => (
          <div key={q.id} className={`bg-white p-10 rounded-[2.5rem] shadow-sm border-l-8 flex flex-col justify-between hover:shadow-xl transition-all ${
            q.status === 'pending' ? 'border-[#D4AF37]' : 'border-gray-50'
          }`}>
             <div>
                <div className="flex justify-between items-center mb-6">
                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    q.status === 'pending' ? 'bg-[#D4AF37] text-[#0A2540]' : 'bg-gray-50 text-gray-300'
                  }`}>{q.status}</span>
                  <span className="text-[10px] text-gray-300 font-bold uppercase">{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-2xl font-serif italic text-[#0A2540] leading-relaxed mb-8">"{q.text}"</p>
             </div>
             <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1 leading-none">Shared By</span>
                  <span className="text-sm font-bold text-[#0A2540]">{q.author_name}</span>
                </div>
                <div className="flex space-x-2">
                   {q.status === 'pending' && (
                     <button onClick={() => updateStatus(q.id, 'read')} className="w-10 h-10 flex items-center justify-center text-green-500 bg-green-50 rounded-xl hover:bg-green-500 hover:text-white transition-all shadow-sm">
                       <Check size={20} />
                     </button>
                   )}
                   <button onClick={() => updateStatus(q.id, 'archived')} className="w-10 h-10 flex items-center justify-center text-gray-300 bg-gray-50 rounded-xl hover:bg-[#0A2540] hover:text-white transition-all shadow-sm">
                     <Archive size={20} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
