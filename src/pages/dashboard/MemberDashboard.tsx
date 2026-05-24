import { Routes, Route, Link } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
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
  ArrowRight
} from 'lucide-react';

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
          hobbies: profile.hobbies,
          mentor_name: profile.mentor_name,
          career_path: profile.career_path,
          entrepreneurship_path: profile.entrepreneurship_path,
          marital_status: profile.marital_status,
          favorite_quote: profile.favorite_quote,
          favorite_food: profile.favorite_food,
          contact_address: profile.contact_address || '',
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

  if (loading) return <div className="flex py-40 justify-center"><Loader2 className="animate-spin text-[#0A2540]" size={40} /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-bold text-[#0A2540] font-serif italic mb-2">Fellowship Registry</h1>
        <p className="text-gray-400 font-light italic">Your data helps us serve you better in the fellowship.</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Column 1: Registry Data */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A2540]">Registry Data</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Identity</label>
                  <input 
                    type="text" value={profile.full_name || ''} 
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all font-medium"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Contact Line</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                    <input 
                      type="tel" value={profile.phone_number || ''} 
                      onChange={e => setProfile({...profile, phone_number: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all font-medium"
                      placeholder="+234..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Contact Address</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                    <input 
                      type="text" value={profile.contact_address || ''} 
                      onChange={e => setProfile({...profile, contact_address: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37] transition-all font-medium text-sm"
                      placeholder="E.g. Room 12, Block A, North Campus Hostels"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Level</label>
                    <select 
                      value={profile.academic_level || ''} 
                      onChange={e => setProfile({...profile, academic_level: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none"
                    >
                      <option value="">Status</option>
                      <option value="ND1">ND 1</option><option value="ND2">ND 2</option>
                      <option value="HND1">HND 1</option><option value="HND2">HND 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Union Status</label>
                    <select 
                      value={profile.marital_status || ''} 
                      onChange={e => setProfile({...profile, marital_status: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none"
                    >
                      <option value="">Status</option>
                      <option value="Single">Single</option>
                      <option value="Engaged">Engaged</option>
                      <option value="Married">Married</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Unit</label>
                    <input 
                      type="text" value={profile.department || ''} 
                      onChange={e => setProfile({...profile, department: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="E.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Session</label>
                    <input 
                      type="text" value={profile.academic_session || ''} 
                      onChange={e => setProfile({...profile, academic_session: e.target.value})}
                      className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none font-medium text-sm focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="E.g. 2024/2025"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Student Classification/Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['Fresher', 'Staylite', 'FYB', 'Alumni'].map((status) => {
                      const isSelected = profile.student_status === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setProfile({ ...profile, student_status: status })}
                          className={`p-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider border-2 transition-all text-center ${
                            isSelected 
                              ? 'bg-[#0A2540] text-[#D4AF37] border-[#0A2540] shadow-md shadow-[#0A2540]/10' 
                              : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
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

            {/* Column 2: Spiritual & Vision */}
            <div className="space-y-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-1 h-6 bg-[#D4AF37] rounded-full"></div>
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0A2540]">Vision & Life</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Assigned Mentor</label>
                  <input 
                    type="text" value={profile.mentor_name || ''} 
                    onChange={e => setProfile({...profile, mentor_name: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Career Ambition</label>
                  <input 
                    type="text" value={profile.career_path || ''} 
                    onChange={e => setProfile({...profile, career_path: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none"
                    placeholder="E.g. AI Researcher"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Business Venture</label>
                  <input 
                    type="text" value={profile.entrepreneurship_path || ''} 
                    onChange={e => setProfile({...profile, entrepreneurship_path: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none"
                    placeholder="E.g. Digital Marketing"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Favorite Nourishment</label>
                  <input 
                    type="text" value={profile.favorite_food || ''} 
                    onChange={e => setProfile({...profile, favorite_food: e.target.value})}
                    className="w-full p-4 bg-gray-50 border-0 rounded-2xl outline-none"
                  />
                </div>

                <div className="pt-6 border-t border-gray-50/50">
                  <span className="block text-xs font-bold text-[#0A2540] uppercase tracking-[0.15em] mb-4">Church Assignment</span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Church Role</label>
                      <select 
                        value={profile.church_role || 'member'} 
                        onChange={e => setProfile({...profile, church_role: e.target.value})}
                        className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none text-xs font-medium"
                      >
                        <option value="member">Member</option>
                        <option value="worker">Worker</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Office/Position</label>
                      <input 
                        type="text" value={profile.church_position || ''} 
                        onChange={e => setProfile({...profile, church_position: e.target.value})}
                        className="w-full p-3 bg-gray-50 border-0 rounded-xl outline-none text-xs font-medium"
                        placeholder="E.g. Ushering, Publicity Sec., Choir"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-10 border-t border-gray-50">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-1">Spiritual Insight (Favorite Quote)</label>
             <textarea 
               rows={3} 
               value={profile.favorite_quote || ''} 
               onChange={e => setProfile({...profile, favorite_quote: e.target.value})}
               className="w-full p-6 bg-gray-50 border-0 rounded-3xl outline-none font-serif italic text-lg"
               placeholder="Enter a word that inspires you..."
             />
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved ? (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center text-green-600 font-bold italic">
               <CheckCircle2 className="mr-2" /> Records Synchronized
             </motion.div>
          ) : <div></div>}
          
          <button 
            type="submit" disabled={saving}
            className="flex items-center space-x-3 bg-[#0A2540] text-[#D4AF37] px-10 py-5 rounded-2xl font-bold text-lg hover:bg-opacity-95 shadow-2xl shadow-[#0A2540]/20 disabled:opacity-50 transition-all hover:translate-y-[-2px] active:translate-y-0"
          >
            {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            <span>Capture Updates</span>
          </button>
        </div>
      </form>
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
