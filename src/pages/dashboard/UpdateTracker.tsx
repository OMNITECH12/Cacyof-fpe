import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Download, 
  Check, 
  Phone, 
  Mail, 
  MessageSquare, 
  GraduationCap,
  RefreshCw,
  Eye,
  X,
  TrendingUp,
  Award
} from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from 'docx';
import { saveAs } from 'file-saver';

// Official 24-Questionnaire Item Definition
export const QUESTIONNAIRE_FIELDS = [
  { key: 'full_name', label: '1. Full Name', category: 'Academic & Personal' },
  { key: 'department', label: '2. Department', category: 'Academic & Personal' },
  { key: 'academic_level', label: '3. Level (ND1/ND2/HND1/HND2)', category: 'Academic & Personal' },
  { key: 'unit_in_fellowship', altKeys: ['church_position', 'church_role'], label: '4. Unit in Fellowship', category: 'Fellowship' },
  { key: 'dob', altKeys: ['date_of_birth'], label: '5. Date of Birth', category: 'Academic & Personal' },
  { key: 'nickname', label: '6. Nickname', category: 'Academic & Personal' },
  { key: 'state_of_origin', label: '7. State of Origin', category: 'Academic & Personal' },
  { key: 'home_address', altKeys: ['contact_address'], label: '8. Home Address', category: 'Contact' },
  { key: 'phone_number', label: '9. Phone Number', category: 'Contact' },
  { key: 'email', label: '10. Email Address', category: 'Contact' },
  { key: 'facebook_name', label: '11. Facebook Name', category: 'Contact' },
  { key: 'view_and_desire_about_cacyof', label: '12. View & Desire About CACYOF', category: 'Reflections' },
  { key: 'mentor_name', label: '13. Mentor in Ministry', category: 'Fellowship' },
  { key: 'entrepreneurship_path', label: '14. Entrepreneurship Path', category: 'Career & Aspiration' },
  { key: 'career_path', label: '15. Career Path', category: 'Career & Aspiration' },
  { key: 'utmost_desire_from_god', label: '16. Utmost Desire from God', category: 'Reflections' },
  { key: 'hobbies', label: '17. Hobbies', category: 'Lifestyle' },
  { key: 'favorite_quote', label: '18. Favorite Quote', category: 'Lifestyle' },
  { key: 'favorite_song', label: '19. Favorite Song', category: 'Lifestyle' },
  { key: 'favorite_food', label: '20. Favorite Food', category: 'Lifestyle' },
  { key: 'view_about_life', label: '21. View About Life', category: 'Reflections' },
  { key: 'word_of_advice', label: '22. Word of Advice', category: 'Reflections' },
  { key: 'source_of_inspiration', label: '23. Source of Inspiration', category: 'Reflections' },
  { key: 'marital_status', label: '24. Marital Status', category: 'Academic & Personal' },
] as const;

export interface MemberRecord {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
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
  updated_at?: string;
  role?: string;
  [key: string]: any;
}

export interface ProfileAuditResult {
  record: MemberRecord;
  completedCount: number;
  totalCount: number;
  percentage: number;
  status: 'complete' | 'mostly_complete' | 'in_progress' | 'pending';
  statusLabel: string;
  isFyb: boolean;
  isExec: boolean;
  missingFields: { key: string; label: string; category: string }[];
  filledFields: { key: string; label: string; category: string }[];
  hasAvatar: boolean;
  lastUpdatedDate: Date | null;
  lastUpdatedFormatted: string;
  relativeTime: string;
}

