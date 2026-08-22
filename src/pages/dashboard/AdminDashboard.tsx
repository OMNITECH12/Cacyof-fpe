import { Routes, Route, Link } from 'react-router-dom';
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
  User,
  Shield,
  Video,
  Tv,
  Sparkles
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, ImageRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import FybFlyerGenerator from './FybFlyerGenerator';

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
            <Route path="/live" element={<LiveManager />} />
            <Route path="/fyb-flyer" element={<FybFlyerGenerator />} />
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
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (JPG, PNG, WebP, etc.).');
        return;
      }

      // Validate file size (e.g. 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds the 5MB limit.');
        return;
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${leaderId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `leaders/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('leaders').update({ image_url: publicUrl }).eq('id', leaderId);
      if (updateError) throw updateError;
      
      fetchLeaders();
      alert('Leader photo uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading leader photo:', error);
      alert(`Upload Failed: ${error.message || 'Make sure your "avatars" bucket is created and set to PUBLIC in the Supabase console.'}`);
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
  const [statusFilter, setStatusFilter] = useState('All');
  const [downloadingFYB, setDownloadingFYB] = useState(false);
  const [downloadingAlumni, setDownloadingAlumni] = useState(false);
  const [copiedSMS, setCopiedSMS] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setMembers(data || []);
    setLoading(false);
  };

  const handleElevateByEmail = async () => {
    if (!adminEmailInput || !adminEmailInput.trim()) {
      alert("Please enter a valid member email first.");
      return;
    }
    const targetEmail = adminEmailInput.trim().toLowerCase();
    
    // Find member by email in loaded list
    const found = members.find(m => m.email?.toLowerCase() === targetEmail);
    if (!found) {
      alert(`No member found registered with the email "${targetEmail}" in this system directory.`);
      return;
    }

    if (found.role === 'admin') {
      alert(`"${found.full_name}" is already an Admin.`);
      return;
    }

    const confirmMessage = `Promote "${found.full_name}" (${targetEmail}) to Admin? They will have full dashboard administrative controls.`;
    if (confirm(confirmMessage)) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', found.id);
        
        if (error) throw error;
        alert(`Successfully promoted ${found.full_name} to Administrator!`);
        setAdminEmailInput('');
        fetchMembers();
      } catch (err: any) {
        console.error("Error promoting member:", err);
        alert(`Failed to promote member: ${err.message}`);
      }
    }
  };

  const toggleAdminRole = async (memberId: string, currentRole: string, fullName: string) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    const confirmMessage = newRole === 'admin' 
      ? `Promote "${fullName}" to Admin? They will receive full system control privileges.` 
      : `Demote "${fullName}" from Admin back to a regular Member?`;
    
    if (confirm(confirmMessage)) {
      try {
         const { error } = await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', memberId);
        
        if (error) throw error;
        alert(`Successfully updated "${fullName}" to ${newRole}!`);
        fetchMembers();
      } catch (err: any) {
        console.error("Error toggling admin status:", err);
        alert(`Failed to toggle role: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Revoke access and destroy records for ${name}?`)) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchMembers();
    }
  };

  const getPhoneNumbersForBulk = () => {
    const targets = statusFilter === 'All' 
      ? members 
      : members.filter(m => m.student_status === statusFilter);
    return targets
      .map(m => m.phone_number)
      .filter(phone => phone && phone.trim() !== '')
      .join(', ');
  };

  const copySMSNumbers = () => {
    const numbers = getPhoneNumbersForBulk();
    if (!numbers) {
      alert("No numbers found for this active category.");
      return;
    }
    navigator.clipboard.writeText(numbers);
    setCopiedSMS(true);
    setTimeout(() => setCopiedSMS(false), 2000);
  };

  const downloadAlumniDoc = async () => {
    const alumniList = members.filter(m => m.student_status === 'Alumni');
    if (alumniList.length === 0) {
      alert("No Alumni members found in the current registry.");
      return;
    }

    setDownloadingAlumni(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "CACYOF FPE — REGISTERED ALUMNI DIRECTORY",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),
            new Paragraph({
              text: `Official Alumni Roster compiled on: ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full Name", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Email", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phone Number", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Contact Address", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Academic Session", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Church Role", bold: true })] })] }),
                  ]
                }),
                ...alumniList.map(m => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: m.full_name || "N/A" })] }),
                    new TableCell({ children: [new Paragraph({ text: m.email || "N/A" })] }),
                    new TableCell({ children: [new Paragraph({ text: m.phone_number || "N/A" })] }),
                    new TableCell({ children: [new Paragraph({ text: m.contact_address || "N/A" })] }),
                    new TableCell({ children: [new Paragraph({ text: m.academic_session || "N/A" })] }),
                    new TableCell({ children: [new Paragraph({ text: m.church_role || "member" })] }),
                  ]
                }))
              ]
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CACYOF_Alumni_Roster_${new Date().getFullYear()}.docx`);
    } catch (e) {
      console.error(e);
      alert("Failed to build Alumni Word Directory.");
    } finally {
      setDownloadingAlumni(false);
    }
  };

  const downloadFYBDoc = async () => {
    const fybList = members.filter(m => m.student_status === 'FYB');
    if (fybList.length === 0) {
      alert("No FYB (Final year brethren) found in the current registry.");
      return;
    }

    setDownloadingFYB(true);
    try {
      const elements: any[] = [
        new Paragraph({
          text: "CACYOF FPE — OFFICIAL FINAL YEAR BRETHREN (FYB) DOSSIER",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 }
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString()} — Total Finalists: ${fybList.length}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 500 }
        })
      ];

      for (const m of fybList) {
        let imageRun: ImageRun | null = null;
        if (m.avatar_url) {
          try {
            const res = await fetch(m.avatar_url);
            if (res.ok) {
              const imgBlob = await res.blob();
              const buffer = await imgBlob.arrayBuffer();
              
              imageRun = new ImageRun({
                data: buffer,
                transformation: {
                  width: 120,
                  height: 120,
                },
                type: 'png'
              });
            }
          } catch (err) {
            console.warn("Could not load image buffer for " + m.full_name, err);
          }
        }

        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${m.full_name?.toUpperCase() || 'NAME NOT SPECIFIED'}`, bold: true, size: 28, color: "0A2540" })
            ],
            spacing: { before: 200, after: 150 }
          })
        );

        if (imageRun) {
          elements.push(
            new Paragraph({
              children: [imageRun],
              spacing: { after: 150 }
            })
          );
        } else {
          elements.push(
            new Paragraph({
              children: [new TextRun({ text: "[No Profile Picture uploaded or image fetch restricted by CORS]", italics: true, color: "888888" })],
              spacing: { after: 150 }
            })
          );
        }

        elements.push(
          new Paragraph({ children: [new TextRun({ text: "Email: ", bold: true }), new TextRun(m.email || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Phone Contact: ", bold: true }), new TextRun(m.phone_number || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Academic Unit (Dept): ", bold: true }), new TextRun(m.department || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Academic Session: ", bold: true }), new TextRun(m.academic_session || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Level: ", bold: true }), new TextRun(m.academic_level || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Church Role: ", bold: true }), new TextRun(`${m.church_role || 'member'}  (${m.church_position || 'No active position'})`)] }),
          new Paragraph({ children: [new TextRun({ text: "Assigned Mentor: ", bold: true }), new TextRun(m.mentor_name || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Career Ambition: ", bold: true }), new TextRun(m.career_path || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Business Venture: ", bold: true }), new TextRun(m.entrepreneurship_path || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Favorite Nourishment: ", bold: true }), new TextRun(m.favorite_food || "N/A")] }),
          new Paragraph({ children: [new TextRun({ text: "Favorite Quote: ", bold: true }), new TextRun({ text: `"${m.favorite_quote || 'N/A'}"`, italics: true })] }),
          new Paragraph({
            text: "═".repeat(60),
            spacing: { before: 250, after: 400 }
          })
        );
      }

      const doc = new Document({
        sections: [{
          properties: {},
          children: elements
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CACYOF_FYB_Finalists_Portfolio_${new Date().getFullYear()}.docx`);
    } catch (error) {
      console.error(error);
      alert("Error building FYB word document portfolio");
    } finally {
      setDownloadingFYB(false);
    }
  };

  const generateWordDoc = async (m: any) => {
    let imageRun: ImageRun | null = null;
    if (m.avatar_url) {
      try {
        const res = await fetch(m.avatar_url);
        if (res.ok) {
          const imgBlob = await res.blob();
          const buffer = await imgBlob.arrayBuffer();
          imageRun = new ImageRun({
            data: buffer,
            transformation: { width: 110, height: 110 },
            type: 'png'
          });
        }
      } catch (e) {
        console.warn("Skip embedding image on failure", e);
      }
    }

    const docElements: any[] = [
      new Paragraph({
         text: "CACYOF FPE — OFFICIAL MEMBER RECORD",
         heading: HeadingLevel.HEADING_1,
         alignment: AlignmentType.CENTER,
         spacing: { after: 300 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "INDIVIDUAL IDENTITY DETAILS", bold: true, size: 28, color: "0A2540" }),
        ],
        spacing: { after: 200 }
      })
    ];

    if (imageRun) {
      docElements.push(new Paragraph({ children: [imageRun], spacing: { after: 200 } }));
    }

    docElements.push(
      new Paragraph({ children: [new TextRun({ text: "Full Name: ", bold: true }), new TextRun(m.full_name || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Email: ", bold: true }), new TextRun(m.email || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Phone Line: ", bold: true }), new TextRun(m.phone_number || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Department: ", bold: true }), new TextRun(m.department || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Academic Session: ", bold: true }), new TextRun(m.academic_session || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Level: ", bold: true }), new TextRun(m.academic_level || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Student Status: ", bold: true }), new TextRun(m.student_status || "N/A")] }),
      
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "CHURCH IDENTITY & ASSIGNMENT", bold: true, size: 28, color: "0A2540" })],
        spacing: { after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: "Church Role: ", bold: true }), new TextRun(m.church_role || "member")] }),
      new Paragraph({ children: [new TextRun({ text: "Church Office: ", bold: true }), new TextRun(m.church_position || "N/A")] }),

      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "VISION & INTERESTS", bold: true, size: 28, color: "0A2540" })],
        spacing: { after: 200 }
      }),
      new Paragraph({ children: [new TextRun({ text: "Career Path: ", bold: true }), new TextRun(m.career_path || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Entrepreneurship: ", bold: true }), new TextRun(m.entrepreneurship_path || "N/A")] }),
      new Paragraph({ children: [new TextRun({ text: "Assigned Mentor: ", bold: true }), new TextRun(m.mentor_name || "N/A")] }),
      
      new Paragraph({ text: "", spacing: { after: 200 } }),
      new Paragraph({
        children: [new TextRun({ text: "PERSONAL INSIGHT", bold: true, size: 28, color: "0A2540" })],
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
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: docElements,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Member_${m.full_name?.replace(/\s/g, '_') || 'Profile'}.docx`);
  };

  const filtered = members.filter(m => {
    const matchesSearch = m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.student_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2">
        {['All', 'Fresher', 'Staylite', 'FYB', 'Alumni'].map((cat) => {
          const count = cat === 'All' 
            ? members.length 
            : members.filter(m => m.student_status === cat).length;
          const isActive = statusFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setStatusFilter(cat)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 border-2 ${
                isActive 
                  ? 'bg-[#0A2540] text-[#D4AF37] border-[#0A2540] shadow-md shadow-[#0A2540]/10' 
                  : 'bg-white border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-gray-100 text-gray-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Download Actions & SMS copiers */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="col-span-1 lg:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A2540]">Dossier & Roster Archives</h4>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Acquire compiled documentation formats offline.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={downloadFYBDoc}
              disabled={downloadingFYB}
              className="flex items-center justify-center space-x-3 bg-[#0A2540] text-[#D4AF37] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-opacity-95 disabled:opacity-50 transition-all shadow-sm"
              title="Download all FYBs with profile photos in high quality Doc"
            >
              {downloadingFYB ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Download FYB Dossier (with Images)</span>
            </button>

            <button
              onClick={downloadAlumniDoc}
              disabled={downloadingAlumni}
              className="flex items-center justify-center space-x-3 bg-[#D4AF37] text-[#0A2540] py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-opacity-95 disabled:opacity-50 transition-all shadow-sm"
              title="Download entire list of alumni in a table"
            >
              {downloadingAlumni ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              <span>Download Alumni Members list</span>
            </button>
          </div>
        </div>

        {/* SMS Extract */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A2540]">Bulk Phone Extract ({statusFilter})</h4>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Directly copy list-format contacts for carrier transmission.</p>
          </div>
          <button
            onClick={copySMSNumbers}
            disabled={!getPhoneNumbersForBulk()}
            className="w-full flex items-center justify-center space-x-2 py-3.5 bg-[#D4AF37]/10 text-[#0A2540] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 rounded-xl font-extrabold text-[11px] uppercase tracking-wider transition-all disabled:opacity-40"
          >
            {copiedSMS ? <Check size={14} className="text-green-600 animate-bounce" /> : <Send size={14} className="text-[#0A2540]" />}
            <span>{copiedSMS ? 'Numbers Copied!' : 'Copy SMS Contacts'}</span>
          </button>
        </div>

        {/* Promote Member to Admin */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A2540]">Promote New Admin</h4>
            <p className="text-[11px] text-gray-400 font-light mt-0.5">Elevate any registered member to Administrator by their email.</p>
          </div>
          <div className="space-y-2">
            <input 
              type="email" 
              placeholder="E.g. member@email.com" 
              value={adminEmailInput} 
              onChange={e => setAdminEmailInput(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all"
            />
            <button
              onClick={handleElevateByEmail}
              className="w-full py-2.5 bg-[#0A2540] text-[#D4AF37] hover:bg-opacity-95 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center space-x-2 shadow-sm"
              title="Grant Admin Rights"
            >
              <Shield size={14} />
              <span>Grant Admin Rights</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#0A2540]/5 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-50">
              <tr>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Divine Identity</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Academic Unit & Church</th>
                <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={3} className="px-10 py-20 text-center"><Loader2 className="animate-spin inline text-[#D4AF37]" size={32} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="px-10 py-20 text-center text-gray-300 font-light italic">No registered members found under this selection.</td></tr>
              ) : filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center space-x-4">
                      {m.avatar_url ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                          <img src={m.avatar_url} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#0A2540]/5 flex items-center justify-center text-[#0A2540] font-bold text-lg italic shrink-0">
                          {m.full_name?.[0] || 'M'}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-[#0A2540] text-lg">{m.full_name}</div>
                        <div className="text-xs text-gray-400 font-light italic">{m.email} — {m.phone_number || 'No contact phone'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-sm font-bold text-[#0A2540]">{m.department || 'N/A'} {m.academic_session && `(${m.academic_session})`}</div>
                    <div className="flex flex-wrap gap-2 items-center mt-1">
                      <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-widest">{m.academic_level || 'N/A'}</span>
                      {m.student_status && (
                        <span className="px-2 py-0.5 text-[9px] bg-[#0A2540]/5 text-[#0A2540] rounded font-bold uppercase tracking-wider border border-[#0A2540]/10">
                          {m.student_status}
                        </span>
                      )}
                      {m.church_role && m.church_role !== 'member' && (
                        <span className="px-2 py-0.5 text-[9px] bg-amber-50 text-amber-600 rounded font-bold uppercase tracking-wider border border-amber-200">
                          {m.church_role} {m.church_position && `— ${m.church_position}`}
                        </span>
                      )}
                      {m.role === 'admin' ? (
                        <span className="px-2 py-0.5 text-[9px] bg-purple-50 text-purple-700 rounded font-bold uppercase tracking-wider border border-purple-200 flex items-center gap-1">
                          <Shield size={10} className="text-purple-600" /> Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[9px] bg-slate-50 text-slate-500 rounded font-bold uppercase tracking-wider border border-slate-100">
                          Member
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={() => toggleAdminRole(m.id, m.role, m.full_name)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all shadow-sm ${
                          m.role === 'admin' 
                            ? 'text-purple-600 bg-purple-50 hover:bg-[#0A2540] hover:text-[#D4AF37]' 
                            : 'text-gray-400 bg-gray-50 hover:bg-purple-600 hover:text-white'
                        }`}
                        title={m.role === 'admin' ? "Demote to Member" : "Promote to Admin"}
                      >
                        <Shield size={18} />
                      </button>
                      <Link 
                        to="/dashboard/admin/fyb-flyer"
                        className="w-10 h-10 flex items-center justify-center text-orange-500 bg-orange-50 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm"
                        title="Generate FYB Flyer"
                      >
                        <Sparkles size={18} />
                      </Link>
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
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('notifications').insert([{ title, body, category }]);
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
        <p className="text-gray-400 font-light">Broadcast words instantly to target member categories in the fellowship.</p>
      </div>

      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-[#0A2540]/10 border border-gray-100 italic">
        <form onSubmit={handleSend} className="space-y-10">
          <div>
            <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-[0.3em] mb-4 text-center">Target Audience Category</label>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto mb-4">
              {['General', 'Fresher', 'Staylite', 'FYB', 'Alumni'].map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat} type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#0A2540] text-[#D4AF37] border-[#0A2540] shadow-md shadow-[#0A2540]/10' 
                        : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 bg-green-50 text-green-700 rounded-2xl text-center font-bold flex items-center justify-center font-sans not-italic text-sm">
              <Check className="mr-2 text-green-600" /> Broadcast Successfully Dispatched!
            </motion.div>
          )}

          <button 
            disabled={loading}
            className="w-full py-6 bg-[#0A2540] text-[#D4AF37] rounded-3xl font-bold text-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-[#0A2540]/30 font-sans not-italic"
          >
            {loading ? <Loader2 className="animate-spin inline" /> : `Execute Broadcast to ${category}`}
          </button>
        </form>
      </div>
    </div>
  );
}

function QuoteReviewer() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  const downloadQuotesDoc = async () => {
    if (quotes.length === 0) {
      alert("No quotes found to download.");
      return;
    }

    setDownloading(true);
    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "CACYOF FPE — FELLOWSHIP INSIGHTS & QUOTES DOSSIER",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),
            new Paragraph({
              text: `Official Quotes Registry compiled on: ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Submitted By", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Insight Quote Statement", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
                    new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Date Submitted", bold: true })] })] }),
                  ]
                }),
                ...quotes.map(q => new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph({ text: q.author_name || "Anonymous" })] }),
                    new TableCell({ children: [new Paragraph({ text: `"${q.text}"` })] }),
                    new TableCell({ children: [new Paragraph({ text: q.status || "pending" })] }),
                    new TableCell({ children: [new Paragraph({ text: new Date(q.created_at).toLocaleDateString() })] }),
                  ]
                }))
              ]
            })
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CACYOF_Quotes_Registry_${new Date().getFullYear()}.docx`);
    } catch (e) {
      console.error(e);
      alert("Failed to build Quotes Word Dossier.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Quote Moderator</h1>
          <p className="text-gray-400 font-light italic text-sm">Review the insights shared by our youth before public exposure.</p>
        </div>
        <button
          onClick={downloadQuotesDoc}
          disabled={downloading}
          className="flex items-center space-x-2 bg-[#0A2540] text-[#D4AF37] px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-opacity-95 transition-all shadow-md shrink-0 disabled:opacity-50"
          title="Download all members' quotes in Doc format"
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          <span>Download Quotes Dossier</span>
        </button>
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

function LiveManager() {
  const [record, setRecord] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [platform, setPlatform] = useState('youtube');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLiveState();
  }, []);

  const fetchLiveState = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('live_broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setRecord(data[0]);
        setIsLive(data[0].is_live);
        setTitle(data[0].title || '');
        setEmbedUrl(data[0].embed_url || '');
        setPlatform(data[0].platform || 'youtube');
      } else {
        // If empty, let's insert a default row!
        const defaultRow = {
          is_live: false,
          title: 'CACYOF FPE Sunday Live Service',
          embed_url: '',
          platform: 'youtube'
        };
        const { data: inserted } = await supabase
          .from('live_broadcasts')
          .insert([defaultRow])
          .select();

        if (inserted && inserted.length > 0) {
          setRecord(inserted[0]);
        }
      }
    } catch (err) {
      console.error("Error loading live state:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Extract or normalize link (if they enter youtube.com/watch?v=... or share link, extract embed code if possible)
      let finalEmbed = embedUrl;
      let finalPlatform = platform;

      if (embedUrl.includes('youtube.com/watch?v=')) {
        const id = embedUrl.split('v=')[1]?.split('&')[0];
        if (id) {
          finalEmbed = `https://www.youtube.com/embed/${id}`;
          finalPlatform = 'youtube';
        }
      } else if (embedUrl.includes('youtu.be/')) {
        const id = embedUrl.split('youtu.be/')[1]?.split('?')[0];
        if (id) {
          finalEmbed = `https://www.youtube.com/embed/${id}`;
          finalPlatform = 'youtube';
        }
      } else if (embedUrl.includes('facebook.com/')) {
        finalPlatform = 'facebook';
      }

      const updateData = {
        is_live: isLive,
        title: title || 'CACYOF FPE Live Service',
        embed_url: finalEmbed,
        platform: finalPlatform,
        updated_at: new Date().toISOString()
      };

      let res;
      if (record?.id) {
        res = await supabase
          .from('live_broadcasts')
          .update(updateData)
          .eq('id', record.id);
      } else {
        res = await supabase
          .from('live_broadcasts')
          .insert([updateData]);
      }

      if (res.error) {
        alert("Error saving settings: " + res.error.message);
      } else {
        alert("Live broadcast settings updated successfully!");
        
        // Let's also trigger a physical Notification in the notifications table if the switch was toggled ON!
        if (isLive && (!record || !record.is_live)) {
          await supabase.from('notifications').insert([{
            title: '🔴 WE ARE LIVE!',
            body: `CACYOF FPE is now broadcasting live: "${title || 'CACYOF FPE Live Service'}". Click the Live link on the home page or navbar to join us!`,
            category: 'General'
          }]);
        }
        
        fetchLiveState();
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-40 text-center">
        <Loader2 className="animate-spin inline text-[#D4AF37]" size={40} />
        <p className="text-gray-400 font-light mt-4">Syncing live dashboard state...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-[#0A2540] tracking-tight font-serif">Live Stream Control</h2>
          <p className="text-gray-400 font-light mt-1">Activate, switch, and embed the fellowship livestream link for all members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form controls */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <h3 className="text-xl font-bold text-[#0A2540] border-b border-gray-100 pb-4">Stream Settings</h3>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Livestream Status</label>
              <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsLive(!isLive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isLive ? 'bg-red-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isLive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <div>
                  <span className="text-sm font-bold text-[#0A2540] block">
                    {isLive ? '🔴 Active / Live now' : '⚪ Offline / Stream Inactive'}
                  </span>
                  <span className="text-xs text-gray-400 font-light">
                    {isLive 
                      ? 'Stream will show in real-time with alert flags on the Home and Live pages.' 
                      : 'Stream player is disabled; generic upcoming notice will display instead.'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Service or Broadcast Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sunday Breakthrough Service"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm text-[#0A2540]"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Live Video Stream Link</label>
              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...) or Facebook embed link"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] text-sm text-[#0A2540]"
                required
              />
              <p className="text-[11px] text-gray-400 font-light mt-1.5 leading-relaxed">
                Paste any standard YouTube watch link, share link, or iframe source URL. The portal automatically formats it into a secure responsive embed players.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#0A2540] uppercase tracking-widest mb-2 pl-1">Platform Type</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4AF37] text-sm text-[#0A2540] bg-white"
                >
                  <option value="youtube">YouTube Live</option>
                  <option value="facebook">Facebook Live</option>
                  <option value="other">Other Embed Code</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center space-x-2 bg-[#0A2540] text-[#D4AF37] px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-opacity-95 transition-all disabled:opacity-50 shadow-md"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Tv size={16} />}
              <span>Save & Publish Live Status</span>
            </button>
          </form>
        </div>

        {/* Right Help / Preview Box */}
        <div className="bg-[#0A2540] text-white p-10 rounded-[2.5rem] shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#D4AF37]">
              <Video size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold font-serif mb-2">Live stream guidelines</h4>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                When you toggle the stream <strong className="text-[#D4AF37]">ON</strong>:
              </p>
            </div>
            <ul className="space-y-3 text-xs text-white/60 font-light list-disc pl-4 leading-relaxed">
              <li>A beautiful red glowing <strong className="text-red-400">🔴 LIVE</strong> badge and direct streaming box appears instantly on the website home page.</li>
              <li>A custom live stream navigation button is visible to all visitors.</li>
              <li>An automated notification post is broadcasts to the "Board Notices" board informing members of the active livestream!</li>
              <li>The system automatically converts standard YouTube link variants into responsive iframe embeds.</li>
            </ul>
          </div>
          
          <div className="border-t border-white/10 pt-6 mt-8">
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block mb-1">Active broadcast info</span>
            <p className="text-xs text-white/40 italic font-mono">
              Status: {isLive ? '🔴 LIVE' : '⚪ OFFLINE'}<br/>
              Title: {title || 'None'}<br/>
              Platform: {platform.toUpperCase()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
