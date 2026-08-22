import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Search, 
  Sparkles, 
  Mail, 
  Award, 
  BookOpen, 
  FileText, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Filter, 
  ChevronDown,
  ChevronUp,
  Shield,
  GraduationCap,
  Eye,
  RefreshCw,
  Printer
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';

export interface FybExecutiveRecord {
  id: string;
  full_name: string;
  department?: string;
  academic_level?: string;
  academic_session?: string;
  student_status?: string;
  church_role?: string;
  church_position?: string;
  unit_in_fellowship?: string;
  dob?: string;
  date_of_birth?: string;
  nickname?: string;
  state_of_origin?: string;
  contact_address?: string;
  home_address?: string;
  phone_number?: string;
  email?: string;
  facebook_name?: string;
  view_and_desire_about_cacyof?: string;
  mentor_name?: string;
  entrepreneurship_path?: string;
  career_path?: string;
  utmost_desire_from_god?: string;
  hobbies?: string;
  favorite_quote?: string;
  favorite_song?: string;
  favorite_food?: string;
  view_about_life?: string;
  word_of_advice?: string;
  source_of_inspiration?: string;
  marital_status?: string;
  avatar_url?: string;
  created_at?: string;
  [key: string]: any;
}

// Strip religious titles for clean sorting and display
const formatCleanFullName = (rawName: string): string => {
  if (!rawName) return '';
  return rawName
    .replace(/^(BRO\.|BROTHER|SIS\.|SISTER|EVANG\.|EVANGELIST|PASTOR|PST\.|DCN\.|DEACON|DCNS\.|DEACONESS|APOSTLE|REV\.|REVEREND|ELDER)\s+/i, '')
    .trim()
    .toUpperCase();
};