// Utility to calculate completeness
export function auditMemberProfile(member: MemberRecord): ProfileAuditResult {
  const missingFields: { key: string; label: string; category: string }[] = [];
  const filledFields: { key: string; label: string; category: string }[] = [];

  QUESTIONNAIRE_FIELDS.forEach((f) => {
    let val = member[f.key];
    if ((!val || String(val).trim() === '') && (f as any).altKeys) {
      for (const alt of (f as any).altKeys) {
        if (member[alt] && String(member[alt]).trim() !== '') {
          val = member[alt];
          break;
        }
      }
    }

    const cleanVal = val ? String(val).trim() : '';
    if (cleanVal && cleanVal.toUpperCase() !== 'N/A' && cleanVal !== 'undefined') {
      filledFields.push({ key: f.key, label: f.label, category: f.category });
    } else {
      missingFields.push({ key: f.key, label: f.label, category: f.category });
    }
  });

  const totalCount = QUESTIONNAIRE_FIELDS.length; // 24
  const completedCount = filledFields.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  let status: 'complete' | 'mostly_complete' | 'in_progress' | 'pending';
  let statusLabel: string;

  if (percentage >= 95) {
    status = 'complete';
    statusLabel = 'Fully Updated (Complete)';
  } else if (percentage >= 70) {
    status = 'mostly_complete';
    statusLabel = 'Mostly Updated (70%+)';
  } else if (percentage >= 30) {
    status = 'in_progress';
    statusLabel = 'In Progress (30-69%)';
  } else {
    status = 'pending';
    statusLabel = 'Pending / Not Updated';
  }

  const isFyb = member.student_status === 'FYB' || member.academic_level === 'HND2' || member.academic_level === 'ND2';
  const isExec = (member.church_role && member.church_role.toLowerCase() !== 'member') || Boolean(member.church_position && member.church_position.trim() !== '');

  const hasAvatar = Boolean(member.avatar_url && member.avatar_url.trim() !== '');

  // Calculate Last Updated
  const timestampStr = member.updated_at || member.created_at;
  let lastUpdatedDate: Date | null = null;
  let lastUpdatedFormatted = 'Never logged';
  let relativeTime = 'No record';

  if (timestampStr) {
    lastUpdatedDate = new Date(timestampStr);
    if (!isNaN(lastUpdatedDate.getTime())) {
      lastUpdatedFormatted = lastUpdatedDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      // Relative calculation
      const diffMs = Date.now() - lastUpdatedDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) {
        relativeTime = 'Just now';
      } else if (diffMins < 60) {
        relativeTime = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        relativeTime = `${diffHours}h ago`;
      } else if (diffDays === 1) {
        relativeTime = 'Yesterday';
      } else if (diffDays < 30) {
        relativeTime = `${diffDays}d ago`;
      } else {
        relativeTime = `${Math.floor(diffDays / 30)}mo ago`;
      }
    }
  }

  return {
    record: member,
    completedCount,
    totalCount,
    percentage,
    status,
    statusLabel,
    isFyb,
    isExec,
    missingFields,
    filledFields,
    hasAvatar,
    lastUpdatedDate,
    lastUpdatedFormatted,
    relativeTime,
  };
}

