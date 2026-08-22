import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Download, 
  RefreshCw, 
  Sparkles, 
  Palette, 
  Camera, 
  Check, 
  Copy, 
  UserCheck, 
  Sliders, 
  Eye, 
  Trash2,
  FileImage,
  UploadCloud,
  Crown,
  Shield
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FybData {
  name: string;
  department: string;
  level: string;
  unitInFellowship: string;
  dob: string;
  nickname: string;
  stateOfOrigin: string;
  homeAddress: string;
  phone: string;
  email: string;
  facebookName: string;
  viewAndDesireAboutCacyof: string;
  mentor: string;
  favoriteLecturer?: string;
  entrepreneurPath: string;
  career: string;
  utmostDesireFromGod: string;
  hobbies: string;
  quote: string;
  favoriteSong: string;
  favoriteFood: string;
  viewAboutLife: string;
  wordOfAdvice: string;
  sourceOfInspiration: string;
  maritalStatus: string;
  // Legacy aliases for backward compatibility
  favoriteCourse?: string;
  favoriteCoursemate?: string;
  asideCourse?: string;
  // Photo & Canvas settings
  photoUrl: string;
  photoZoom: number;
  photoX: number;
  photoY: number;
  photoRotate: number;
  headline: string;
  subHeadline: string;
  ministryName: string;
  chapterName: string;
  footerMotto: string;
  logo1Url: string;
  logo2Url: string;
  showLogos: boolean;
  [key: string]: any;
}

// Utility function to strip religious titles from official full names
const formatCleanFullName = (rawName: string): string => {
  if (!rawName) return '';
  return rawName
    .replace(/^(BRO\.|BROTHER|SIS\.|SISTER|EVANG\.|EVANGELIST|PASTOR|PST\.|DCN\.|DEACON|DCNS\.|DEACONESS|APOSTLE|REV\.|REVEREND|ELDER)\s+/i, '')
    .trim()
    .toUpperCase();
};

const DEFAULT_FYB_DATA: FybData = {
  name: 'ALABI IYANUOLUWA',
  department: 'BANKING AND FINANCE',
  level: 'HND 2',
  unitInFellowship: 'MEMBER',
  dob: '23/12',
  nickname: 'LIZZY',
  stateOfOrigin: 'OSUN STATE',
  homeAddress: 'NORTH CAMPUS, EDE',
  phone: '09060542876',
  email: 'iyanuoluwaalabi14@gmail.com',
  facebookName: 'Iyanuoluwa Alabi',
  viewAndDesireAboutCacyof: 'A glorious fellowship grooming leaders with holy standard.',
  mentor: 'PASTOR / EVANG. A. B. ADELEKE',
  entrepreneurPath: 'EVENT PLANNER & CATERING',
  career: 'FINANCIAL ANALYST',
  utmostDesireFromGod: 'Grace to fulfill purpose and remain steadfast in faith.',
  hobbies: 'COOKING, SINGING, READING',
  quote: 'WITH GOD ALL THINGS ARE POSSIBLE',
  favoriteSong: 'GOODNESS OF GOD',
  favoriteFood: 'RICE AND BEANS',
  viewAboutLife: 'Life is a gift of grace to serve God and humanity.',
  wordOfAdvice: 'Keep your eyes on Jesus no matter the storm.',
  sourceOfInspiration: 'The Word of God and godly mentors.',
  maritalStatus: 'SINGLE',
  // Backward compatibility keys
  favoriteCourse: 'BANKING AND FINANCE (HND 2)',
  favoriteCoursemate: 'BRO. TIMOTHY & SIS. DEBORAH',
  asideCourse: 'FINANCIAL ANALYST',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  photoZoom: 100,
  photoX: 0,
  photoY: 0,
  photoRotate: 0,
  headline: 'FYB OF THE',
  subHeadline: 'DAY',
  ministryName: 'CHRIST APOSTOLIC CHURCH YOUTH FELLOWSHIP',
  chapterName: 'THE FEDERAL POLYTECHNIC, EDE CHAPTER',
  footerMotto: 'ONE FOLD, ONE SHEPHERD • KNOWLEDGE, SKILL & CHARACTER',
  logo1Url: '',
  logo2Url: '',
  showLogos: true
};

const THEMES = [
  {
    id: 'aurora-sky-gold',
    name: 'Aurora Sky & 24K Liquid Gold (Signature)',
    bgCss: 'linear-gradient(135deg, #0284C7 0%, #0369A1 26%, #0A2540 60%, #B45309 86%, #F59E0B 100%)',
    canvasBgStart: '#0284C7',
    canvasBgMid1: '#0369A1',
    canvasBgMid2: '#0A2540',
    canvasBgEnd: '#F59E0B',
    shapeOutline: '#FBBF24',
    shapeGlow: 'rgba(245, 158, 11, 0.45)',
    chipGradientStart: '#0284C7',
    chipGradientEnd: '#0A2540',
    chipText: '#FDE68A',
    labelColor: '#B45309',
    dayGradStart: '#FEF08A',
    dayGradMid: '#F59E0B',
    dayGradEnd: '#B45309'
  },
  {
    id: 'celestial-azure-amber',
    name: 'Celestial Azure Glow & Amber Sunset',
    bgCss: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 30%, #1E3A8A 65%, #B45309 88%, #F59E0B 100%)',
    canvasBgStart: '#0EA5E9',
    canvasBgMid1: '#0284C7',
    canvasBgMid2: '#1E3A8A',
    canvasBgEnd: '#B45309',
    shapeOutline: '#38BDF8',
    shapeGlow: 'rgba(56, 189, 248, 0.45)',
    chipGradientStart: '#0EA5E9',
    chipGradientEnd: '#1E3A8A',
    chipText: '#FFFFFF',
    labelColor: '#0284C7',
    dayGradStart: '#7DD3FC',
    dayGradMid: '#38BDF8',
    dayGradEnd: '#F59E0B'
  },
  {
    id: 'royal-sapphire-gold',
    name: 'Imperial Sapphire, Midnight & Molten Gold',
    bgCss: 'linear-gradient(145deg, #1E40AF 0%, #0A2540 40%, #0284C7 70%, #92400E 88%, #D4AF37 100%)',
    canvasBgStart: '#1E40AF',
    canvasBgMid1: '#0A2540',
    canvasBgMid2: '#0284C7',
    canvasBgEnd: '#D4AF37',
    shapeOutline: '#F59E0B',
    shapeGlow: 'rgba(212, 175, 55, 0.5)',
    chipGradientStart: '#1E40AF',
    chipGradientEnd: '#0A2540',
    chipText: '#FEF08A',
    labelColor: '#B45309',
    dayGradStart: '#FDE68A',
    dayGradMid: '#F59E0B',
    dayGradEnd: '#78350F'
  },
  {
    id: 'deep-ocean-puregold',
    name: 'Deep Oceanic Cyan & Sunlit Gold Horizon',
    bgCss: 'linear-gradient(135deg, #0369A1 0%, #082F49 45%, #065F46 75%, #D97706 100%)',
    canvasBgStart: '#0369A1',
    canvasBgMid1: '#082F49',
    canvasBgMid2: '#065F46',
    canvasBgEnd: '#D97706',
    shapeOutline: '#FBBF24',
    shapeGlow: 'rgba(251, 191, 36, 0.4)',
    chipGradientStart: '#0369A1',
    chipGradientEnd: '#082F49',
    chipText: '#6EE7B7',
    labelColor: '#047857',
    dayGradStart: '#6EE7B7',
    dayGradMid: '#38BDF8',
    dayGradEnd: '#F59E0B'
  },
  {
    id: 'hyper-electric-sky-gold',
    name: 'Electric Neon Sky & Champagne Gold',
    bgCss: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 30%, #4338CA 65%, #F59E0B 100%)',
    canvasBgStart: '#38BDF8',
    canvasBgMid1: '#0284C7',
    canvasBgMid2: '#4338CA',
    canvasBgEnd: '#F59E0B',
    shapeOutline: '#FDE047',
    shapeGlow: 'rgba(253, 224, 71, 0.5)',
    chipGradientStart: '#4338CA',
    chipGradientEnd: '#0284C7',
    chipText: '#FEF08A',
    labelColor: '#4338CA',
    dayGradStart: '#BAE6FD',
    dayGradMid: '#FBBF24',
    dayGradEnd: '#D97706'
  }
];

