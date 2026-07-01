import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Tv, 
  Wifi, 
  Calendar, 
  Volume2, 
  BookOpen, 
  MessageSquare, 
  ShieldAlert,
  Loader2,
  Clock,
  Heart
} from 'lucide-react';

export default function Live() {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchLiveStatus();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('live_broadcasts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_broadcasts' }, (payload) => {
        if (payload.new) {
          setLiveData(payload.new);
        }
      })
      .subscribe();

    // Countdown interval
    const interval = setInterval(() => {
      calculateNextService();
    }, 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const fetchLiveStatus = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('live_broadcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setLiveData(data[0]);
      }
    } catch (err) {
      console.error('Error fetching live status:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextService = () => {
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextSunday.setHours(9, 0, 0, 0); // Sunday 9:00 AM

    if (now > nextSunday) {
      nextSunday.setDate(nextSunday.getDate() + 7);
    }

    const diff = nextSunday.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setCountdown({ days, hours, minutes, seconds });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white">
        <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={40} />
        <p className="text-gray-400 font-light text-sm tracking-wide">Syncing sanctuary live feed...</p>
      </div>
    );
  }

  const isLive = liveData?.is_live || false;
  const videoTitle = liveData?.title || 'Sunday Worship Service';
  const embedUrl = liveData?.embed_url || '';

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <section className="bg-[#0A2540] py-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#D4AF37]/5 rounded-full blur-[100px]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-6">
              {isLive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>WE ARE LIVE NOW</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                  <span>TEMPLE BROADCAST STATION</span>
                </>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 leading-tight">
              {isLive ? 'Join Live Worship' : 'Virtual Sanctuary'}
            </h1>
            <p className="text-xl text-white/60 font-light italic leading-relaxed">
              Participate in spiritual fellowships, deep scriptures, and academic alignment from any location.
            </p>
          </div>
        </div>
      </section>

      {/* Main content split */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLive && embedUrl ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column: Player (Span 2) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 relative group aspect-video">
                  <iframe
                    src={embedUrl}
                    title={videoTitle}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0A2540] font-serif leading-none">{videoTitle}</h2>
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1.5 block">
                      🔴 Stream active in real-time
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 bg-red-50 text-red-500 px-4 py-2 rounded-xl text-xs font-extrabold tracking-widest uppercase">
                    <Wifi size={14} className="animate-pulse" />
                    <span>Live broadcast</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Panel */}
              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex flex-col h-full justify-between min-h-[400px]">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200/50 pb-4">
                      <div className="flex items-center space-x-3">
                        <Volume2 className="text-[#D4AF37]" size={20} />
                        <h4 className="text-sm font-bold text-[#0A2540] uppercase tracking-wider">Sanctuary Guide</h4>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">Connected</span>
                    </div>

                    <p className="text-xs text-gray-500 italic leading-relaxed pl-1">
                      Welcome to CACYOF virtual worship. Join other members in listening to the word, praying with holy fire, and positioning yourself for spiritual upgrades.
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#0A2540]">Open scriptures</h5>
                          <p className="text-[11px] text-gray-400 font-light mt-0.5">Keep your Holy Bible open for active academic and spiritual study.</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#0A2540]">Interaction</h5>
                          <p className="text-[11px] text-gray-400 font-light mt-0.5">Comment on our YouTube broadcast feed or send testimony to the admin desk.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200/50 pt-6 mt-6">
                    <a
                      href={embedUrl.replace('embed/', 'watch?v=')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#0A2540] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-center block hover:bg-opacity-95 transition-all shadow-md"
                    >
                      Open in External Player
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Offline Warning Card */}
              <div className="bg-gray-50 rounded-[3rem] p-12 md:p-20 text-center border border-gray-100 max-w-4xl mx-auto shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto text-gray-400">
                    <Tv size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#0A2540] font-serif">Broadcast is Offline</h2>
                    <p className="text-gray-400 text-base font-light italic mt-2">
                      No active stream is currently broadcasting. View our countdown to the next general fellowship below.
                    </p>
                  </div>

                  {/* Countdown blocks */}
                  <div className="grid grid-cols-4 gap-4 max-w-md mx-auto pt-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="text-3xl font-serif font-bold text-[#0A2540]">{countdown.days}</div>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mt-1">Days</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="text-3xl font-serif font-bold text-[#0A2540]">{countdown.hours}</div>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mt-1">Hrs</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="text-3xl font-serif font-bold text-[#0A2540]">{countdown.minutes}</div>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mt-1">Mins</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="text-3xl font-serif font-bold text-red-500">{countdown.seconds}</div>
                      <div className="text-[9px] uppercase tracking-wider font-bold text-gray-400 mt-1">Secs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster / Broadcast Schedule */}
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-3xl font-bold font-serif text-[#0A2540]">Sanctuary Weekly Broadcasts</h3>
                  <p className="text-gray-400 font-light mt-1">Mark your calender and stay in tune with spiritual appointments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-gray-200 transition-all flex flex-col justify-between group">
                    <div className="space-y-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#0A2540] group-hover:text-white transition-all">
                        <Calendar size={22} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#0A2540] font-serif">Sunday Worship Service</h4>
                        <p className="text-gray-400 text-sm font-light mt-1">An encounter of praise, apostolic teachings, and physical breakthroughs.</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-6 mt-8 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Sundays</span>
                      <span className="bg-gray-50 text-[#0A2540] px-3 py-1 rounded font-bold italic">09:00 AM WAT</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-gray-200 transition-all flex flex-col justify-between group">
                    <div className="space-y-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#0A2540] group-hover:text-white transition-all">
                        <BookOpen size={22} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#0A2540] font-serif">Wednesday Bible Study</h4>
                        <p className="text-gray-400 text-sm font-light mt-1">Deep, rigorous, and scripturally sound theological alignment for students.</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-6 mt-8 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Wednesdays</span>
                      <span className="bg-gray-50 text-[#0A2540] px-3 py-1 rounded font-bold italic">05:00 PM WAT</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-gray-200 transition-all flex flex-col justify-between group">
                    <div className="space-y-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#0A2540] group-hover:text-white transition-all">
                        <Clock size={22} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-[#0A2540] font-serif">Friday Prophetic Vigil</h4>
                        <p className="text-gray-400 text-sm font-light mt-1">Intercessory night watches, dynamic prayer chains, and spiritual safety.</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-6 mt-8 flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Fridays</span>
                      <span className="bg-gray-50 text-[#0A2540] px-3 py-1 rounded font-bold italic">10:00 PM WAT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines / Technical Requirements Section */}
          <div className="border-t border-gray-100 pt-20 mt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-block px-4 py-2 bg-[#D4AF37]/10 text-[#0A2540] rounded-full text-xs font-bold uppercase tracking-widest">Requirements</div>
                <h3 className="text-4xl font-bold text-[#0A2540] font-serif leading-tight">Virtual Fellowship Guidelines</h3>
                <p className="text-gray-500 text-lg leading-relaxed font-light italic">
                  Even though we join from different physical locations, we remain united under one spiritual atmosphere. Let us preserve the integrity of our sanctuary.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#D4AF37]"><Heart size={20} /></div>
                    <div>
                      <h4 className="text-base font-bold text-[#0A2540]">Prepare Your Heart</h4>
                      <p className="text-xs text-gray-400">Eliminate domestic distractions and approach virtual streaming as an active, direct service to God.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#D4AF37]"><Volume2 size={20} /></div>
                    <div>
                      <h4 className="text-base font-bold text-[#0A2540]">Focused Attitude</h4>
                      <p className="text-xs text-gray-400">Have a physical writing pad, Holy Bible, and active prayerful posture throughout the service.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical block */}
              <div className="bg-[#0A2540] p-10 md:p-14 text-white rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
                <div className="space-y-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#D4AF37]">
                    <ShieldAlert size={24} />
                  </div>
                  <h4 className="text-xl font-bold font-serif">Technical Checklist</h4>
                  <ul className="space-y-4 text-xs text-white/70 font-light list-disc pl-4 leading-relaxed">
                    <li><strong className="text-white">Connection Speed:</strong> Recommended minimum of 3Mbps (3G/4G broadband) for buffer-free 720p/1080p stream resolution.</li>
                    <li><strong className="text-white">Supported Platforms:</strong> Standard desktop browsers, iOS Safari, Android Chrome, and YouTube native players.</li>
                    <li><strong className="text-white">Audio Output:</strong> Headsets or clean bluetooth speakers are highly recommended during prayer intercessions.</li>
                    <li><strong className="text-white">Bandwidth Cap:</strong> A standard 2-hour high quality video stream utilizes roughly 800MB to 1.5GB of carrier data.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