export default function UpdateTracker() {
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cohortFilter, setCohortFilter] = useState<'all' | 'fyb' | 'general' | 'execs' | 'alumni'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'mostly_complete' | 'in_progress' | 'pending'>('all');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'completion_desc' | 'completion_asc' | 'name'>('recent');
  const [selectedAudit, setSelectedAudit] = useState<ProfileAuditResult | null>(null);
  
  // Export & Action States
  const [copiedSMS, setCopiedSMS] = useState(false);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [isExportingDoc, setIsExportingDoc] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false, nullsFirst: false });

      if (data && !error) {
        setMembers(data as MemberRecord[]);
      }
    } catch (err) {
      console.error('Error loading member records for tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run audit evaluation on all members
  const auditedMembers = useMemo(() => {
    return members.map(auditMemberProfile);
  }, [members]);

  // Extract Departments for dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.department && m.department.trim()) {
        set.add(m.department.trim());
      }
    });
    return Array.from(set).sort();
  }, [members]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = auditedMembers.length;
    if (total === 0) {
      return {
        total: 0,
        fullyComplete: 0,
        fullyCompletePct: 0,
        mostlyComplete: 0,
        inProgress: 0,
        pending: 0,
        fybTotal: 0,
        fybUpdated: 0,
        fybUpdatedPct: 0,
        fybPending: 0,
        genTotal: 0,
        genUpdated: 0,
        genUpdatedPct: 0,
        genPending: 0,
        updatedLast24h: 0,
        updatedLast7d: 0,
      };
    }

    const fullyComplete = auditedMembers.filter((m) => m.status === 'complete').length;
    const mostlyComplete = auditedMembers.filter((m) => m.status === 'mostly_complete').length;
    const inProgress = auditedMembers.filter((m) => m.status === 'in_progress').length;
    const pending = auditedMembers.filter((m) => m.status === 'pending').length;

    // FYB metrics (status complete or mostly complete counts as updated)
    const fybList = auditedMembers.filter((m) => m.isFyb);
    const fybTotal = fybList.length;
    const fybUpdated = fybList.filter((m) => m.percentage >= 70).length;
    const fybUpdatedPct = fybTotal > 0 ? Math.round((fybUpdated / fybTotal) * 100) : 0;
    const fybPending = fybTotal - fybUpdated;

    // General (non-FYB) metrics
    const genList = auditedMembers.filter((m) => !m.isFyb);
    const genTotal = genList.length;
    const genUpdated = genList.filter((m) => m.percentage >= 70).length;
    const genUpdatedPct = genTotal > 0 ? Math.round((genUpdated / genTotal) * 100) : 0;
    const genPending = genTotal - genUpdated;

    // Time-based updates
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDayMs = 7 * 24 * 60 * 60 * 1000;

    const updatedLast24h = auditedMembers.filter(
      (m) => m.lastUpdatedDate && (now - m.lastUpdatedDate.getTime()) <= oneDayMs
    ).length;

    const updatedLast7d = auditedMembers.filter(
      (m) => m.lastUpdatedDate && (now - m.lastUpdatedDate.getTime()) <= sevenDayMs
    ).length;

    return {
      total,
      fullyComplete,
      fullyCompletePct: Math.round((fullyComplete / total) * 100),
      mostlyComplete,
      inProgress,
      pending,
      fybTotal,
      fybUpdated,
      fybUpdatedPct,
      fybPending,
      genTotal,
      genUpdated,
      genUpdatedPct,
      genPending,
      updatedLast24h,
      updatedLast7d,
    };
  }, [auditedMembers]);

  // Filtered and Sorted list
  const filteredList = useMemo(() => {
    let result = [...auditedMembers];

    // Cohort Filter
    if (cohortFilter === 'fyb') {
      result = result.filter((m) => m.isFyb);
    } else if (cohortFilter === 'general') {
      result = result.filter((m) => !m.isFyb && m.record.student_status !== 'Alumni');
    } else if (cohortFilter === 'execs') {
      result = result.filter((m) => m.isExec);
    } else if (cohortFilter === 'alumni') {
      result = result.filter((m) => m.record.student_status === 'Alumni');
    }

    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Department Filter
    if (departmentFilter !== 'All') {
      result = result.filter((m) => m.record.department === departmentFilter);
    }

    // Search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((m) => {
        const rec = m.record;
        return (
          rec.full_name?.toLowerCase().includes(term) ||
          rec.email?.toLowerCase().includes(term) ||
          rec.phone_number?.includes(term) ||
          rec.nickname?.toLowerCase().includes(term) ||
          rec.department?.toLowerCase().includes(term) ||
          rec.church_position?.toLowerCase().includes(term) ||
          rec.unit_in_fellowship?.toLowerCase().includes(term)
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = a.lastUpdatedDate?.getTime() || 0;
        const timeB = b.lastUpdatedDate?.getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'completion_desc') {
        return b.percentage - a.percentage;
      }
      if (sortBy === 'completion_asc') {
        return a.percentage - b.percentage;
      }
      if (sortBy === 'name') {
        return (a.record.full_name || '').localeCompare(b.record.full_name || '');
      }
      return 0;
    });

    return result;
  }, [auditedMembers, cohortFilter, statusFilter, departmentFilter, searchTerm, sortBy]);

  // Contact list extractors
  const getFilteredPhones = () => {
    return filteredList
      .map((item) => item.record.phone_number)
      .filter((p): p is string => Boolean(p && p.trim() !== ''))
      .join(', ');
  };

  const getFilteredEmails = () => {
    return filteredList
      .map((item) => item.record.email)
      .filter((e): e is string => Boolean(e && e.trim() !== ''))
      .join(', ');
  };

  const handleCopySMS = () => {
    const phones = getFilteredPhones();
    if (!phones) {
      alert('No valid phone numbers found under the active filter selection.');
      return;
    }
    navigator.clipboard.writeText(phones);
    setCopiedSMS(true);
    setTimeout(() => setCopiedSMS(false), 2500);
  };

  const handleCopyEmails = () => {
    const emails = getFilteredEmails();
    if (!emails) {
      alert('No emails found under the active filter selection.');
      return;
    }
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  // Direct WhatsApp Reminder Generator
  const generateWhatsAppLink = (item: ProfileAuditResult) => {
    const phone = item.record.phone_number?.replace(/[^0-9]/g, '') || '';
    if (!phone) return null;

    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '234' + phone.substring(1);
    }

    const firstName = item.record.full_name?.split(' ')[0] || 'Brethren';
    const isFyb = item.isFyb;
    const missingTop3 = item.missingFields.slice(0, 3).map((f) => f.label.replace(/^\d+\.\s*/, '')).join(', ');

    const text = encodeURIComponent(
      `Calvary greetings ${firstName}! 🙏\n\n` +
      `This is from CACYOF FPE Executive Secretariat. We are currently compiling the official ${isFyb ? 'FYB Yearbook Dossier' : 'Fellowship Membership Register'}.\n\n` +
      `Your profile is currently at *${item.percentage}% completion* (${item.missingFields.length} field(s) pending${missingTop3 ? `, e.g. ${missingTop3}` : ''}).\n\n` +
      `Kindly log in to your portal and update your complete 24-questionnaire information:\n` +
      `👉 ${window.location.origin}/dashboard/member\n\n` +
      `God bless you!`
    );

    return `https://wa.me/${formattedPhone}?text=${text}`;
  };

  // Comprehensive Word (.docx) Audit Report Generator
  const exportTrackingAuditDocx = async () => {
    try {
      setIsExportingDoc(true);
      const reportDate = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const docChildren: any[] = [
        new Paragraph({
          text: "CHRIST APOSTOLIC CHURCH YOUTH FELLOWSHIP (CACYOF)",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          text: "FEDERAL POLYTECHNIC EDE CHAPTER",
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ 
              text: `OFFICIAL INFORMATION UPDATE & QUESTIONNAIRE TRACKING AUDIT REPORT`, 
              bold: true, 
              size: 24, 
              color: "0A2540" 
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 }
        }),
        new Paragraph({
          text: `Audit Compiled On: ${reportDate} | Total Profile Records: ${filteredList.length}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 350 }
        }),
        // Executive Summary Paragraph
        new Paragraph({
          children: [
            new TextRun({ text: "EXECUTIVE TRACKING SUMMARY:", bold: true, color: "D4AF37" }),
          ],
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: `• Overall Registry: ${metrics.total} Registered Profiles\n` +
                `• Fully Complete (100%): ${metrics.fullyComplete} (${metrics.fullyCompletePct}%)\n` +
                `• FYB Finalists: ${metrics.fybUpdated} of ${metrics.fybTotal} Updated (${metrics.fybUpdatedPct}% Complete, ${metrics.fybPending} Pending)\n` +
                `• General Fellowship Members: ${metrics.genUpdated} of ${metrics.genTotal} Updated (${metrics.genUpdatedPct}% Complete, ${metrics.genPending} Pending)\n` +
                `• Recent Activity: ${metrics.updatedLast24h} updated in last 24 hours | ${metrics.updatedLast7d} in last 7 days`,
          spacing: { after: 300 }
        }),
      ];

      // Build Table of Profiles with Tracking Details
      const tableRows: TableRow[] = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "S/N", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full Name", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cohort & Dept", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Phone / Contact", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Progress %", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Status", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Missing Key Fields", bold: true })] })] }),
          ]
        })
      ];

      filteredList.forEach((item, index) => {
        const topMissing = item.missingFields.length > 0 
          ? item.missingFields.slice(0, 4).map(f => f.label.replace(/^\d+\.\s*/, '')).join(', ') + (item.missingFields.length > 4 ? ` (+${item.missingFields.length - 4} more)` : '')
          : 'None (All 24 Complete)';

        tableRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: String(index + 1) })] }),
              new TableCell({ children: [new Paragraph({ text: item.record.full_name || 'N/A' })] }),
              new TableCell({ children: [new Paragraph({ text: `${item.isFyb ? '[FYB] ' : ''}${item.record.department || 'N/A'} (${item.record.academic_level || 'N/A'})` })] }),
              new TableCell({ children: [new Paragraph({ text: item.record.phone_number || item.record.email || 'N/A' })] }),
              new TableCell({ children: [new Paragraph({ text: `${item.percentage}% (${item.completedCount}/24)` })] }),
              new TableCell({ children: [new Paragraph({ text: item.statusLabel })] }),
              new TableCell({ children: [new Paragraph({ text: topMissing })] }),
            ]
          })
        );
      });

      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows
        })
      );

      const doc = new Document({
        sections: [{
          properties: {},
          children: docChildren,
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `CACYOF_Information_Update_Audit_${cohortFilter.toUpperCase()}_${new Date().toISOString().split('T')[0]}.docx`);
    } catch (err) {
      console.error('Error generating tracking Word doc:', err);
      alert('Failed to compile Word audit report.');
    } finally {
      setIsExportingDoc(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#D4AF37]/10 text-[#0A2540] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-[#D4AF37]/30">
            <CheckCircle2 size={15} className="text-[#D4AF37]" />
            <span>Fellowship Real-Time Intelligence & Audit</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#0A2540] font-serif tracking-tight">
            Information Update Tracking Center
          </h1>
          <p className="text-gray-500 text-sm font-light mt-1">
            Monitor real-time profile completion, track FYB & general fellowship questionnaire updates, and trigger automated follow-ups.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchMembers}
            disabled={loading}
            className="flex items-center space-x-2 bg-white border border-gray-200 hover:border-[#D4AF37] text-[#0A2540] px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#D4AF37]' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportTrackingAuditDocx}
            disabled={isExportingDoc || filteredList.length === 0}
            className="flex items-center space-x-2 bg-[#0A2540] text-[#D4AF37] hover:bg-[#0A2540]/90 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Download size={15} />
            <span>{isExportingDoc ? 'Building Report...' : 'Export Audit Report (.docx)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Dashboard Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Overall Fellowship Progress */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Total Registry</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#0A2540]">{metrics.total}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              <span className="text-emerald-600 font-bold">{metrics.fullyComplete}</span> fully complete (100%)
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.fullyCompletePct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: FYB Finalists Update Tracker */}
        <div className="bg-gradient-to-br from-[#0A2540] to-[#163a5f] p-6 rounded-2xl text-white shadow-lg shadow-[#0A2540]/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#D4AF37]">FYB Finalists</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#D4AF37] flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white">{metrics.fybUpdated}</span>
              <span className="text-sm font-semibold text-white/60">/ {metrics.fybTotal} Finalists</span>
            </div>
            <div className="text-xs text-amber-200 mt-1 font-semibold flex items-center space-x-1">
              <span>{metrics.fybUpdatedPct}% Complete</span>
              <span>•</span>
              <span className="text-rose-300">{metrics.fybPending} Pending</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#D4AF37] h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.fybUpdatedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: General Members Update Tracker */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">General Fellowship</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-[#0A2540]">{metrics.genUpdated}</span>
              <span className="text-sm font-semibold text-gray-400">/ {metrics.genTotal} Members</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              <span className="text-purple-600 font-bold">{metrics.genUpdatedPct}% Complete</span> • <span className="text-rose-500">{metrics.genPending} Pending</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.genUpdatedPct}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Real-Time Activity & Velocity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">Update Velocity</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-amber-600">+{metrics.updatedLast24h}</div>
            <div className="text-xs text-gray-500 mt-1 font-medium">
              Updated in last 24h • <span className="font-bold text-[#0A2540]">+{metrics.updatedLast7d}</span> this week
            </div>
          </div>
          <div className="mt-3 text-[10px] text-gray-400 font-medium">
            Live database sync enabled
          </div>
        </div>
      </div>

      {/* Cohort Tabs & Quick Segment Selector */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Cohort Pill Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Profiles', count: metrics.total },
              { id: 'fyb', label: '🎓 FYB Finalists', count: metrics.fybTotal },
              { id: 'general', label: '🌱 General Members', count: metrics.genTotal },
              { id: 'execs', label: '🛡️ Leaders / Execs', count: auditedMembers.filter(m => m.isExec).length },
              { id: 'alumni', label: '📜 Alumni', count: auditedMembers.filter(m => m.record.student_status === 'Alumni').length },
            ].map((tab) => {
              const active = cohortFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCohortFilter(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0A2540] text-[#D4AF37] shadow-md shadow-[#0A2540]/10'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    active ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Broadcast Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySMS}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all border border-amber-200 cursor-pointer"
              title="Copy SMS phone numbers for currently filtered view"
            >
              {copiedSMS ? <Check size={14} className="text-green-600" /> : <Phone size={14} />}
              <span>{copiedSMS ? 'Phones Copied!' : 'Copy Filtered Phones'}</span>
            </button>

            <button
              onClick={handleCopyEmails}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all border border-blue-200 cursor-pointer"
              title="Copy emails for mass reminder"
            >
              {copiedEmails ? <Check size={14} className="text-green-600" /> : <Mail size={14} />}
              <span>{copiedEmails ? 'Emails Copied!' : 'Copy Emails'}</span>
            </button>
          </div>
        </div>

        {/* Detailed Search & Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-gray-100">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              type="text"
              placeholder="Search by name, phone, email, nickname, or office..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white transition-all"
            />
          </div>

          {/* Completion Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0A2540] outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              <option value="all">⚡ All Statuses</option>
              <option value="complete">🟢 Fully Updated (100%)</option>
              <option value="mostly_complete">🔵 Mostly Updated (70-94%)</option>
              <option value="in_progress">🟡 In Progress (30-69%)</option>
              <option value="pending">🔴 Pending / Stale (&lt; 30%)</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="md:col-span-2">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0A2540] outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0A2540] outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
            >
              <option value="recent">⏱️ Most Recently Updated</option>
              <option value="completion_desc">📈 Highest Completion %</option>
              <option value="completion_asc">📉 Lowest Completion %</option>
              <option value="name">🔤 Full Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Tracking Data Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-[#0A2540]/5 overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Showing <span className="text-[#0A2540] font-black">{filteredList.length}</span> Members
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-400 font-medium">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Complete (95%+)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>In Progress</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              <span>Pending (&lt;30%)</span>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/70 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Member Identity</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Cohort & Office</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">24-Questionnaire Progress</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Last Active Update</th>
                <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 text-center">Follow-Up Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <RefreshCw className="animate-spin inline text-[#D4AF37]" size={28} />
                    <p className="text-xs text-gray-400 mt-2 font-medium">Auditing database records...</p>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-light italic">
                    No members match the selected tracking filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const m = item.record;
                  const waLink = generateWhatsAppLink(item);

                  let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  let barColor = 'bg-rose-500';

                  if (item.status === 'complete') {
                    badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    barColor = 'bg-emerald-500';
                  } else if (item.status === 'mostly_complete') {
                    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    barColor = 'bg-blue-500';
                  } else if (item.status === 'in_progress') {
                    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                    barColor = 'bg-amber-500';
                  }

                  return (
                    <tr key={m.id} className="hover:bg-amber-50/20 transition-colors">
                      {/* Column 1: Member Identity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3.5">
                          {m.avatar_url ? (
                            <img
                              src={m.avatar_url}
                              alt={m.full_name}
                              className="w-11 h-11 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#0A2540]/10 text-[#0A2540] flex items-center justify-center font-bold text-sm shrink-0">
                              {m.full_name?.[0] || 'M'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-extrabold text-[#0A2540] text-sm flex items-center space-x-1.5">
                              <span className="truncate">{m.full_name}</span>
                              {m.nickname && (
                                <span className="text-xs text-gray-400 font-medium shrink-0">({m.nickname})</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {m.email} {m.phone_number && `• ${m.phone_number}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Cohort & Office */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-[#0A2540] truncate max-w-[200px]">
                          {m.department || 'No department'}
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center mt-1">
                          {item.isFyb && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[9px] font-black uppercase tracking-wider">
                              🎓 FYB Finalist
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase">
                            {m.academic_level || 'N/A'}
                          </span>
                          {m.church_position && (
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[9px] font-bold uppercase truncate max-w-[140px]">
                              {m.church_position}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 3: 24-Questionnaire Progress */}
                      <td className="px-6 py-4">
                        <div className="w-48">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${badgeColor}`}>
                              {item.percentage}% ({item.completedCount}/24)
                            </span>
                            <button
                              onClick={() => setSelectedAudit(item)}
                              className="text-[10px] text-gray-400 hover:text-[#0A2540] font-bold underline cursor-pointer"
                            >
                              {item.missingFields.length > 0 ? `${item.missingFields.length} missing` : 'All filled'}
                            </button>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${barColor}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Last Active Update Timestamp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0A2540]">
                          <Clock size={13} className="text-gray-400 shrink-0" />
                          <span>{item.relativeTime}</span>
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {item.lastUpdatedFormatted}
                        </div>
                      </td>

                      {/* Column 5: Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          {/* WhatsApp Reminder Button */}
                          {waLink ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                              title="Send 1-Click WhatsApp Profile Update Reminder"
                            >
                              <MessageSquare size={16} />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="p-2 rounded-xl bg-gray-50 text-gray-300 cursor-not-allowed"
                              title="No phone number available"
                            >
                              <MessageSquare size={16} />
                            </button>
                          )}

                          {/* Inspect Missing Fields Checklist Modal */}
                          <button
                            onClick={() => setSelectedAudit(item)}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm cursor-pointer"
                            title="Inspect 24-Field Details & Missing Items"
                          >
                            <Eye size={16} />
                          </button>

                          {/* If FYB, link directly to flyer generator */}
                          {item.isFyb && (
                            <Link
                              to="/dashboard/admin/fyb-flyer"
                              className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                              title="Open in FYB Flyer Studio"
                            >
                              <Sparkles size={16} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Missing Fields & Questionnaire Audit Modal */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100"
            >
              {/* Modal Header */}
              <div className="p-6 bg-[#0A2540] text-white flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  {selectedAudit.record.avatar_url ? (
                    <img
                      src={selectedAudit.record.avatar_url}
                      alt={selectedAudit.record.full_name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-[#D4AF37]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-lg">
                      {selectedAudit.record.full_name?.[0] || 'M'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-black">{selectedAudit.record.full_name}</h3>
                    <p className="text-xs text-amber-200">
                      {selectedAudit.isFyb ? '🎓 FYB Finalist • ' : ''}{selectedAudit.record.department || 'General'} • {selectedAudit.percentage}% Complete
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="p-2 text-white/60 hover:text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: 24-Questionnaire Checklist */}
              <div className="p-6 overflow-y-auto space-y-6 flex-grow">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Completed</span>
                    <span className="text-xl font-black text-emerald-600">{selectedAudit.completedCount} / 24</span>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-800 block">Missing</span>
                    <span className="text-xl font-black text-rose-600">{selectedAudit.missingFields.length}</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 block">Last Active</span>
                    <span className="text-xs font-bold text-blue-900 block mt-1">{selectedAudit.relativeTime}</span>
                  </div>
                </div>

                {/* 24-Field Breakdown List */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">
                    24 Questionnaire Fields Status
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUESTIONNAIRE_FIELDS.map((f) => {
                      const isFilled = selectedAudit.filledFields.some((item) => item.key === f.key);
                      const rawVal = selectedAudit.record[f.key] || 
                                     ((f as any).altKeys ? (f as any).altKeys.map((k: string) => selectedAudit.record[k]).find(Boolean) : '');

                      return (
                        <div
                          key={f.key}
                          className={`p-2.5 rounded-xl border flex items-start space-x-2.5 ${
                            isFilled
                              ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-950'
                              : 'bg-rose-50/50 border-rose-200/60 text-rose-950'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {isFilled ? (
                              <CheckCircle2 size={15} className="text-emerald-600" />
                            ) : (
                              <AlertCircle size={15} className="text-rose-500" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-black truncate">{f.label}</div>
                            <div className={`text-[10px] truncate ${isFilled ? 'text-gray-600' : 'text-rose-500 italic'}`}>
                              {isFilled ? String(rawVal) : 'Not filled yet'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Phone: <span className="font-bold text-[#0A2540]">{selectedAudit.record.phone_number || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {generateWhatsAppLink(selectedAudit) && (
                    <a
                      href={generateWhatsAppLink(selectedAudit)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      <MessageSquare size={14} />
                      <span>Send WhatsApp Reminder</span>
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedAudit(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