export default function ExecutiveFybDirectory() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<FybExecutiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all_exec_fyb' | 'all_fyb' | 'all_execs' | 'all_members'>('all_exec_fyb');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState<FybExecutiveRecord | null>(null);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [copiedPhones, setCopiedPhones] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (data && !error) {
        setRecords(data as FybExecutiveRecord[]);
      }
    } catch (err) {
      console.error('Error fetching executive/FYB records:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredRecords = records.filter((r) => {
    const isFyb = r.student_status === 'FYB' || r.academic_level === 'HND2' || r.academic_level === 'ND2';
    const isExec = (r.church_role && (r.church_role.toLowerCase() === 'executive' || r.church_role.toLowerCase() === 'worker')) || 
                   Boolean(r.church_position && r.church_position.trim() !== '');

    let matchesCategory = true;
    if (categoryFilter === 'all_exec_fyb') {
      // Must be BOTH an Executive/Worker and a Graduating Finalist (FYB)
      matchesCategory = (isFyb && isExec) || (isFyb && Boolean(r.church_position));
    } else if (categoryFilter === 'all_fyb') {
      // Any FYB
      matchesCategory = isFyb;
    } else if (categoryFilter === 'all_execs') {
      // Any Fellowship Executive / Leader
      matchesCategory = isExec;
    }

    const matchesDept = departmentFilter === 'All' || r.department === departmentFilter;

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term ||
      r.full_name?.toLowerCase().includes(term) ||
      r.nickname?.toLowerCase().includes(term) ||
      r.department?.toLowerCase().includes(term) ||
      r.church_position?.toLowerCase().includes(term) ||
      r.unit_in_fellowship?.toLowerCase().includes(term) ||
      r.phone_number?.includes(term) ||
      r.email?.toLowerCase().includes(term) ||
      r.mentor_name?.toLowerCase().includes(term) ||
      r.career_path?.toLowerCase().includes(term) ||
      r.state_of_origin?.toLowerCase().includes(term);

    return matchesCategory && matchesDept && matchesSearch;
  });

  // Extract unique departments for filter dropdown
  const departments = Array.from(
    new Set(records.map((r) => r.department).filter(Boolean))
  ).sort() as string[];

  // Statistics counts
  const totalExecFybCount = records.filter(r => 
    (r.student_status === 'FYB' || r.academic_level === 'HND2' || r.academic_level === 'ND2') &&
    ((r.church_role && (r.church_role.toLowerCase() === 'executive' || r.church_role.toLowerCase() === 'worker')) || Boolean(r.church_position))
  ).length;

  const totalFybCount = records.filter(r => r.student_status === 'FYB' || r.academic_level === 'HND2' || r.academic_level === 'ND2').length;
  const totalExecsCount = records.filter(r => (r.church_role && (r.church_role.toLowerCase() === 'executive' || r.church_role.toLowerCase() === 'worker')) || Boolean(r.church_position)).length;

  // 1. Export as Structured CSV / Excel format (with all 24 template columns)
  const handleExportCSV = () => {
    try {
      setIsExportingCsv(true);
      const headers = [
        'Full Name',
        'Department',
        'Level',
        'Unit in Fellowship',
        'DOB',
        'Nickname',
        'State of Origin',
        'Home Address',
        'Phone No(s)',
        'Email',
        'Facebook Name',
        'Your View and Desire about CACYOF',
        'Your Mentor',
        'Entrepreneur Path',
        'Your Career',
        'Your Utmost Desire from God',
        'Hobbies',
        'Favorite Quote',
        'Favorite Song',
        'Favorite Food',
        'Your View about Life',
        'Word of Advice',
        'Source of Inspiration',
        'Marital Status',
        'Church Position / Office',
        'Academic Session',
        'Photo URL'
      ];

      const csvRows = filteredRecords.map((r) => [
        `"${(r.full_name || '').replace(/"/g, '""')}"`,
        `"${(r.department || '').replace(/"/g, '""')}"`,
        `"${(r.academic_level || '').replace(/"/g, '""')}"`,
        `"${(r.unit_in_fellowship || r.church_role || 'member').replace(/"/g, '""')}"`,
        `"${(r.dob || (r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' }) : '')).replace(/"/g, '""')}"`,
        `"${(r.nickname || '').replace(/"/g, '""')}"`,
        `"${(r.state_of_origin || '').replace(/"/g, '""')}"`,
        `"${(r.home_address || r.contact_address || '').replace(/"/g, '""')}"`,
        `"${(r.phone_number || '').replace(/"/g, '""')}"`,
        `"${(r.email || '').replace(/"/g, '""')}"`,
        `"${(r.facebook_name || '').replace(/"/g, '""')}"`,
        `"${(r.view_and_desire_about_cacyof || '').replace(/"/g, '""')}"`,
        `"${(r.mentor_name || '').replace(/"/g, '""')}"`,
        `"${(r.entrepreneurship_path || '').replace(/"/g, '""')}"`,
        `"${(r.career_path || '').replace(/"/g, '""')}"`,
        `"${(r.utmost_desire_from_god || '').replace(/"/g, '""')}"`,
        `"${(r.hobbies || '').replace(/"/g, '""')}"`,
        `"${(r.favorite_quote || '').replace(/"/g, '""')}"`,
        `"${(r.favorite_song || '').replace(/"/g, '""')}"`,
        `"${(r.favorite_food || '').replace(/"/g, '""')}"`,
        `"${(r.view_about_life || '').replace(/"/g, '""')}"`,
        `"${(r.word_of_advice || '').replace(/"/g, '""')}"`,
        `"${(r.source_of_inspiration || '').replace(/"/g, '""')}"`,
        `"${(r.marital_status || 'Single').replace(/"/g, '""')}"`,
        `"${(r.church_position || '').replace(/"/g, '""')}"`,
        `"${(r.academic_session || '').replace(/"/g, '""')}"`,
        `"${(r.avatar_url || '').replace(/"/g, '""')}"`,
      ]);

      const csvContent = [headers.join(','), ...csvRows.map((row) => row.join(','))].join('\r\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const filename = `CACYOF_Executive_FYB_Directory_${categoryFilter}_${new Date().getFullYear()}.csv`;
      saveAs(blob, filename);
    } catch (err: any) {
      alert(`Could not export spreadsheet: ${err.message}`);
    } finally {
      setIsExportingCsv(false);
    }
  };

  // 2. Export Word Yearbook & Dossier Document
  const handleExportWordDoc = async () => {
    if (filteredRecords.length === 0) {
      alert('No records found in current selection to export.');
      return;
    }

    try {
      setIsExportingDoc(true);

      const elements: any[] = [
        new Paragraph({
          text: 'CHRIST APOSTOLIC CHURCH YOUTH FELLOWSHIP (CACYOF)',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 }
        }),
        new Paragraph({
          text: 'THE FEDERAL POLYTECHNIC, EDE CHAPTER',
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: `OFFICIAL EXECUTIVE & FYB DOSSIER DIRECTORY (${filteredRecords.length} BRETHREN)`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: `Generated on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} • Filter: ${categoryFilter.toUpperCase()}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 }
        })
      ];

      for (const m of filteredRecords) {
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
          } catch (imgErr) {
            console.warn('Image skip in word export:', imgErr);
          }
        }

        const cleanName = formatCleanFullName(m.full_name || 'UNNAMED MEMBER');
        const unitDisplay = m.church_position 
          ? `${m.church_role || 'Executive'} - ${m.church_position}` 
          : (m.unit_in_fellowship || m.church_role || 'Member');

        elements.push(
          new Paragraph({
            children: [
              new TextRun({ text: cleanName, bold: true, size: 28, color: '0A2540' })
            ],
            spacing: { before: 300, after: 120 }
          })
        );

        if (imageRun) {
          elements.push(new Paragraph({ children: [imageRun], spacing: { after: 180 } }));
        }

        // Full 24-Question Official Template Breakdown
        elements.push(
          new Paragraph({ children: [new TextRun({ text: 'Department: ', bold: true }), new TextRun(m.department || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Level: ', bold: true }), new TextRun(m.academic_level || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Unit in fellowship: ', bold: true }), new TextRun(unitDisplay)] }),
          new Paragraph({ children: [new TextRun({ text: 'DOB: ', bold: true }), new TextRun(m.dob || (m.date_of_birth ? new Date(m.date_of_birth).toLocaleDateString('en-GB') : 'N/A'))] }),
          new Paragraph({ children: [new TextRun({ text: 'Nickname: ', bold: true }), new TextRun(m.nickname || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'State of origin: ', bold: true }), new TextRun(m.state_of_origin || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Home address: ', bold: true }), new TextRun(m.home_address || m.contact_address || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Phone no(s): ', bold: true }), new TextRun(m.phone_number || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Email: ', bold: true }), new TextRun(m.email || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Facebook name: ', bold: true }), new TextRun(m.facebook_name || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Your view and desire about CACYOF: ', bold: true }), new TextRun(m.view_and_desire_about_cacyof || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Your mentor: ', bold: true }), new TextRun(m.mentor_name || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Entrepreneur path: ', bold: true }), new TextRun(m.entrepreneurship_path || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Your career: ', bold: true }), new TextRun(m.career_path || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Your utmost desire from God: ', bold: true }), new TextRun(m.utmost_desire_from_god || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Hobbies: ', bold: true }), new TextRun(m.hobbies || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Favorite quote: ', bold: true }), new TextRun({ text: `“${m.favorite_quote || 'N/A'}”`, italics: true })] }),
          new Paragraph({ children: [new TextRun({ text: 'Favorite song: ', bold: true }), new TextRun(m.favorite_song || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Favorite food: ', bold: true }), new TextRun(m.favorite_food || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Your view about Life: ', bold: true }), new TextRun(m.view_about_life || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Word of advice: ', bold: true }), new TextRun(m.word_of_advice || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Source of inspiration: ', bold: true }), new TextRun(m.source_of_inspiration || 'N/A')] }),
          new Paragraph({ children: [new TextRun({ text: 'Marital status: ', bold: true }), new TextRun(m.marital_status || 'Single')] }),
          new Paragraph({
            text: '—'.repeat(55),
            spacing: { before: 250, after: 350 }
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
      saveAs(blob, `CACYOF_Executive_FYB_Portfolio_${new Date().getFullYear()}.docx`);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to build Word Dossier: ${err.message}`);
    } finally {
      setIsExportingDoc(false);
    }
  };

  // Copy bulk phone numbers
  const handleCopyPhones = () => {
    const phones = filteredRecords
      .map((r) => r.phone_number)
      .filter((p) => p && p.trim() !== '')
      .join(', ');

    if (!phones) {
      alert('No phone contacts found in this list.');
      return;
    }

    navigator.clipboard.writeText(phones);
    setCopiedPhones(true);
    setTimeout(() => setCopiedPhones(false), 2500);
  };

  // Copy bulk emails
  const handleCopyEmails = () => {
    const emails = filteredRecords
      .map((r) => r.email)
      .filter((e) => e && e.trim() !== '')
      .join(', ');

    if (!emails) {
      alert('No email addresses found in this list.');
      return;
    }

    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  // Direct flyer generation routing
  const handleOpenFlyerGenerator = (memberId: string) => {
    navigate(`/dashboard/admin/fyb-flyer?memberId=${memberId}`);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 to-sky-500/10 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-2 border border-amber-200/60">
            <Shield size={14} className="text-amber-600" />
            <span>Executive & FYB Intelligence Hub</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A2540] font-serif tracking-tight">
            Executive & FYB Directory
          </h1>
          <p className="text-gray-500 text-sm font-light mt-1 max-w-3xl">
            Access, view, search, and download complete 24-item questionnaires, dossiers, and yearbook rosters for graduating Executive and FYB brethren.
          </p>
        </div>

        {/* Global Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            disabled={isExportingCsv || filteredRecords.length === 0}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
            title="Download CSV / Excel spreadsheet with all 24 questionnaire fields"
          >
            <FileSpreadsheet size={16} />
            <span>{isExportingCsv ? 'Generating...' : 'Download Excel / CSV'}</span>
          </button>
          
          <button
            onClick={handleExportWordDoc}
            disabled={isExportingDoc || filteredRecords.length === 0}
            className="flex items-center space-x-2 bg-[#0A2540] hover:bg-[#0369A1] text-[#D4AF37] px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
            title="Download formatted Microsoft Word Yearbook Dossier"
          >
            <FileText size={16} />
            <span>{isExportingDoc ? 'Exporting...' : 'Download Word Dossier'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-[#0A2540] px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            title="Print or Save as PDF"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setCategoryFilter('all_exec_fyb')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'all_exec_fyb' 
              ? 'bg-gradient-to-br from-amber-500/15 to-sky-500/10 border-amber-400 shadow-md ring-2 ring-amber-400/30' 
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Executive FYBs</span>
            <Shield size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#0A2540] mt-2">{totalExecFybCount}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Graduating Officers</p>
        </div>

        <div 
          onClick={() => setCategoryFilter('all_fyb')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'all_fyb' 
              ? 'bg-gradient-to-br from-sky-500/15 to-blue-500/10 border-sky-400 shadow-md ring-2 ring-sky-400/30' 
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">All FYBs</span>
            <GraduationCap size={16} className="text-sky-500" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#0A2540] mt-2">{totalFybCount}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">All Finalist Brethren</p>
        </div>

        <div 
          onClick={() => setCategoryFilter('all_execs')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'all_execs' 
              ? 'bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border-indigo-400 shadow-md ring-2 ring-indigo-400/30' 
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700">All Executives</span>
            <Award size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#0A2540] mt-2">{totalExecsCount}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">Current & Past Leaders</p>
        </div>

        <div 
          onClick={() => setCategoryFilter('all_members')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            categoryFilter === 'all_members' 
              ? 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-400 shadow-md ring-2 ring-gray-400/30' 
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">Total Registry</span>
            <Users size={16} className="text-gray-500" />
          </div>
          <p className="text-2xl md:text-3xl font-black text-[#0A2540] mt-2">{records.length}</p>
          <p className="text-[10px] text-gray-400 font-medium mt-1">All Registered Members</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <div className="md:col-span-6 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, nickname, department, mentor, unit, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#0A2540] focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0A2540] focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Departments ({departments.length})</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Communication Tool (SMS & Emails) */}
          <div className="md:col-span-3 flex items-center space-x-2">
            <button
              onClick={handleCopyPhones}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-[#0A2540] py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              title="Copy all phone numbers for SMS broadcast"
            >
              {copiedPhones ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedPhones ? 'Copied' : 'SMS Phones'}</span>
            </button>
            <button
              onClick={handleCopyEmails}
              className="flex-1 flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-[#0A2540] py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer"
              title="Copy all email addresses"
            >
              {copiedEmails ? <Check size={14} className="text-emerald-600" /> : <Mail size={14} />}
              <span>{copiedEmails ? 'Copied' : 'Emails'}</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mr-2 flex items-center gap-1">
            <Filter size={12} /> Active View:
          </span>
          {[
            { id: 'all_exec_fyb', label: '⭐ Executive FYBs (Graduating Leaders)' },
            { id: 'all_fyb', label: '🎓 All Final Year Brethren (FYB)' },
            { id: 'all_execs', label: '🏛️ Fellowship Executives & Workers' },
            { id: 'all_members', label: '👥 Entire Fellowship Roster' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-[#0A2540] text-[#D4AF37] shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Results Table / Dossier Cards */}
      {loading ? (
        <div className="bg-white p-16 rounded-[2rem] text-center border border-gray-100 shadow-sm space-y-3">
          <RefreshCw size={28} className="animate-spin text-amber-500 mx-auto" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Syncing Executive & FYB Records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white p-16 rounded-[2rem] text-center border border-dashed border-gray-200 space-y-3">
          <Users size={36} className="text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-[#0A2540]">No brethren match the active criteria</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Try adjusting your search query or switching the category view from the tabs above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-2">
            <span>Showing {filteredRecords.length} records</span>
            <span>Click any card to expand full 24-question details</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredRecords.map((r) => {
              const isExpanded = expandedId === r.id;
              const cleanName = formatCleanFullName(r.full_name || 'UNNAMED MEMBER');
              const unitDisplay = r.church_position 
                ? `${r.church_role || 'Executive'} — ${r.church_position}` 
                : (r.unit_in_fellowship || r.church_role || 'Member');
              
              const isExec = (r.church_role && (r.church_role.toLowerCase() === 'executive' || r.church_role.toLowerCase() === 'worker')) || Boolean(r.church_position);

              return (
                <div
                  key={r.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Main Summary Header */}
                  <div className="p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left: Avatar & Basic Info */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A2540] to-sky-900 overflow-hidden border-2 border-amber-400 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt={cleanName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{cleanName.charAt(0) || 'M'}</span>
                          )}
                        </div>
                        {isExec && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow" title="Executive Officer">
                            ★
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h3 className="text-base font-extrabold text-[#0A2540] font-serif">
                            {cleanName}
                          </h3>
                          {r.nickname && (
                            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              "{r.nickname}"
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mt-1 flex-wrap">
                          <span className="text-[#0A2540] font-bold">{r.department || 'Department N/A'}</span>
                          <span>•</span>
                          <span className="text-amber-700 font-bold">{r.academic_level || 'Level N/A'}</span>
                          <span>•</span>
                          <span className="inline-flex items-center text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[10px] font-bold">
                            {unitDisplay}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Badges & Action Buttons */}
                    <div className="flex items-center space-x-2 self-end md:self-center">
                      <button
                        onClick={() => handleOpenFlyerGenerator(r.id)}
                        className="flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                        title="Open this member directly in FYB Flyer Generator"
                      >
                        <Sparkles size={14} />
                        <span>Make Flyer</span>
                      </button>

                      <button
                        onClick={() => setSelectedRecord(r)}
                        className="flex items-center space-x-1 bg-sky-50 hover:bg-sky-100 text-sky-800 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="View Complete 24 Questionnaire Dossier"
                      >
                        <Eye size={14} />
                        <span>Dossier</span>
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : r.id)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl transition-all cursor-pointer"
                        title="Toggle Accordion Details"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Accordion Expanded View: Displays exact template items in clean grid */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 md:p-8 space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                        <span className="text-xs font-black uppercase tracking-widest text-[#0A2540] flex items-center gap-1.5">
                          <BookOpen size={14} className="text-amber-500" />
                          <span>Official 24-Item Template Data Dossier</span>
                        </span>
                        <span className="text-[10px] text-gray-400">ID: {r.id.substring(0, 8)}...</span>
                      </div>

                      {/* 24-Question Clean Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        {/* 1. Full Name */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">1. Full Name</span>
                          <span className="font-extrabold text-[#0A2540]">{cleanName}</span>
                        </div>

                        {/* 2. Department */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">2. Department</span>
                          <span className="font-bold text-[#0A2540]">{r.department || 'N/A'}</span>
                        </div>

                        {/* 3. Level */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">3. Level</span>
                          <span className="font-bold text-[#0A2540]">{r.academic_level || 'N/A'}</span>
                        </div>

                        {/* 4. Unit in fellowship */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">4. Unit in fellowship</span>
                          <span className="font-bold text-[#0A2540]">{unitDisplay}</span>
                        </div>

                        {/* 5. DOB */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">5. DOB</span>
                          <span className="font-bold text-[#0A2540]">{r.dob || (r.date_of_birth ? new Date(r.date_of_birth).toLocaleDateString('en-GB') : 'N/A')}</span>
                        </div>

                        {/* 6. Nickname */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">6. Nickname</span>
                          <span className="font-bold text-amber-700">{r.nickname || 'N/A'}</span>
                        </div>

                        {/* 7. State of origin */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">7. State of origin</span>
                          <span className="font-bold text-[#0A2540]">{r.state_of_origin || 'N/A'}</span>
                        </div>

                        {/* 8. Home address */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">8. Home address</span>
                          <span className="font-medium text-gray-700">{r.home_address || r.contact_address || 'N/A'}</span>
                        </div>

                        {/* 9. Phone no(s) */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">9. Phone no(s)</span>
                          <span className="font-bold text-emerald-700">{r.phone_number || 'N/A'}</span>
                        </div>

                        {/* 10. Email */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">10. Email</span>
                          <span className="font-medium text-sky-800">{r.email || 'N/A'}</span>
                        </div>

                        {/* 11. Facebook name */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">11. Facebook name</span>
                          <span className="font-medium text-gray-700">{r.facebook_name || 'N/A'}</span>
                        </div>

                        {/* 12. View and desire about CACYOF */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 lg:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">12. Your view and desire about CACYOF</span>
                          <span className="font-medium text-gray-800 italic">"{r.view_and_desire_about_cacyof || 'N/A'}"</span>
                        </div>

                        {/* 13. Your mentor */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">13. Your mentor</span>
                          <span className="font-bold text-purple-800">{r.mentor_name || 'N/A'}</span>
                        </div>

                        {/* 14. Entrepreneur path */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">14. Entrepreneur path</span>
                          <span className="font-medium text-[#0A2540]">{r.entrepreneurship_path || 'N/A'}</span>
                        </div>

                        {/* 15. Your career */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">15. Your career</span>
                          <span className="font-bold text-emerald-800">{r.career_path || 'N/A'}</span>
                        </div>

                        {/* 16. Utmost desire from God */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 lg:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">16. Your utmost desire from God</span>
                          <span className="font-medium text-gray-800 italic">"{r.utmost_desire_from_god || 'N/A'}"</span>
                        </div>

                        {/* 17. Hobbies */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">17. Hobbies</span>
                          <span className="font-medium text-gray-700">{r.hobbies || 'N/A'}</span>
                        </div>

                        {/* 18. Favorite quote */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 lg:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">18. Favorite quote</span>
                          <span className="font-semibold text-amber-900 italic font-serif">“{r.favorite_quote || 'N/A'}”</span>
                        </div>

                        {/* 19. Favorite song */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">19. Favorite song</span>
                          <span className="font-medium text-gray-700">{r.favorite_song || 'N/A'}</span>
                        </div>

                        {/* 20. Favorite food */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">20. Favorite food</span>
                          <span className="font-medium text-gray-700">{r.favorite_food || 'N/A'}</span>
                        </div>

                        {/* 21. View about Life */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 lg:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">21. Your view about Life</span>
                          <span className="font-medium text-gray-800 italic">"{r.view_about_life || 'N/A'}"</span>
                        </div>

                        {/* 22. Word of advice */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100 lg:col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">22. Word of advice</span>
                          <span className="font-medium text-gray-800 italic">"{r.word_of_advice || 'N/A'}"</span>
                        </div>

                        {/* 23. Source of inspiration */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">23. Source of inspiration</span>
                          <span className="font-medium text-gray-700">{r.source_of_inspiration || 'N/A'}</span>
                        </div>

                        {/* 24. Marital status */}
                        <div className="bg-white p-3 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase block">24. Marital status</span>
                          <span className="font-bold text-[#0A2540]">{r.marital_status || 'Single'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Full Dossier Detail Popup */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-[#0A2540]/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] max-w-3xl w-full p-8 md:p-10 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#0A2540] overflow-hidden border-2 border-amber-400 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedRecord.avatar_url ? (
                    <img src={selectedRecord.avatar_url} alt={selectedRecord.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{formatCleanFullName(selectedRecord.full_name).charAt(0) || 'M'}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#0A2540] font-serif">
                    {formatCleanFullName(selectedRecord.full_name)}
                  </h2>
                  <p className="text-xs text-amber-700 font-bold">
                    {selectedRecord.department} ({selectedRecord.academic_level}) • {selectedRecord.church_position || selectedRecord.church_role || 'Member'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Complete 24 Questionnaire List */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl"><strong>1. Full Name:</strong> {formatCleanFullName(selectedRecord.full_name)}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>2. Department:</strong> {selectedRecord.department || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>3. Level:</strong> {selectedRecord.academic_level || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>4. Unit in fellowship:</strong> {selectedRecord.church_position || selectedRecord.unit_in_fellowship || selectedRecord.church_role || 'member'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>5. DOB:</strong> {selectedRecord.dob || (selectedRecord.date_of_birth ? new Date(selectedRecord.date_of_birth).toLocaleDateString('en-GB') : 'N/A')}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>6. Nickname:</strong> {selectedRecord.nickname || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>7. State of origin:</strong> {selectedRecord.state_of_origin || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>8. Home address:</strong> {selectedRecord.home_address || selectedRecord.contact_address || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>9. Phone no(s):</strong> {selectedRecord.phone_number || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>10. Email:</strong> {selectedRecord.email || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>11. Facebook name:</strong> {selectedRecord.facebook_name || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>13. Your mentor:</strong> {selectedRecord.mentor_name || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>14. Entrepreneur path:</strong> {selectedRecord.entrepreneurship_path || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>15. Your career:</strong> {selectedRecord.career_path || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>17. Hobbies:</strong> {selectedRecord.hobbies || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>19. Favorite song:</strong> {selectedRecord.favorite_song || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>20. Favorite food:</strong> {selectedRecord.favorite_food || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>23. Source of inspiration:</strong> {selectedRecord.source_of_inspiration || 'N/A'}</div>
                <div className="p-3 bg-gray-50 rounded-xl"><strong>24. Marital status:</strong> {selectedRecord.marital_status || 'Single'}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl"><strong>12. Your view and desire about CACYOF:</strong> {selectedRecord.view_and_desire_about_cacyof || 'N/A'}</div>
              <div className="p-3 bg-gray-50 rounded-xl"><strong>16. Your utmost desire from God:</strong> {selectedRecord.utmost_desire_from_god || 'N/A'}</div>
              <div className="p-3 bg-gray-50 rounded-xl"><strong>18. Favorite quote:</strong> “{selectedRecord.favorite_quote || 'N/A'}”</div>
              <div className="p-3 bg-gray-50 rounded-xl"><strong>21. Your view about Life:</strong> {selectedRecord.view_about_life || 'N/A'}</div>
              <div className="p-3 bg-gray-50 rounded-xl"><strong>22. Word of advice:</strong> {selectedRecord.word_of_advice || 'N/A'}</div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  const id = selectedRecord.id;
                  setSelectedRecord(null);
                  handleOpenFlyerGenerator(id);
                }}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                <Sparkles size={15} />
                <span>Create FYB Flyer</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