export default function FybFlyerGenerator() {
  const [searchParams] = useSearchParams();
  const paramMemberId = searchParams.get('memberId');

  const [fyb, setFyb] = useState<FybData>(() => {
    // Load persisted permanent logos from localStorage if available
    const savedLogo1 = localStorage.getItem('cacyof_permanent_fyb_logo1') || '';
    const savedLogo2 = localStorage.getItem('cacyof_permanent_fyb_logo2') || '';
    return {
      ...DEFAULT_FYB_DATA,
      logo1Url: savedLogo1,
      logo2Url: savedLogo2,
      showLogos: Boolean(savedLogo1 || savedLogo2)
    };
  });

  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'photo' | 'theme' | 'logos' | 'saved'>('details');
  const [savedFlyers, setSavedFlyers] = useState<any[]>([]);
  
  // 9 Questionnaire fields matching the official template image
  const [customFields, setCustomFields] = useState<Array<{ id: number; label: string; key: keyof FybData }>>([
    { id: 1, label: 'NICKNAME', key: 'nickname' },
    { id: 2, label: 'DOB', key: 'dob' },
    { id: 3, label: 'DEPARTMENT / COURSE', key: 'department' },
    { id: 4, label: 'LEVEL & UNIT', key: 'unitInFellowship' },
    { id: 5, label: 'STATE OF ORIGIN', key: 'stateOfOrigin' },
    { id: 6, label: 'YOUR MENTOR', key: 'mentor' },
    { id: 7, label: 'YOUR CAREER', key: 'career' },
    { id: 8, label: 'HOBBIES', key: 'hobbies' },
    { id: 9, label: 'FAVORITE QUOTE', key: 'quote' },
  ]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logo1InputRef = useRef<HTMLInputElement>(null);
  const logo2InputRef = useRef<HTMLInputElement>(null);

  // Available field options from the official template
  const TEMPLATE_FIELD_OPTIONS: Array<{ label: string; key: keyof FybData }> = [
    { label: 'NICKNAME', key: 'nickname' },
    { label: 'DOB', key: 'dob' },
    { label: 'DEPARTMENT', key: 'department' },
    { label: 'LEVEL', key: 'level' },
    { label: 'UNIT IN FELLOWSHIP', key: 'unitInFellowship' },
    { label: 'STATE OF ORIGIN', key: 'stateOfOrigin' },
    { label: 'HOME ADDRESS', key: 'homeAddress' },
    { label: 'PHONE NO(S)', key: 'phone' },
    { label: 'EMAIL', key: 'email' },
    { label: 'FACEBOOK NAME', key: 'facebookName' },
    { label: 'VIEW & DESIRE ABOUT CACYOF', key: 'viewAndDesireAboutCacyof' },
    { label: 'YOUR MENTOR', key: 'mentor' },
    { label: 'ENTREPRENEUR PATH', key: 'entrepreneurPath' },
    { label: 'YOUR CAREER', key: 'career' },
    { label: 'YOUR UTMOST DESIRE FROM GOD', key: 'utmostDesireFromGod' },
    { label: 'HOBBIES', key: 'hobbies' },
    { label: 'FAVORITE QUOTE', key: 'quote' },
    { label: 'FAVORITE SONG', key: 'favoriteSong' },
    { label: 'FAVORITE FOOD', key: 'favoriteFood' },
    { label: 'YOUR VIEW ABOUT LIFE', key: 'viewAboutLife' },
    { label: 'WORD OF ADVICE', key: 'wordOfAdvice' },
    { label: 'SOURCE OF INSPIRATION', key: 'sourceOfInspiration' },
    { label: 'MARITAL STATUS', key: 'maritalStatus' }
  ];

  // Fetch registered members and saved flyer list
  useEffect(() => {
    fetchRegisteredMembers();
    loadSavedFlyers();
  }, []);

  const fetchRegisteredMembers = async () => {
    try {
      setLoadingMembers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (data && !error) {
        setMembers(data);
        // If URL has memberId param, auto select
        if (paramMemberId) {
          const matched = data.find((m: any) => m.id === paramMemberId);
          if (matched) {
            handleMemberSelect(matched.id, data);
          }
        }
      }
    } catch (err) {
      console.warn('Could not load member profiles for FYB auto-fill:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadSavedFlyers = () => {
    try {
      const saved = localStorage.getItem('cacyof_saved_fyb_flyers');
      if (saved) {
        setSavedFlyers(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Error loading saved flyers:', err);
    }
  };

  const handleMemberSelect = (memberId: string, memberList = members) => {
    setSelectedMemberId(memberId);
    if (!memberId) return;

    const m = memberList.find((item: any) => item.id === memberId);
    if (m) {
      const cleanedFullName = formatCleanFullName(m.full_name || '');
      const nicknameVal = (m.nickname || m.alias || m.preferred_name || 'N/A').toUpperCase();

      const unitVal = m.church_position 
        ? `${m.academic_level || ''} (${m.church_position})`.trim()
        : (m.unit_in_fellowship || m.church_role || 'MEMBER').toUpperCase();

      const dobVal = m.date_of_birth 
        ? new Date(m.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' })
        : (m.dob ? m.dob.toUpperCase() : '23/12');

      setFyb((prev) => ({
        ...prev,
        name: cleanedFullName || prev.name,
        department: (m.department || prev.department).toUpperCase(),
        level: (m.academic_level || prev.level).toUpperCase(),
        unitInFellowship: unitVal.toUpperCase(),
        dob: dobVal,
        nickname: nicknameVal,
        stateOfOrigin: (m.state_of_origin || prev.stateOfOrigin).toUpperCase(),
        homeAddress: m.contact_address || m.home_address || prev.homeAddress,
        phone: m.phone_number || prev.phone,
        email: m.email || prev.email,
        facebookName: m.facebook_name || prev.facebookName,
        viewAndDesireAboutCacyof: m.view_and_desire_about_cacyof || prev.viewAndDesireAboutCacyof,
        mentor: m.mentor_name ? m.mentor_name.toUpperCase() : prev.mentor,
        entrepreneurPath: (m.entrepreneurship_path || prev.entrepreneurPath).toUpperCase(),
        career: (m.career_path || prev.career).toUpperCase(),
        utmostDesireFromGod: m.utmost_desire_from_god || prev.utmostDesireFromGod,
        hobbies: m.hobbies ? m.hobbies.toUpperCase() : prev.hobbies,
        quote: m.favorite_quote ? `“${m.favorite_quote.replace(/[“”"]/g, '')}”`.toUpperCase() : prev.quote,
        favoriteSong: (m.favorite_song || prev.favoriteSong).toUpperCase(),
        favoriteFood: (m.favorite_food || prev.favoriteFood).toUpperCase(),
        viewAboutLife: m.view_about_life || prev.viewAboutLife,
        wordOfAdvice: m.word_of_advice || prev.wordOfAdvice,
        sourceOfInspiration: m.source_of_inspiration || prev.sourceOfInspiration,
        maritalStatus: (m.marital_status || 'Single').toUpperCase(),
        favoriteCourse: m.department ? `${m.department} ${m.academic_level ? `(${m.academic_level})` : ''}`.trim().toUpperCase() : prev.favoriteCourse,
        asideCourse: (m.career_path || prev.asideCourse).toUpperCase(),
        photoUrl: m.avatar_url || prev.photoUrl,
        photoZoom: 100,
        photoX: 0,
        photoY: 0
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please choose an image file (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFyb((prev) => ({
            ...prev,
            photoUrl: event.target?.result as string,
            photoZoom: 100,
            photoX: 0,
            photoY: 0
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Permanent Logo 1 Upload (e.g. CAC Logo)
  const handleLogo1Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          try {
            localStorage.setItem('cacyof_permanent_fyb_logo1', url);
          } catch (storageErr) {
            console.warn('LocalStorage limit for logo1:', storageErr);
          }
          setFyb((prev) => ({
            ...prev,
            logo1Url: url,
            showLogos: true
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Permanent Logo 2 Upload (e.g. Poly / School / Chapter Logo)
  const handleLogo2Upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          try {
            localStorage.setItem('cacyof_permanent_fyb_logo2', url);
          } catch (storageErr) {
            console.warn('LocalStorage limit for logo2:', storageErr);
          }
          setFyb((prev) => ({
            ...prev,
            logo2Url: url,
            showLogos: true
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo1 = () => {
    localStorage.removeItem('cacyof_permanent_fyb_logo1');
    setFyb((prev) => ({ ...prev, logo1Url: '' }));
  };

  const removeLogo2 = () => {
    localStorage.removeItem('cacyof_permanent_fyb_logo2');
    setFyb((prev) => ({ ...prev, logo2Url: '' }));
  };

  // High-Definition Canvas 2D Renderer for Pixel-Perfect 800x1200 Pro Graphics
  const renderToCanvas = useCallback(async (format: 'image/jpeg' | 'image/png' = 'image/jpeg', quality = 0.95): Promise<string> => {
    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D canvas context');

    // Canvas resolution: Exactly w800 by h1200 px
    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. BASE BACKGROUND: Advanced Multi-Stop Sky Blue & Gold Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, activeTheme.canvasBgStart);
    bgGrad.addColorStop(0.26, activeTheme.canvasBgMid1);
    bgGrad.addColorStop(0.60, activeTheme.canvasBgMid2);
    bgGrad.addColorStop(1, activeTheme.canvasBgEnd);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative Geometric Light Waves & Gold Overlays
    ctx.save();
    // Top right golden ambient glow circle
    const goldGlow = ctx.createRadialGradient(width - 50, 60, 10, width - 50, 60, 260);
    goldGlow.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
    goldGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.15)');
    goldGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = goldGlow;
    ctx.beginPath();
    ctx.arc(width - 50, 60, 260, 0, Math.PI * 2);
    ctx.fill();

    // Top left sky blue ambient light
    const skyGlow = ctx.createRadialGradient(80, 80, 10, 80, 80, 240);
    skyGlow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
    skyGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = skyGlow;
    ctx.beginPath();
    ctx.arc(80, 80, 240, 0, Math.PI * 2);
    ctx.fill();

    // Subtle modern geometric angled polygon cuts for pro graphic depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.18);
    ctx.lineTo(width, height * 0.1);
    ctx.lineTo(width, height * 0.88);
    ctx.lineTo(0, height * 0.96);
    ctx.closePath();
    ctx.fill();

    // Radiant Gold Outline Shape around Poster Border (Strictly contained inside canvas)
    ctx.strokeStyle = activeTheme.shapeOutline;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = activeTheme.shapeGlow;
    ctx.shadowBlur = 14;
    ctx.strokeRect(18, 18, width - 36, height - 36);
    ctx.restore();

    // 2. HEADER: Dual Logos + Ministry Titles (Safely inset)
    ctx.save();
    const marginX = 38;
    let textStartX = marginX;
    const logoY = 30;
    const logoSize = 46;

    const hasLogo1 = fyb.showLogos && fyb.logo1Url;
    const hasLogo2 = fyb.showLogos && fyb.logo2Url;

    if (hasLogo1 || hasLogo2) {
      let currentX = marginX;

      // Draw Logo 1 if available
      if (hasLogo1) {
        try {
          const img1 = new Image();
          img1.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img1.onload = resolve;
            img1.onerror = resolve;
            img1.src = fyb.logo1Url;
          });
          if (img1.width > 0) {
            ctx.drawImage(img1, currentX, logoY, logoSize, logoSize);
            currentX += logoSize + 8;
          }
        } catch (err) {
          console.warn('Logo 1 render error:', err);
        }
      }

      // Draw Logo 2 if available
      if (hasLogo2) {
        try {
          const img2 = new Image();
          img2.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img2.onload = resolve;
            img2.onerror = resolve;
            img2.src = fyb.logo2Url;
          });
          if (img2.width > 0) {
            ctx.drawImage(img2, currentX, logoY, logoSize, logoSize);
            currentX += logoSize + 8;
          }
        } catch (err) {
          console.warn('Logo 2 render error:', err);
        }
      }

      textStartX = currentX + 6;
    } else {
      // Default Sleek Typographic Badge
      const badgeX = marginX;
      const badgeY = 30;
      const badgeW = 44;
      const badgeH = 44;
      
      const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY + badgeH);
      badgeGrad.addColorStop(0, '#F59E0B');
      badgeGrad.addColorStop(1, '#D97706');
      ctx.fillStyle = badgeGrad;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
      ctx.fill();

      ctx.fillStyle = '#0A2540';
      ctx.font = '900 14px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('CAC', badgeX + badgeW / 2, badgeY + badgeH / 2);
      textStartX = marginX + badgeW + 12;
    }

    // Ministry Title text
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 13.5px "Montserrat", sans-serif';
    ctx.fillText(fyb.ministryName, textStartX, 48);

    // Chapter Subtitle in Warm Gold
    ctx.fillStyle = '#FDE68A';
    ctx.font = '800 10.5px "Montserrat", sans-serif';
    ctx.fillText(fyb.chapterName, textStartX, 65);
    ctx.restore();

    // 3. MAIN HERO HEADLINE: "FYB OF THE" + "DAY" (PERFECTLY CENTER ALIGNED)
    ctx.save();
    ctx.textAlign = 'center';
    
    // Top Headline centered
    ctx.fillStyle = '#38BDF8'; // Sky Blue
    ctx.font = '900 20px "Impact", "Montserrat", sans-serif';
    ctx.fillText(fyb.headline, width / 2, 118);

    // Metallic Liquid Gold Gradient "DAY" Centered
    const dayGrad = ctx.createLinearGradient(width / 2 - 130, 126, width / 2 + 130, 185);
    dayGrad.addColorStop(0, activeTheme.dayGradStart);
    dayGrad.addColorStop(0.5, activeTheme.dayGradMid);
    dayGrad.addColorStop(1, activeTheme.dayGradEnd);
    ctx.fillStyle = dayGrad;
    ctx.font = '900 58px "Impact", "Montserrat", sans-serif';
    ctx.fillText(fyb.subHeadline, width / 2, 178);

    // Symmetrically Centered Accent Divider Line
    const lineGrad = ctx.createLinearGradient(width / 2 - 220, 192, width / 2 + 220, 192);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.25, activeTheme.shapeOutline);
    lineGrad.addColorStop(0.5, '#38BDF8');
    lineGrad.addColorStop(0.75, activeTheme.shapeOutline);
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 220, 192);
    ctx.lineTo(width / 2 + 220, 192);
    ctx.stroke();
    ctx.restore();

    // 4. LEFT COLUMN: FYB Photo Frame, Pure Full Name Capsule & "Camp of Celebrity" Badge
    const photoBoxX = marginX;
    const photoBoxY = 212;
    const photoBoxW = 276;
    const photoBoxH = 370;
    const photoRadius = 20;

    // Glowing Outer Border matching Theme Shape Outline
    ctx.save();
    ctx.shadowColor = activeTheme.shapeGlow;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = activeTheme.shapeOutline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(photoBoxX - 3, photoBoxY - 3, photoBoxW + 6, photoBoxH + 6, photoRadius + 3);
    ctx.stroke();
    ctx.restore();

    // Photo Box Clip & Drawing
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoBoxX, photoBoxY, photoBoxW, photoBoxH, photoRadius);
    ctx.fillStyle = '#0A2540';
    ctx.fill();
    ctx.clip();

    if (fyb.photoUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          img.src = fyb.photoUrl;
        });

        if (img.width > 0 && img.height > 0) {
          ctx.save();
          const centerX = photoBoxX + photoBoxW / 2 + fyb.photoX;
          const centerY = photoBoxY + photoBoxH / 2 + fyb.photoY;
          ctx.translate(centerX, centerY);
          ctx.rotate((fyb.photoRotate * Math.PI) / 180);

          const scale = (fyb.photoZoom / 100) * Math.max(photoBoxW / img.width, photoBoxH / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;

          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }
      } catch (err) {
        console.warn('Canvas image drawing skipped:', err);
      }
    }
    ctx.restore();

    // Pure Full Name Capsule Banner under Photo (Religious titles removed)
    const namePillY = photoBoxY + photoBoxH + 12;
    const namePillH = 42;
    const nameGrad = ctx.createLinearGradient(photoBoxX, namePillY, photoBoxX + photoBoxW, namePillY + namePillH);
    nameGrad.addColorStop(0, '#F59E0B');
    nameGrad.addColorStop(0.5, '#FBBF24');
    nameGrad.addColorStop(1, '#D97706');

    ctx.save();
    ctx.fillStyle = nameGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.roundRect(photoBoxX, namePillY, photoBoxW, namePillH, 21);
    ctx.fill();

    ctx.fillStyle = '#0A2540';
    ctx.font = '900 12.5px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const cleanRealName = formatCleanFullName(fyb.name);
    const displayRealName = cleanRealName.length > 25 ? cleanRealName.substring(0, 24) + '...' : cleanRealName;
    ctx.fillText(displayRealName, photoBoxX + photoBoxW / 2, namePillY + namePillH / 2);
    ctx.restore();

    // Left Column Secondary Highlight Card: "CAMP OF CELEBRITY"
    const celebrityBoxY = namePillY + namePillH + 14;
    const celebrityBoxH = 114;
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.strokeStyle = activeTheme.shapeOutline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(photoBoxX, celebrityBoxY, photoBoxW, celebrityBoxH, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#FDE68A';
    ctx.font = '900 11px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FINAL YEAR BRETHREN', photoBoxX + photoBoxW / 2, celebrityBoxY + 30);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 14px "Montserrat", sans-serif';
    ctx.fillText('CAMP OF CELEBRITY', photoBoxX + photoBoxW / 2, celebrityBoxY + 56);

    ctx.fillStyle = activeTheme.shapeOutline;
    ctx.font = '14px sans-serif';
    ctx.fillText('✦ ✦ ✦', photoBoxX + photoBoxW / 2, celebrityBoxY + 84);
    ctx.restore();

    // 5. RIGHT COLUMN: 9 Compact Questionnaire Cards (1. Nickname / N/A, followed by 8 fields)
    const rightColX = 336;
    const rightColW = width - rightColX - marginX; // 426px wide
    const rightStartY = 212;
    const cardHeight = 89;
    const cardGap = 8.5;

    customFields.forEach((field, index) => {
      const itemY = rightStartY + index * (cardHeight + cardGap);
      const cardW = rightColW;

      ctx.save();
      // Outer Card Container: Crisp White with subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(rightColX, itemY, cardW, cardHeight, 12);
      ctx.fill();

      // Border outline matching the active theme
      ctx.shadowColor = 'transparent';
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = activeTheme.shapeOutline;
      ctx.stroke();

      // Left Number Chip with Theme Gradient
      const numChipW = 28;
      const numChipH = cardHeight - 12;
      const chipX = rightColX + 6;
      const chipY = itemY + 6;

      const numGrad = ctx.createLinearGradient(chipX, chipY, chipX + numChipW, chipY + numChipH);
      numGrad.addColorStop(0, activeTheme.chipGradientStart);
      numGrad.addColorStop(1, activeTheme.chipGradientEnd);
      ctx.fillStyle = numGrad;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, numChipW, numChipH, 8);
      ctx.fill();

      // Number Digit Text
      ctx.fillStyle = activeTheme.chipText;
      ctx.font = '900 12px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), chipX + numChipW / 2, chipY + numChipH / 2);

      // Content inside the card
      const textX = chipX + numChipW + 12;
      const label = field.label;
      const rawValue = (fyb[field.key] as string) || '';
      const displayRaw = rawValue.trim() ? rawValue : 'N/A';

      // 1. Question Prompt Label
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = activeTheme.labelColor;
      ctx.font = '900 9.5px "Montserrat", sans-serif';
      ctx.fillText(label, textX, itemY + 22);

      // 2. Answer Value (Well-proportioned, charcoal black for crisp legibility)
      ctx.fillStyle = '#0F172A';
      ctx.font = '800 11.5px "Montserrat", "Segoe UI", sans-serif';

      const maxTextW = cardW - numChipW - 28;
      let displayVal = displayRaw;
      if (ctx.measureText(displayVal).width > maxTextW) {
        while (displayVal.length > 3 && ctx.measureText(displayVal + '...').width > maxTextW) {
          displayVal = displayVal.substring(0, displayVal.length - 1);
        }
        displayVal += '...';
      }

      ctx.fillText(displayVal, textX, itemY + 48);
      ctx.restore();
    });

    // 6. FOOTER BAR: Ribbon with Motto (Safely contained inside poster boundaries)
    ctx.save();
    const footerH = 36;
    const footerY = height - footerH - 26;
    
    ctx.fillStyle = '#0A2540';
    ctx.beginPath();
    ctx.roundRect(marginX, footerY, width - (marginX * 2), footerH, 10);
    ctx.fill();

    ctx.strokeStyle = activeTheme.shapeOutline;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 10px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fyb.footerMotto, width / 2, footerY + footerH / 2);
    ctx.restore();

    return canvas.toDataURL(format, quality);
  }, [fyb, activeTheme, customFields]);

  // Download Handler (JPG & PNG at exact 800x1200 resolution)
  const handleDownload = async (format: 'jpg' | 'png') => {
    try {
      setGenerating(true);
      const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
      const dataUrl = await renderToCanvas(mimeType, 0.95);

      const cleanName = formatCleanFullName(fyb.name);
      const link = document.createElement('a');
      const filename = `CACYOF_FYB_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}_800x1200.${format}`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      alert(`Could not download flyer: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Copy flyer image to clipboard
  const handleCopyToClipboard = async () => {
    try {
      setGenerating(true);
      const dataUrl = await renderToCanvas('image/png', 1.0);
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else {
        throw new Error('Clipboard API not supported on this browser.');
      }
    } catch (err: any) {
      alert(`Could not copy to clipboard: ${err.message}. Please use the Download button instead.`);
    } finally {
      setGenerating(false);
    }
  };

  // Save flyer to localStorage library
  const handleSaveFlyer = () => {
    const cleanName = formatCleanFullName(fyb.name);
    const newEntry = {
      id: Date.now(),
      name: cleanName,
      fyb,
      themeId: activeTheme.id,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    const updated = [newEntry, ...savedFlyers.filter((s) => s.name !== cleanName)].slice(0, 20);
    setSavedFlyers(updated);
    localStorage.setItem('cacyof_saved_fyb_flyers', JSON.stringify(updated));
    alert('Flyer saved to FYB Library!');
  };

  const handleLoadSavedFlyer = (saved: any) => {
    const loadedFyb = {
      ...DEFAULT_FYB_DATA,
      ...saved.fyb,
      mentor: saved.fyb.mentor || saved.fyb.favoriteLecturer || DEFAULT_FYB_DATA.mentor
    };
    setFyb(loadedFyb);
    const theme = THEMES.find((t) => t.id === saved.themeId) || THEMES[0];
    setActiveTheme(theme);
    setActiveTab('details');
  };

  const handleDeleteSaved = (id: number) => {
    const updated = savedFlyers.filter((s) => s.id !== id);
    setSavedFlyers(updated);
    localStorage.setItem('cacyof_saved_fyb_flyers', JSON.stringify(updated));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-sky-500/10 text-sky-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-sky-200">
            <Crown size={15} className="text-amber-500" />
            <span>Pro Graphic Studio • 800 × 1200 HD Master</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A2540] font-serif tracking-tight">
            FYB of the Day Flyer Studio
          </h1>
          <p className="text-gray-500 text-sm font-light mt-1">
            Generate ultra-sharp w800 by h1200 social media flyers with advanced Sky Blue & Gold background gradients and permanent dual-logo branding.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleDownload('jpg')}
            disabled={generating}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download size={16} />
            <span>{generating ? 'Exporting...' : 'Download JPG (800x1200)'}</span>
          </button>
          <button
            onClick={() => handleDownload('png')}
            disabled={generating}
            className="flex items-center space-x-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <FileImage size={16} />
            <span>PNG HD</span>
          </button>
          <button
            onClick={handleCopyToClipboard}
            disabled={generating}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-[#0A2540] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            title="Copy directly to clipboard"
          >
            {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (Tabs) & Right Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Form Controls (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50 p-2 gap-1 text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-3 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'details' ? 'bg-white text-[#0A2540] shadow-sm font-black' : 'text-gray-400 hover:text-[#0A2540]'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 py-3 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'photo' ? 'bg-white text-[#0A2540] shadow-sm font-black' : 'text-gray-400 hover:text-[#0A2540]'
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => setActiveTab('logos')}
              className={`flex-1 py-3 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'logos' ? 'bg-white text-[#0A2540] shadow-sm font-black' : 'text-gray-400 hover:text-[#0A2540]'
              }`}
            >
              Logos (2)
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-3 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'theme' ? 'bg-white text-[#0A2540] shadow-sm font-black' : 'text-gray-400 hover:text-[#0A2540]'
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-3 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'saved' ? 'bg-white text-[#0A2540] shadow-sm font-black' : 'text-gray-400 hover:text-[#0A2540]'
              }`}
            >
              Saved ({savedFlyers.length})
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* TAB 1: DETAILS & AUTO-FILL */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Top Banner: Quick Link to Executive & FYB Directory */}
                <div className="bg-gradient-to-r from-[#0A2540] to-sky-900 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-[#D4AF37] flex items-center justify-center font-bold">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-serif">Executive & FYB Directory</h4>
                      <p className="text-[10px] text-gray-300">View & download all graduating brethren dossiers & spreadsheets.</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/admin/executive-fyb"
                    className="bg-[#D4AF37] hover:bg-amber-400 text-[#0A2540] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap shadow"
                  >
                    Open Hub →
                  </Link>
                </div>

                {/* 1-Click Auto Fill from Profiles */}
                <div className="bg-gradient-to-r from-sky-50 to-amber-50 p-4 rounded-2xl border border-sky-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0A2540] flex items-center space-x-1.5 uppercase tracking-wider">
                      <UserCheck size={16} className="text-amber-500" />
                      <span>Auto-Fill from Registered FYBs & Executives</span>
                    </label>
                    {loadingMembers && <span className="text-[10px] text-gray-400">Loading...</span>}
                  </div>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-sky-200 text-xs font-semibold text-[#0A2540] focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Select member to prefill details --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {formatCleanFullName(m.full_name || 'Unnamed')} ({m.church_position || m.student_status || m.academic_level || 'Member'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Primary Full Name under Photo (Secular) */}
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-[#0A2540] uppercase tracking-wider">
                      Official Full Name (Under Photo)
                    </label>
                    <span className="text-[9px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded">
                      Secular / Clean Format
                    </span>
                  </div>
                  <input
                    type="text"
                    value={fyb.name}
                    onChange={(e) => setFyb((prev) => ({ ...prev, name: formatCleanFullName(e.target.value) }))}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-bold text-[#0A2540] focus:outline-none focus:border-amber-500 bg-white"
                    placeholder="e.g. ALABI IYANUOLUWA"
                  />
                </div>

                {/* 9 Questionnaire Fields (Field 1: NICKNAME or N/A) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-bold text-[#0A2540] uppercase tracking-widest flex items-center space-x-1.5">
                      <Sparkles size={14} className="text-amber-500" />
                      <span>9 Flyer Card Items (Official Template)</span>
                    </span>
                    <button
                      onClick={() => setFyb(DEFAULT_FYB_DATA)}
                      className="text-[10px] font-bold text-gray-400 hover:text-[#0A2540] flex items-center space-x-1 uppercase cursor-pointer"
                    >
                      <RefreshCw size={12} />
                      <span>Reset</span>
                    </button>
                  </div>

                  {customFields.map((field, idx) => (
                    <div key={field.id} className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                          <span className="inline-block w-4 h-4 rounded-md bg-gradient-to-r from-sky-600 to-amber-500 text-white text-[9px] text-center leading-4 font-black shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                              const newLabel = e.target.value;
                              setCustomFields((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, label: newLabel } : item))
                              );
                            }}
                            className="bg-transparent text-[10px] font-black text-amber-800 uppercase tracking-wider border-b border-dashed border-gray-300 focus:border-amber-500 focus:outline-none w-full"
                          />
                        </div>

                        {/* Field key selector */}
                        <select
                          value={field.key}
                          onChange={(e) => {
                            const newKey = e.target.value as keyof FybData;
                            const option = TEMPLATE_FIELD_OPTIONS.find(o => o.key === newKey);
                            setCustomFields((prev) =>
                              prev.map((item, i) => i === idx ? { 
                                ...item, 
                                key: newKey, 
                                label: option ? option.label : item.label 
                              } : item)
                            );
                          }}
                          className="text-[9px] font-bold text-gray-500 bg-white border border-gray-200 rounded px-1.5 py-0.5"
                          title="Switch questionnaire question"
                        >
                          {TEMPLATE_FIELD_OPTIONS.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        value={String(fyb[field.key] || '')}
                        onChange={(e) =>
                          setFyb((prev) => ({
                            ...prev,
                            [field.key]: e.target.value
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-[#0A2540] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white"
                        placeholder={field.key === 'nickname' ? 'Enter Nickname (or leave empty for N/A)...' : `Enter ${field.label}...`}
                      />
                    </div>
                  ))}
                </div>

                {/* Headline & Banner customizer */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <span className="text-xs font-bold text-[#0A2540] uppercase tracking-widest block">
                    Poster Titles & Chapter Name
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Top Headline</label>
                      <input
                        type="text"
                        value={fyb.headline}
                        onChange={(e) => setFyb((prev) => ({ ...prev, headline: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#0A2540]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Accent Word</label>
                      <input
                        type="text"
                        value={fyb.subHeadline}
                        onChange={(e) => setFyb((prev) => ({ ...prev, subHeadline: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#0A2540]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Chapter Subtitle</label>
                    <input
                      type="text"
                      value={fyb.chapterName}
                      onChange={(e) => setFyb((prev) => ({ ...prev, chapterName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-[#0A2540]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PHOTO & POSITIONING */}
            {activeTab === 'photo' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#0A2540] uppercase tracking-widest mb-2">
                    FYB Portrait Photo
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-gray-50 hover:bg-amber-50/30"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
                      <Camera size={24} />
                    </div>
                    <p className="text-xs font-bold text-[#0A2540]">Click to Upload FYB Photo</p>
                    <p className="text-[10px] text-gray-400 font-light mt-1">Supports JPG, PNG, WEBP high resolution</p>
                  </div>
                </div>

                {/* Photo Adjustment Sliders */}
                <div className="space-y-4 pt-2">
                  <span className="text-xs font-bold text-[#0A2540] uppercase tracking-widest flex items-center space-x-1.5">
                    <Sliders size={14} className="text-amber-500" />
                    <span>Photo Frame Adjustment (Zoom & Pan)</span>
                  </span>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                      <span>Zoom: {fyb.photoZoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="250"
                      value={fyb.photoZoom}
                      onChange={(e) => setFyb((prev) => ({ ...prev, photoZoom: Number(e.target.value) }))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                      <span>Position X: {fyb.photoX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={fyb.photoX}
                      onChange={(e) => setFyb((prev) => ({ ...prev, photoX: Number(e.target.value) }))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                      <span>Position Y: {fyb.photoY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={fyb.photoY}
                      onChange={(e) => setFyb((prev) => ({ ...prev, photoY: Number(e.target.value) }))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-500 font-bold mb-1">
                      <span>Rotation: {fyb.photoRotate}°</span>
                    </div>
                    <input
                      type="range"
                      min="-45"
                      max="45"
                      value={fyb.photoRotate}
                      onChange={(e) => setFyb((prev) => ({ ...prev, photoRotate: Number(e.target.value) }))}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  <button
                    onClick={() => setFyb((prev) => ({ ...prev, photoZoom: 100, photoX: 0, photoY: 0, photoRotate: 0 }))}
                    className="text-xs font-bold text-gray-400 hover:text-[#0A2540] underline pt-2 cursor-pointer"
                  >
                    Reset Photo Crop & Alignment
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: DUAL LOGOS (PERMANENT STORAGE) */}
            {activeTab === 'logos' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#0A2540] uppercase tracking-widest flex items-center space-x-1.5">
                      <UploadCloud size={16} className="text-amber-500" />
                      <span>Permanent Dual Logo Manager</span>
                    </label>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Saved Permanently
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload your official Church Seal (Logo 1) and Federal Poly Ede Logo (Logo 2). Once uploaded, they remain permanently saved in your browser for all future flyers.
                  </p>
                </div>

                {/* Logo 1: CAC Church Logo */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0A2540] uppercase tracking-wider flex items-center space-x-1">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white inline-flex items-center justify-center text-[10px]">1</span>
                      <span>Official CAC Church Logo</span>
                    </span>
                    {fyb.logo1Url && (
                      <button
                        onClick={removeLogo1}
                        className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {fyb.logo1Url ? (
                    <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-emerald-200">
                      <img src={fyb.logo1Url} alt="Logo 1" className="w-14 h-14 object-contain rounded-lg p-1 bg-gray-50" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-700">Logo 1 Active & Saved</p>
                        <p className="text-[10px] text-gray-400">Appears on top-left of every flyer</p>
                        <button
                          onClick={() => logo1InputRef.current?.click()}
                          className="text-[10px] text-amber-600 font-bold hover:underline mt-1 block cursor-pointer"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => logo1InputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-amber-500 p-4 rounded-xl text-center cursor-pointer bg-white transition-all"
                    >
                      <UploadCloud size={20} className="text-amber-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#0A2540]">Upload CAC Emblem PNG</p>
                      <p className="text-[10px] text-gray-400">Transparent PNG recommended</p>
                    </div>
                  )}
                  <input
                    ref={logo1InputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogo1Upload}
                    className="hidden"
                  />
                </div>

                {/* Logo 2: Polytechnic / Chapter Logo */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0A2540] uppercase tracking-wider flex items-center space-x-1">
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white inline-flex items-center justify-center text-[10px]">2</span>
                      <span>Federal Poly Ede / Chapter Logo</span>
                    </span>
                    {fyb.logo2Url && (
                      <button
                        onClick={removeLogo2}
                        className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {fyb.logo2Url ? (
                    <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-emerald-200">
                      <img src={fyb.logo2Url} alt="Logo 2" className="w-14 h-14 object-contain rounded-lg p-1 bg-gray-50" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-emerald-700">Logo 2 Active & Saved</p>
                        <p className="text-[10px] text-gray-400">Appears beside Logo 1</p>
                        <button
                          onClick={() => logo2InputRef.current?.click()}
                          className="text-[10px] text-sky-600 font-bold hover:underline mt-1 block cursor-pointer"
                        >
                          Change Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => logo2InputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-sky-500 p-4 rounded-xl text-center cursor-pointer bg-white transition-all"
                    >
                      <UploadCloud size={20} className="text-sky-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#0A2540]">Upload Poly / Chapter PNG</p>
                      <p className="text-[10px] text-gray-400">Transparent PNG recommended</p>
                    </div>
                  )}
                  <input
                    ref={logo2InputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleLogo2Upload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: THEMES & ADVANCED MIXED COLOR PALETTES */}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#0A2540] uppercase tracking-widest mb-3 flex items-center space-x-1.5">
                    <Palette size={14} className="text-amber-500" />
                    <span>Advanced Mixed Gradient Palettes</span>
                  </label>
                  <p className="text-xs text-gray-400 mb-4">
                    Rich gradient backgrounds with matching shape outlines and illuminated glowing borders.
                  </p>
                  <div className="space-y-3">
                    {THEMES.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setActiveTheme(t)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          activeTheme.id === t.id
                            ? 'border-amber-500 bg-amber-50/20 shadow-md ring-2 ring-amber-400/20'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5">
                          <div
                            className="w-10 h-10 rounded-xl shadow-inner border-2 border-white shrink-0"
                            style={{ background: t.bgCss }}
                          />
                          <div>
                            <span className="text-xs font-black text-[#0A2540] block">{t.name}</span>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.shapeOutline }} />
                              <span className="text-[10px] text-gray-500 font-semibold">Matching Outline: {t.shapeOutline}</span>
                            </div>
                          </div>
                        </div>
                        {activeTheme.id === t.id && <Check size={18} className="text-amber-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SAVED FLYERS */}
            {activeTab === 'saved' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#0A2540] uppercase tracking-widest">
                    Saved Library
                  </span>
                  <button
                    onClick={handleSaveFlyer}
                    className="bg-[#0A2540] text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase hover:bg-opacity-90 transition-all cursor-pointer"
                  >
                    + Save Current
                  </button>
                </div>

                {savedFlyers.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No saved flyers yet. Click "+ Save Current" to save this design.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {savedFlyers.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100/60 transition-all"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#0A2540]">{s.name}</p>
                          <p className="text-[10px] text-gray-400">{s.date}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleLoadSavedFlyer(s)}
                            className="p-1.5 bg-white text-[#0A2540] rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-bold cursor-pointer"
                            title="Load design"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteSaved(s.id)}
                            className="p-1.5 text-red-400 hover:text-red-600 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview (Exact 800x1200 Pro Graphics Ratio: 2:3) */}
        <div className="xl:col-span-7 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-3 px-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-1.5">
              <Eye size={14} />
              <span>Live Graphic Canvas • 800 × 1200 px (2:3 Poster)</span>
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded font-black uppercase tracking-wider">
              {activeTheme.name.split('(')[0]}
            </span>
          </div>

          {/* Scalable Container matching the 800x1200 aspect ratio */}
          <div className="w-full max-w-[530px] aspect-[2/3] rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden relative select-none">
            <div
              className="w-full h-full relative p-4 flex flex-col justify-between overflow-hidden box-border"
              style={{
                background: activeTheme.bgCss,
                fontFamily: 'Montserrat, system-ui, -apple-system, sans-serif'
              }}
            >
              {/* Background ambient lighting glows */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-400/20 blur-3xl pointer-events-none" />
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-sky-400/25 blur-2xl pointer-events-none" />
              
              {/* Inner Outline Frame strictly contained within poster */}
              <div 
                className="absolute inset-2 rounded-[1.6rem] pointer-events-none transition-colors"
                style={{
                  border: `2px solid ${activeTheme.shapeOutline}`,
                  boxShadow: `0 0 14px ${activeTheme.shapeGlow}`
                }}
              />

              {/* 1. Header Row: Dual Logos & Ministry Name */}
              <div className="relative z-10 flex items-center space-x-2.5 pt-1 px-1">
                {(fyb.logo1Url || fyb.logo2Url) ? (
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {fyb.logo1Url && (
                      <img
                        src={fyb.logo1Url}
                        alt="CAC Logo"
                        className="w-8 h-8 object-contain drop-shadow-md rounded-lg"
                      />
                    )}
                    {fyb.logo2Url && (
                      <img
                        src={fyb.logo2Url}
                        alt="Poly Logo"
                        className="w-8 h-8 object-contain drop-shadow-md rounded-lg"
                      />
                    )}
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#0A2540] font-black text-[10px] shadow-sm shrink-0">
                    CAC
                  </div>
                )}
                <div>
                  <h3 className="text-[10.5px] font-black text-white tracking-wide leading-tight uppercase">
                    {fyb.ministryName}
                  </h3>
                  <p className="text-[8.5px] font-black text-amber-200 tracking-wider uppercase">
                    {fyb.chapterName}
                  </p>
                </div>
              </div>

              {/* 2. Main Title Row: "FYB OF THE" + "DAY" (WELL ALIGNED AT CENTER) */}
              <div className="relative z-10 px-1 mt-0.5 text-center flex flex-col items-center justify-center">
                <div className="text-[13px] font-black text-sky-300 tracking-wider leading-none uppercase drop-shadow-sm font-sans">
                  {fyb.headline}
                </div>
                <div 
                  className="text-[38px] font-black tracking-tighter leading-none uppercase bg-clip-text text-transparent drop-shadow-md"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${activeTheme.dayGradStart}, ${activeTheme.dayGradMid}, ${activeTheme.dayGradEnd})`
                  }}
                >
                  {fyb.subHeadline}
                </div>
                <div 
                  className="h-0.5 w-48 mt-1 rounded-full opacity-85"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeTheme.shapeOutline}, #38BDF8, ${activeTheme.shapeOutline}, transparent)`
                  }}
                />
              </div>

              {/* 3. Center Split: Left Frame & Right 9 Questionnaire Cards */}
              <div className="relative z-10 grid grid-cols-12 gap-2.5 my-auto items-stretch px-1">
                {/* Left Side: Photo Frame + Secular Full Name Banner + Camp of Celebrity (5 cols) */}
                <div className="col-span-5 flex flex-col justify-between">
                  {/* Photo Container with Custom Shape Outline */}
                  <div
                    className="w-full aspect-[3/4] rounded-[1.2rem] relative overflow-hidden shadow-xl"
                    style={{
                      border: `2.5px solid ${activeTheme.shapeOutline}`,
                      boxShadow: `0 0 14px ${activeTheme.shapeGlow}`,
                      backgroundColor: '#0A2540'
                    }}
                  >
                    {fyb.photoUrl ? (
                      <img
                        src={fyb.photoUrl}
                        alt="FYB Portrait"
                        className="w-full h-full object-cover"
                        style={{
                          transform: `scale(${fyb.photoZoom / 100}) translate(${fyb.photoX / 2}px, ${
                            fyb.photoY / 2
                          }px) rotate(${fyb.photoRotate}deg)`,
                          transformOrigin: 'center center'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
                        <Camera size={26} />
                        <span className="text-[8px] mt-1">No photo</span>
                      </div>
                    )}
                  </div>

                  {/* Pure Secular Full Name Pill under photo */}
                  <div className="w-full mt-1.5 py-1 px-2 rounded-xl text-center shadow-lg bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 border border-amber-200">
                    <span className="text-[9.5px] font-black text-[#0A2540] uppercase tracking-wider block truncate">
                      {formatCleanFullName(fyb.name)}
                    </span>
                  </div>

                  {/* Camp of Celebrity Badge */}
                  <div 
                    className="mt-1.5 p-2 rounded-xl bg-white/10 backdrop-blur-md text-center"
                    style={{
                      border: `1.5px solid ${activeTheme.shapeOutline}`
                    }}
                  >
                    <p className="text-[7.5px] font-black text-amber-200 uppercase tracking-widest">FINAL YEAR BRETHREN</p>
                    <p className="text-[9px] font-black text-white uppercase mt-0.5 tracking-wider">CAMP OF CELEBRITY</p>
                    <p className="text-[8px] mt-0.5 opacity-80" style={{ color: activeTheme.shapeOutline }}>✦ ✦ ✦</p>
                  </div>
                </div>

                {/* Right Side: 9 Compact Questionnaire Cards (7 cols, 1. Nickname / N/A) */}
                <div className="col-span-7 space-y-1">
                  {customFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="bg-white/95 backdrop-blur-md shadow-sm rounded-lg p-1 flex items-center space-x-1.5 transition-all"
                      style={{
                        border: `1.5px solid ${activeTheme.shapeOutline}`
                      }}
                    >
                      {/* Left Number Chip */}
                      <div
                        className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center text-[8px] font-black shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${activeTheme.chipGradientStart}, ${activeTheme.chipGradientEnd})`,
                          color: activeTheme.chipText
                        }}
                      >
                        {idx + 1}
                      </div>

                      {/* Content: Label & Value */}
                      <div className="flex-1 min-w-0 pr-0.5">
                        <div
                          className="text-[7px] font-black uppercase tracking-wider leading-none truncate"
                          style={{ color: activeTheme.labelColor }}
                        >
                          {field.label}
                        </div>
                        <div className="text-[8px] font-black text-slate-900 truncate leading-tight mt-0.5">
                          {String(fyb[field.key] || '').trim() || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Bottom Footer Strip (Neatly nested inside boundaries) */}
              <div 
                className="relative z-10 w-full py-1 px-3 rounded-lg text-center bg-[#0A2540] mx-auto shadow-sm"
                style={{
                  border: `1.5px solid ${activeTheme.shapeOutline}`
                }}
              >
                <p className="text-[7.5px] font-black text-white uppercase tracking-widest truncate">
                  {fyb.footerMotto}
                </p>
              </div>
            </div>
          </div>

          {/* Invisible canvas for high-definition 800x1200 export */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Export helper toolbar */}
          <div className="flex items-center space-x-4 mt-6">
            <button
              onClick={() => handleDownload('jpg')}
              disabled={generating}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Download size={16} />
              <span>Export HD JPG (800×1200)</span>
            </button>
            <button
              onClick={handleSaveFlyer}
              className="flex items-center space-x-2 bg-white text-[#0A2540] border border-gray-200 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
            >
              <span>Save to Library</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
