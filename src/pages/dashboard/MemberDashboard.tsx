import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Camera, 
  Save, 
  Loader2, 
  Bell, 
  Quote as QuoteIcon,
  CheckCircle2,
  Calendar,
  Phone,
  LayoutDashboard,
  MapPin,
  BookOpen,
  ArrowRight,
  Eye,
  FileText,
  Sparkles,
  Printer,
  X,
  Award
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Utility to clean official titles
const formatCleanFullName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/\b(bro|brother|sis|sister|pst|pastor|evang|evangelist|prophet|prophetess|deacon|deaconess|dr|mr|mrs|miss)\b\.?\s*/gi, '')
    .trim()
    .toUpperCase();
};

export default function MemberDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState<any>(null);

  useEffect(() => {
    const checkNewAnnouncements = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let userStatus = 'General';
        if (user) {
          const { data: p } = await supabase
            .from('profiles')
            .select('student_status')
            .eq('id', user.id)
            .single();
          if (p?.student_status) {
            userStatus = p.student_status;
          }
        }

        const { data } = await supabase
          .from('notifications')
          .select('*')
          .or(`category.eq.General,category.eq.${userStatus}`)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const latest = data[0];
          const lastViewedId = localStorage.getItem('last_viewed_notification_id');
          if (lastViewedId !== latest.id) {
            setNewAnnouncement(latest);
          }
        }
      } catch (err) {
        console.error('Error checking announcements:', err);
      }
    };

    checkNewAnnouncements();
  }, []);

  return (
    <div className="flex bg-[#F8FAFC] min-h-[calc(100vh-80px)] relative">
      <Sidebar 
        role="member" 
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
          {newAnnouncement && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-5 bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 text-[#0A2540] rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-sm"
            >
              <div className="flex items-center space-x-3 text-sm font-medium mb-3 md:mb-0">
                <span className="text-xl">📢</span>
                <div>
                  <span className="font-bold">New Information from Admin:</span>{' '}
                  <span className="italic font-light">"{newAnnouncement.title}"</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to="/dashboard/member/notifications"
                  onClick={() => {
                    localStorage.setItem('last_viewed_notification_id', newAnnouncement.id);
                    setNewAnnouncement(null);
                  }}
                  className="px-4 py-2 bg-[#0A2540] text-white hover:bg-[#D4AF37] hover:text-[#0A2540] rounded-xl text-xs font-bold uppercase transition-all shadow-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => {
                    localStorage.setItem('last_viewed_notification_id', newAnnouncement.id);
                    setNewAnnouncement(null);
                  }}
                  className="text-[#0A2540] hover:text-red-500 font-bold text-xs uppercase cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}

          <Routes>
            <Route path="/" element={<ProfileManagement />} />
            <Route path="/quotes" element={<QuoteSubmission />} />
            <Route path="/notifications" element={<NotificationInbox />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function ProfileManagement() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [recentNotifs, setRecentNotifs] = useState<any[]>([]);
  const [fetchingActivity, setFetchingActivity] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  const QUESTIONNAIRE_FIELDS = [
    { num: 1, key: 'full_name', label: 'Full Name' },
    { num: 2, key: 'department', label: 'Department' },
    { num: 3, key: 'academic_level', label: 'Level' },
    { num: 4, key: 'unit_in_fellowship', label: 'Unit in Fellowship' },
    { num: 5, key: 'dob', label: 'DOB' },
    { num: 6, key: 'nickname', label: 'Nickname' },
    { num: 7, key: 'state_of_origin', label: 'State of Origin' },
    { num: 8, key: 'home_address', label: 'Home Address' },
    { num: 9, key: 'phone_number', label: 'Phone No(s)' },
    { num: 10, key: 'email', label: 'Email' },
    { num: 11, key: 'facebook_name', label: 'Facebook Name' },
    { num: 12, key: 'view_and_desire_about_cacyof', label: 'View and Desire About CACYOF' },
    { num: 13, key: 'mentor_name', label: 'Your Mentor' },
    { num: 14, key: 'entrepreneurship_path', label: 'Entrepreneur Path' },
    { num: 15, key: 'career_path', label: 'Your Career' },
    { num: 16, key: 'utmost_desire_from_god', label: 'Utmost Desire from God' },
    { num: 17, key: 'hobbies', label: 'Hobbies' },
    { num: 18, key: 'favorite_quote', label: 'Favorite Quote' },
    { num: 19, key: 'favorite_song', label: 'Favorite Song' },
    { num: 20, key: 'favorite_food', label: 'Favorite Food' },
    { num: 21, key: 'view_about_life', label: 'Your View About Life' },
    { num: 22, key: 'word_of_advice', label: 'Word of Advice' },
    { num: 23, key: 'source_of_inspiration', label: 'Source of Inspiration' },
    { num: 24, key: 'marital_status', label: 'Marital Status' },
  ];

  const answeredCount = QUESTIONNAIRE_FIELDS.filter(f => Boolean(profile[f.key] && String(profile[f.key]).trim())).length;
  const completionPercentage = Math.round((answeredCount / 24) * 100);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        let userStatus = 'General';
        if (user) {
          const { data: p } = await supabase
            .from('profiles')
            .select('student_status')
            .eq('id', user.id)
            .single();
          if (p?.student_status) {
            userStatus = p.student_status;
          }
        }

        const [postsRes, notifsRes] = await Promise.all([
          supabase.from('posts').select('*').eq('status', 'published').order('created_at', { ascending: false }).limit(2),
          supabase.from('notifications').select('*').or(`category.eq.General,category.eq.${userStatus}`).order('created_at', { ascending: false }).limit(2)
        ]);

        setRecentPosts(postsRes.data || []);
        setRecentNotifs(notifsRes.data || []);
      } catch (err) {
        console.error('Error fetching recent activities:', err);
      } finally {
        setFetchingActivity(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
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

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Session expired. Please sign in again.');
        return;
      }

      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setProfile({ ...profile, avatar_url: publicUrl });
      alert('Profile picture uploaded successfully!');
    } catch (error: any) {
       console.error('Error uploading avatar:', error);
       alert(`Upload Failed: ${error.message || 'Make sure your "avatars" bucket is created and set to PUBLIC in the Supabase console.'}`);
    } finally {
      setUploading(false);
    }
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      const remoteProfile = data || { email: user.email, id: user.id };
      
      // Auto-restore draft from localStorage if available
      const localDraft = localStorage.getItem('cacyof_profile_draft');
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          if (parsed && parsed.id === user.id) {
            setProfile({ ...remoteProfile, ...parsed, isDraftRestored: true });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing draft:', e);
        }
      }
      
      setProfile(remoteProfile);
    }
    setLoading(false);
  };

  // Auto-save draft on form input changes
  useEffect(() => {
    if (profile && profile.id) {
      const { isDraftRestored, ...cleanDraft } = profile;
      localStorage.setItem('cacyof_profile_draft', JSON.stringify(cleanDraft));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Session expired. Please sign in again.');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone_number: profile.phone_number,
          academic_level: profile.academic_level,
          student_status: profile.student_status,
          church_role: profile.church_role || 'member',
          church_position: profile.church_position || '',
          academic_session: profile.academic_session || '',
          department: profile.department,
          unit_in_fellowship: profile.unit_in_fellowship || profile.church_position || profile.church_role || 'member',
          dob: profile.dob || '',
          nickname: profile.nickname || '',
          state_of_origin: profile.state_of_origin || '',
          home_address: profile.home_address || profile.contact_address || '',
          contact_address: profile.contact_address || profile.home_address || '',
          facebook_name: profile.facebook_name || '',
          view_and_desire_about_cacyof: profile.view_and_desire_about_cacyof || '',
          mentor_name: profile.mentor_name || '',
          entrepreneurship_path: profile.entrepreneurship_path || '',
          career_path: profile.career_path || '',
          utmost_desire_from_god: profile.utmost_desire_from_god || '',
          hobbies: profile.hobbies || '',
          favorite_quote: profile.favorite_quote || '',
          favorite_song: profile.favorite_song || '',
          favorite_food: profile.favorite_food || '',
          view_about_life: profile.view_about_life || '',
          word_of_advice: profile.word_of_advice || '',
          source_of_inspiration: profile.source_of_inspiration || '',
          marital_status: profile.marital_status || 'Single',
          email: user.email,
          role: profile.role || 'member',
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      setSaved(true);
      localStorage.removeItem('cacyof_profile_draft');
      if (profile.isDraftRestored) {
        setProfile((prev: any) => ({ ...prev, isDraftRestored: false }));
      }
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(`Error updating profile: ${err.message || 'Please ensure you completed crucial database columns.'}`);
    } finally {
      setSaving(false);
    }
  };

  const exportPersonalDocx = async () => {
    try {
      setExportingDocx(true);
      const cleanName = formatCleanFullName(profile.full_name || 'MEMBER_DOSSIER');
      
      const docChildren: any[] = [
        new Paragraph({
          text: "CHRIST APOSTOLIC CHURCH YOUTH FELLOWSHIP",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "FEDERAL POLYTECHNIC EDE CHAPTER (CACYOF FPE)",
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "OFFICIAL MEMBER & FYB DOSSIER PROFILE",
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "═".repeat(65), alignment: AlignmentType.CENTER }),
        new Paragraph({ text: "", spacing: { after: 200 } }),
      ];

      QUESTIONNAIRE_FIELDS.forEach(f => {
        const val = profile[f.key] || 'N/A';
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${f.num}. ${f.label}: `, bold: true }),
              new TextRun(String(val))
            ],
            spacing: { after: 100 }
          })
        );
      });

      docChildren.push(
        new Paragraph({ text: "", spacing: { after: 200 } }),
        new Paragraph({
          text: `Generated officially on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          alignment: AlignmentType.RIGHT,
        })
      );

      const doc = new Document({
        sections: [{ properties: {}, children: docChildren }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${cleanName.replace(/\s+/g, '_')}_CACYOF_Dossier.docx`);
    } catch (err) {
      console.error('Error generating personal docx:', err);
      alert('Could not export Word file. Please try again.');
    } finally {
      setExportingDocx(false);
    }
  };

  if (loading) return <div className="flex py-40 justify-center"><Loader2 className="animate-spin text-[#0A2540]" size={40} /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Fellowship Registry & FYB Profile</h1>
          <p className="text-gray-400 font-light italic">Your official 24-question record for fellowship directory, dossiers, yearbooks, and flyers.</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-sky-200"
          >
            <Eye size={16} />
            <span>Preview Dossier</span>
          </button>

          <button
            type="button"
            onClick={exportPersonalDocx}
            disabled={exportingDocx}
            className="flex items-center space-x-2 px-4 py-2.5 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-amber-200"
          >
            {exportingDocx ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>Export Docx</span>
          </button>
        </div>
      </div>

      {/* Questionnaire Completion Progress Bar */}
      <div className="bg-gradient-to-r from-[#0A2540] via-sky-950 to-[#0A2540] text-white p-6 rounded-3xl shadow-xl shadow-[#0A2540]/10 border border-sky-900/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Official 24-Questionnaire Completion</h3>
              <p className="text-xs text-gray-300">Complete all 24 questions to ensure your profile appears perfectly in fellowship dossiers & yearbooks.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-[#D4AF37] text-[#0A2540] rounded-full text-xs font-black uppercase tracking-wider">
              {answeredCount} / 24 Completed ({completionPercentage}%)
            </span>
          </div>
        </div>

        {/* Progress meter */}
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
          <div 
            className="bg-gradient-to-r from-amber-400 via-[#D4AF37] to-emerald-400 h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.max(completionPercentage, 4)}%` }}
          ></div>
        </div>
      </div>

      {/* Recent Activity Widget */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl shadow-[#0A2540]/5">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-8 bg-[#D4AF37] rounded-full"></div>
            <div>
              <h2 className="text-xl font-bold text-[#0A2540] uppercase tracking-wider font-sans">Recent Fellowship Activity</h2>
              <p className="text-xs text-gray-400 font-light mt-0.5">Stay updated with the latest service announcements & word files.</p>
            </div>
          </div>
          <span className="animate-pulse flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
        </div>

        {fetchingActivity ? (
          <div className="flex py-10 justify-center items-center space-x-3">
            <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
            <span className="text-xs text-gray-400 font-medium">Refreshing bulletins & devotionals...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Announcements Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <Bell size={12} className="text-[#D4AF37]" /> Bulletins & Announcements
                </span>
                <Link to="/dashboard/member/notifications" className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
                  View Board <ArrowRight size={10} />
                </Link>
              </div>

              {recentNotifs.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-100">
                  <p className="text-xs text-gray-400 italic">No fellowship bulletins available at this time.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentNotifs.map((notif) => (
                    <div key={notif.id} className="p-4 bg-gray-50 hover:bg-[#D4AF37]/5 rounded-2xl border border-gray-100/50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest bg-[#0A2540]/5 text-[#0A2540] rounded-md border border-[#0A2540]/10">
                          {notif.category}
                        </span>
                        <span className="text-[9px] font-medium text-gray-400 font-mono">
                          {new Date(notif.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#0A2540] mb-1">{notif.title}</h4>
                      <p className="text-[11px] text-gray-400 font-light line-clamp-2 leading-relaxed">{notif.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devotionals Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-[#D4AF37]" /> Divine Feed & Devotionals
                </span>
                <Link to="/blog" className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
                  View Devotionals <ArrowRight size={10} />
                </Link>
              </div>

              {recentPosts.length === 0 ? (
                <div className="p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-100">
                  <p className="text-xs text-gray-400 italic">No devotionals posted yet. Spiritual updates pending.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="p-4 bg-gray-50 hover:bg-[#0A2540]/5 rounded-2xl border border-gray-100/50 transition-colors flex flex-col justify-between h-auto">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest bg-[#D4AF37]/10 text-[#0A2540] rounded-md border border-[#D4AF37]/20">
                            {post.category}
                          </span>
                          <span className="text-[9px] font-medium text-gray-400 font-mono">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#0A2540] mb-1 truncate">{post.title}</h4>
                        <p className="text-[11px] text-gray-400 font-light line-clamp-1 leading-relaxed mb-3">{post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 100) : ''}</p>
                      </div>
                      <Link 
                        to={`/blog/${post.id}`}
                        className="text-[10px] uppercase font-bold text-[#D4AF37] hover:text-[#0A2540] flex items-center gap-1 transition-colors self-start mt-1"
                      >
                        Read Post <ArrowRight size={10} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {profile?.isDraftRestored && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex items-center justify-between font-medium">
          <span>⚠️ Unsaved profile changes have been automatically restored from your draft! Click "Capture Updates" to save live.</span>
          <button 
            type="button"
            onClick={() => {
              localStorage.removeItem('cacyof_profile_draft');
              setProfile((prev: any) => ({ ...prev, isDraftRestored: false }));
            }}
            className="px-3 py-1 bg-amber-200/50 rounded-lg hover:bg-amber-200 text-amber-900 transition-colors uppercase text-[9px] font-bold tracking-wider"
          >
            Clear Draft
          </button>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-[#0A2540]/5 overflow-hidden border border-gray-100 p-12">
          {/* Main ID Section */}
          <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 pb-12 mb-12 border-b border-gray-50">
            <div className="relative group">
              <div className="w-40 h-40 rounded-[2.5rem] bg-gray-50 flex items-center justify-center overflow-hidden border-4 border-[#D4AF37]/20 shadow-inner group-hover:border-[#D4AF37] transition-all duration-500">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={80} className="text-[#D4AF37]/30" />
                )}
              </div>
              <label className="absolute -bottom-4 -right-4 w-12 h-12 bg-[#0A2540] text-[#D4AF37] rounded-2xl flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-all border-4 border-white">
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} disabled={uploading} />
              </label>
            </div>
            
            <div className="text-center md:text-left flex-grow">
              <h2 className="text-3xl font-bold text-[#0A2540] mb-2">{profile.full_name || 'Incomplete Profile'}</h2>
              <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                <span className="flex items-center text-gray-400 text-sm italic"><Bell size={14} className="mr-2" /> {profile.email}</span>
                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] uppercase font-bold tracking-widest border border-green-100">Activated Member</span>
                {profile.student_status && (
                  <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full text-[10px] uppercase font-bold tracking-widest border border-[#D4AF37]/20">
                    {profile.student_status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Section 1: Academic & Personal Identity */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A2540]">1. Academic & Personal Identity</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">1. Full Name (Official format)</label>
                  <input 
                    type="text" value={profile.full_name || ''} 
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all font-bold text-[#0A2540] text-sm"
                    placeholder="e.g. ALABI IYANUOLUWA"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">2. Department</label>
                    <input 
                      type="text" value={profile.department || ''} 
                      onChange={e => setProfile({...profile, department: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g. Banking and Finance"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">3. Level</label>
                    <select 
                      value={profile.academic_level || ''} 
                      onChange={e => setProfile({...profile, academic_level: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold"
                    >
                      <option value="">Select Level</option>
                      <option value="ND1">ND 1</option>
                      <option value="ND2">ND 2</option>
                      <option value="HND1">HND 1</option>
                      <option value="HND2">HND 2</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">5. DOB (Day/Month)</label>
                    <input 
                      type="text" value={profile.dob || ''} 
                      onChange={e => setProfile({...profile, dob: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g. 23/12 or 23RD DEC"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">6. Nickname</label>
                    <input 
                      type="text" value={profile.nickname || ''} 
                      onChange={e => setProfile({...profile, nickname: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g. Lizzy"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">7. State of Origin</label>
                    <input 
                      type="text" value={profile.state_of_origin || ''} 
                      onChange={e => setProfile({...profile, state_of_origin: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g. Osun State"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">24. Marital Status</label>
                    <select 
                      value={profile.marital_status || 'Single'} 
                      onChange={e => setProfile({...profile, marital_status: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-semibold"
                    >
                      <option value="Single">Single</option>
                      <option value="Engaged">Engaged</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Student Status (Classification)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['Fresher', 'Staylite', 'FYB', 'Alumni'].map((status) => {
                      const isSelected = profile.student_status === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setProfile({ ...profile, student_status: status })}
                          className={`p-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all text-center cursor-pointer ${
                            isSelected 
                              ? 'bg-[#0A2540] text-[#D4AF37] border-[#0A2540] shadow-sm' 
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Socials */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A2540]">2. Contact & Socials</h3>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">8. Home / Residential Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                    <input 
                      type="text" value={profile.home_address || profile.contact_address || ''} 
                      onChange={e => setProfile({...profile, home_address: e.target.value, contact_address: e.target.value})}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all font-medium text-xs"
                      placeholder="e.g. North Campus, Ede / Off-Campus Lodge"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">9. Phone No(s)</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                      <input 
                        type="tel" value={profile.phone_number || ''} 
                        onChange={e => setProfile({...profile, phone_number: e.target.value})}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all font-medium text-xs"
                        placeholder="e.g. 09060542876"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">11. Facebook Name</label>
                    <input 
                      type="text" value={profile.facebook_name || ''} 
                      onChange={e => setProfile({...profile, facebook_name: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g. Iyanuoluwa Alabi"
                    />
                  </div>
                </div>

                {/* Section 3: Fellowship & Church Ministry */}
                <div className="pt-2">
                  <div className="flex items-center space-x-3 pb-2 mb-4 border-b border-gray-100">
                    <div className="w-1.5 h-6 bg-[#0A2540] rounded-full"></div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A2540]">3. Fellowship & Ministry</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">4. Unit in Fellowship</label>
                      <input 
                        type="text" value={profile.unit_in_fellowship || ''} 
                        onChange={e => setProfile({...profile, unit_in_fellowship: e.target.value})}
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                        placeholder="e.g. Member, Ushering, Choir, Prayer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Church Role & Office</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={profile.church_role || 'member'} 
                          onChange={e => setProfile({...profile, church_role: e.target.value})}
                          className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-medium"
                        >
                          <option value="member">Member</option>
                          <option value="worker">Worker</option>
                          <option value="executive">Executive</option>
                        </select>
                        <input 
                          type="text" value={profile.church_position || ''} 
                          onChange={e => setProfile({...profile, church_position: e.target.value})}
                          className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-medium"
                          placeholder="Office (e.g. Gen. Sec)"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">13. Your Mentor</label>
                    <input 
                      type="text" value={profile.mentor_name || ''} 
                      onChange={e => setProfile({...profile, mentor_name: e.target.value})}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="e.g. Pastor / Evang. A. B. Adeleke"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Vocation, Ambition & Personal Reflections */}
          <div className="mt-10 pt-10 border-t border-gray-100">
            <div className="flex items-center space-x-3 pb-2 mb-6 border-b border-gray-100">
              <div className="w-1.5 h-6 bg-[#D4AF37] rounded-full"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A2540]">4. Vocation, Aspirations & Spiritual Reflections</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">14. Entrepreneur Path</label>
                <input 
                  type="text" value={profile.entrepreneurship_path || ''} 
                  onChange={e => setProfile({...profile, entrepreneurship_path: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. Event Planner & Catering"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">15. Your Career</label>
                <input 
                  type="text" value={profile.career_path || ''} 
                  onChange={e => setProfile({...profile, career_path: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. Financial Analyst"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">17. Hobbies</label>
                <input 
                  type="text" value={profile.hobbies || ''} 
                  onChange={e => setProfile({...profile, hobbies: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. Cooking, Singing, Reading"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">19. Favorite Song</label>
                <input 
                  type="text" value={profile.favorite_song || ''} 
                  onChange={e => setProfile({...profile, favorite_song: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. Goodness of God"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">20. Favorite Food</label>
                <input 
                  type="text" value={profile.favorite_food || ''} 
                  onChange={e => setProfile({...profile, favorite_food: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. Rice and Beans"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">23. Source of Inspiration</label>
                <input 
                  type="text" value={profile.source_of_inspiration || ''} 
                  onChange={e => setProfile({...profile, source_of_inspiration: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. The Word of God & mentors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">12. Your View and Desire About CACYOF</label>
                <textarea 
                  rows={2} 
                  value={profile.view_and_desire_about_cacyof || ''} 
                  onChange={e => setProfile({...profile, view_and_desire_about_cacyof: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Share your experience and desires for the fellowship..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">16. Your Utmost Desire from God</label>
                <textarea 
                  rows={2} 
                  value={profile.utmost_desire_from_god || ''} 
                  onChange={e => setProfile({...profile, utmost_desire_from_god: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Your spiritual heart cry or prayer..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">18. Favorite Quote</label>
                <textarea 
                  rows={2} 
                  value={profile.favorite_quote || ''} 
                  onChange={e => setProfile({...profile, favorite_quote: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-serif italic text-xs text-[#0A2540] focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="e.g. With God all things are possible"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">21. Your View About Life</label>
                <textarea 
                  rows={2} 
                  value={profile.view_about_life || ''} 
                  onChange={e => setProfile({...profile, view_about_life: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Your philosophy or biblical perspective on life..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">22. Word of Advice</label>
                <textarea 
                  rows={2} 
                  value={profile.word_of_advice || ''} 
                  onChange={e => setProfile({...profile, word_of_advice: e.target.value})}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium text-xs focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Your advice to continuing students & brethren..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            {saved && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                <CheckCircle2 size={18} className="mr-2 text-green-600" /> All 24 Questions Synchronized to Fellowship Database!
              </motion.div>
            )}
          </div>
          
          <button 
            type="submit" disabled={saving}
            className="flex items-center space-x-3 bg-[#0A2540] text-[#D4AF37] px-10 py-4 rounded-2xl font-bold text-base hover:bg-opacity-95 shadow-xl shadow-[#0A2540]/20 disabled:opacity-50 transition-all hover:translate-y-[-2px] active:translate-y-0 w-full sm:w-auto justify-center"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>Capture Updates (Sync Database)</span>
          </button>
        </div>
      </form>

      {/* MODAL: OFFICIAL DOSSIER PREVIEW */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 flex flex-col"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0A2540] text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold">
                    <Award size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif">Official 24-Question Dossier Card</h3>
                    <p className="text-[11px] text-gray-300">CACYOF FPE Official Graduating & Fellowship Portfolio</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Top Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-6 border-b border-gray-100">
                  <div className="w-28 h-28 rounded-2xl bg-gray-100 overflow-hidden border-2 border-[#D4AF37] shadow shrink-0">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#0A2540]">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left space-y-1 flex-1">
                    <h2 className="text-2xl font-bold font-serif text-[#0A2540]">
                      {formatCleanFullName(profile.full_name || 'UNNAMED MEMBER')}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#0A2540] text-[#D4AF37] text-xs font-black">
                        {profile.department || 'Department N/A'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                        {profile.academic_level || 'Level N/A'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-900 text-xs font-bold">
                        {profile.unit_in_fellowship || 'Unit N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 24 Question Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {QUESTIONNAIRE_FIELDS.map((q) => {
                    const val = profile[q.key] || '—';
                    return (
                      <div key={q.num} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded bg-[#0A2540] text-[#D4AF37] text-[9px] font-black flex items-center justify-center shrink-0">
                            {q.num}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                            {q.label}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#0A2540] pl-6 break-words">
                          {val}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-3xl border-t border-gray-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-xl text-xs font-bold"
                >
                  <Printer size={16} />
                  <span>Print Dossier</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={exportPersonalDocx}
                    disabled={exportingDocx}
                    className="flex items-center space-x-2 px-4 py-2 bg-[#D4AF37] hover:bg-amber-400 text-[#0A2540] rounded-xl text-xs font-black uppercase tracking-wider shadow"
                  >
                    <FileText size={16} />
                    <span>Download .docx</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(false)}
                    className="px-4 py-2 bg-[#0A2540] text-white rounded-xl text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function QuoteSubmission() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user?.id).single();
      
      const { error } = await supabase.from('quotes').insert([{ 
        text, author_id: user?.id, author_name: profile?.full_name, status: 'pending' 
      }]);
      if (error) throw error;
      setSuccess(true);
      setText('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      alert('Error submitting quote');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#0A2540] mb-3 font-serif italic">The Inspired Word</h1>
        <p className="text-gray-400 font-light">Your insights can ignite another's faith. Share a word.</p>
      </div>

      <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-gray-100 relative group">
        <div className="absolute -top-6 -left-6 w-12 h-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-[#0A2540] shadow-lg group-hover:rotate-12 transition-transform">
          <QuoteIcon size={24} />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <textarea
            required rows={6} value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-8 bg-gray-50 border-0 rounded-[2rem] outline-none font-serif italic text-2xl text-[#0A2540] placeholder:text-gray-200"
            placeholder="Type your spiritual insight..."
          />
          
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-green-50 text-green-700 rounded-xl text-center font-bold">
              Quote submitted for admin review.
            </motion.div>
          )}

          <button
            type="submit" disabled={submitting || !text.trim()}
            className="w-full py-5 bg-[#0A2540] text-[#D4AF37] rounded-2xl font-bold text-xl hover:scale-[1.01] active:scale-95 shadow-xl transition-all"
          >
            {submitting ? <Loader2 className="animate-spin inline" /> : 'Broadcast Insight'}
          </button>
        </form>
      </div>
    </div>
  );
}

function NotificationInbox() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userStatus = 'General';
      if (user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('student_status')
          .eq('id', user.id)
          .single();
        if (p?.student_status) {
          userStatus = p.student_status;
        }
      }

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`category.eq.General,category.eq.${userStatus}`)
        .order('created_at', { ascending: false });

      const fetchedData = data || [];
      setNotifications(fetchedData);
      if (fetchedData.length > 0) {
        localStorage.setItem('last_viewed_notification_id', fetchedData[0].id);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex py-40 justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Fellowship Board</h1>
        <p className="text-gray-400 font-light">Important announcements from the executive desk.</p>
      </div>

      <div className="space-y-6">
        {notifications.length === 0 ? (
          <div className="bg-white p-20 text-center rounded-[3rem] border-2 border-dashed border-gray-100">
            <Bell className="mx-auto text-gray-100 mb-6" size={80} />
            <p className="text-gray-300 font-bold uppercase tracking-widest">The board is currently clear.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className="bg-white px-10 py-12 rounded-[2.5rem] shadow-sm border border-gray-50 hover:shadow-xl hover:border-[#D4AF37]/30 transition-all group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 text-[#D4AF37]">
                   <Calendar size={14} />
                   <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{new Date(notif.created_at).toLocaleDateString()}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0A2540] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#D4AF37]"><Bell size={14} /></div>
              </div>
              <h3 className="text-2xl font-bold text-[#0A2540] mb-4 font-serif italic group-hover:text-[#D4AF37] transition-colors">{notif.title}</h3>
              <p className="text-gray-500 leading-relaxed font-light">{notif.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
